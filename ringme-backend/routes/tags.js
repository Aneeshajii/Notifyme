const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');

const rateLimit = require('express-rate-limit');

const generateTagId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Rate limiter for QR scans
const qrScanLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per window
    message: { error: 'Too many QR scan attempts from this IP, please try again later.' }
});

const getScanUrl = (uuid) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    return `${frontendUrl}/scan/${uuid}`;
};

// POST /api/tags/create
router.post('/create', async (req, res) => {
  try {
    const { ownerId, name, plateNumber } = req.body;
    
    // Check Subscription Limits
    const user = await prisma.user.findUnique({
        where: { id: ownerId },
        include: { subscription: true }
    });
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const maxQrCodes = user.subscription ? user.subscription.maxQrCodes : 1;
    
    const existingTagsCount = await prisma.tag.count({
        where: { ownerId }
    });
    
    if (existingTagsCount >= maxQrCodes) {
        return res.status(403).json({ 
            message: `Limit reached. Your current subscription only allows ${maxQrCodes} QR code(s). Please upgrade to create more.` 
        });
    }

    const tagId = generateTagId();
    const uuid = crypto.randomUUID();
    const scanUrl = getScanUrl(uuid);
    
    const qrCodeDataUrl = await qrcode.toDataURL(scanUrl, {
        color: { dark: '#171a21', light: '#ffffff' },
        margin: 2
    });

    const newTag = await prisma.tag.create({
      data: {
        id: uuid,
        tagId,
        ownerId,
        name,
        plateNumber,
        qrCodeDataUrl,
        status: 'active'
      }
    });

    await prisma.auditLog.create({
        data: {
            adminId: ownerId,
            action: 'QR_CREATED',
            entityId: ownerId,
            details: JSON.stringify({ tagId: newTag.tagId, name: newTag.name }),
            ipAddress: req.ip || req.socket.remoteAddress
        }
    });
    
    res.status(201).json({ 
        message: 'QR Code created successfully', 
        tag: newTag,
        scanUrl 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/:uuid
router.get('/:uuid', qrScanLimiter, async (req, res) => {
  try {
    const { uuid } = req.params;
    const scannerId = req.headers['x-scanner-id'];

    const tag = await prisma.tag.findUnique({
      where: { id: uuid },
      include: {
        owner: {
          select: { id: true, name: true, phone: true, isBlocked: true, isPremium: true }
        }
      }
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'This QR code is invalid or no longer exists.' });
    }
    
    if (tag.status === 'dnd' || tag.status === 'paused' || !tag.isActive) {
      return res.status(403).json({ message: 'The owner of this item is currently unavailable.', placeholderMessage: tag.placeholderMessage });
    }

    if (tag.owner.isBlocked) {
      return res.status(403).json({ message: 'This account is currently unavailable.' });
    }

    if (scannerId) {
        const isScannerBlocked = await prisma.blockedScanner.findFirst({
            where: { ownerId: tag.owner.id, scannerId }
        });
        if (isScannerBlocked) {
            return res.status(403).json({ message: 'You are blocked from communicating with this owner.' });
        }
    }

    res.json({
        id: tag.id,
        name: tag.name,
        status: tag.status,
        ownerName: tag.owner.name,
        isPremium: tag.owner.isPremium,
        placeholderMessage: tag.placeholderMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

// GET /api/tags/user/:ownerId
router.get('/user/:ownerId', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { ownerId: req.params.ownerId }
    });
    // Append scanUrl for testing purposes
    const tagsWithUrl = tags.map(t => ({ ...t, scanUrl: getScanUrl(t.id) }));
    res.json(tagsWithUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/admin/all
router.get('/admin/all', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { 
          owner: true,
          _count: {
              select: { scans: true }
          }
      }
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tags/admin/:tagId/status
router.post('/admin/:tagId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const tag = await prisma.tag.update({
      where: { tagId: req.params.tagId },
      data: { status }
    });

    await prisma.auditLog.create({
        data: {
            adminId: req.user ? req.user.id : 'SYSTEM',
            action: status === 'active' ? 'QR_ACTIVATED' : (status === 'paused' ? 'QR_PAUSED' : 'QR_STATUS_CHANGED'),
            entityId: tag.ownerId,
            details: JSON.stringify({ tagId: tag.tagId, status }),
            ipAddress: req.ip || req.socket.remoteAddress
        }
    });

    res.json({ message: `Tag status updated to ${status}`, tag });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tags/admin/:tagId/placeholder
router.post('/admin/:tagId/placeholder', async (req, res) => {
  try {
    const { placeholderMessage } = req.body;
    const tag = await prisma.tag.update({
      where: { tagId: req.params.tagId },
      data: { placeholderMessage }
    });

    await prisma.auditLog.create({
        data: {
            adminId: req.user ? req.user.id : 'SYSTEM',
            action: 'QR_RENAMED',
            entityId: tag.ownerId,
            details: JSON.stringify({ tagId: tag.tagId, placeholderMessage }),
            ipAddress: req.ip || req.socket.remoteAddress
        }
    });

    res.json({ message: 'Placeholder message updated', tag });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tags/admin/:tagId
router.delete('/admin/:tagId', async (req, res) => {
  try {
    const tag = await prisma.tag.findUnique({ where: { tagId: req.params.tagId } });
    if (!tag) {
        return res.status(404).json({ message: 'Tag not found' });
    }

    // Delete associated messages and logs first if any exist (SQLite constraint) using the UUID tag.id
    await prisma.message.deleteMany({ where: { tagId: tag.id } });
    await prisma.scanHistory.deleteMany({ where: { tagId: tag.id } });
    
    await prisma.tag.delete({
      where: { id: tag.id }
    });

    await prisma.auditLog.create({
        data: {
            adminId: req.user ? req.user.id : 'SYSTEM',
            action: 'QR_DELETED',
            entityId: tag.ownerId,
            details: JSON.stringify({ tagId: tag.tagId, name: tag.name }),
            ipAddress: req.ip || req.socket.remoteAddress
        }
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tags/:id
// Owner edits a tag (rename, toggle active)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const tag = await prisma.tag.findUnique({ where: { id: req.params.id } });
        if (!tag || tag.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to edit this tag.' });
        }
        
        const { name, isActive, status } = req.body;
        
        const updatedTag = await prisma.tag.update({
            where: { id: req.params.id },
            data: {
                name: name !== undefined ? name : tag.name,
                isActive: isActive !== undefined ? isActive : tag.isActive,
                status: status !== undefined ? status : tag.status
            }
        });
        
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'QR_RENAMED',
                entityId: req.user.id,
                details: JSON.stringify({ tagId: updatedTag.tagId, name: updatedTag.name, status: updatedTag.status }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });

        res.json(updatedTag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tags/admin/scans
// Master Admin views all scans
router.get('/admin/scans', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        const scans = await prisma.scanHistory.findMany({
            include: { tag: true },
            orderBy: { scannedAt: 'desc' },
            take: 100
        });
        res.json(scans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tags/scans
// Get scan history for the current user's tags
router.get('/scans', verifyToken, async (req, res) => {
    try {
        const userTags = await prisma.tag.findMany({ where: { ownerId: req.user.id } });
        const tagIds = userTags.map(t => t.id);

        const scans = await prisma.scanHistory.findMany({
            where: { tagId: { in: tagIds } },
            include: { tag: true },
            orderBy: { scannedAt: 'desc' },
            take: 100
        });
        res.json(scans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
