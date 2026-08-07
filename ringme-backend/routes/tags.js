const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');

const generateTagId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const SIGNING_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-qr';

const signTagId = (tagId) => {
    return crypto.createHmac('sha256', SIGNING_SECRET).update(tagId).digest('hex').substring(0, 16);
};

const getScanUrl = (tagId) => {
    const signature = signTagId(tagId);
    return `http://localhost:5173/tag/${tagId}?sig=${signature}`;
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
    const signature = signTagId(tagId);
    const scanUrl = `http://localhost:5173/tag/${tagId}?sig=${signature}`;
    
    const qrCodeDataUrl = await qrcode.toDataURL(scanUrl, {
        color: { dark: '#171a21', light: '#ffffff' },
        margin: 2
    });

    const newTag = await prisma.tag.create({
      data: {
        tagId,
        ownerId,
        name,
        plateNumber,
        qrCodeDataUrl,
        status: 'active'
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

// GET /api/tags/:tagId
router.get('/:tagId', async (req, res) => {
  try {
    const { tagId } = req.params;
    const { sig } = req.query; // Scanner will send ?sig=...

    if (!sig) {
        // We enforce signature for production security
        return res.status(403).json({ error: 'Missing security signature. QR Code may be forged.' });
    }

    const expectedSig = signTagId(tagId);
    if (sig !== expectedSig) {
        return res.status(403).json({ error: 'Invalid security signature. QR Code tampering detected.' });
    }

    const tag = await prisma.tag.findUnique({
      where: { tagId },
      include: {
        owner: {
          select: { name: true, phone: true }
        }
      }
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found or invalid' });
    }
    
    if (tag.status === 'dnd' || tag.status === 'paused') {
      return res.status(403).json({ message: 'Owner is currently unavailable or Tag is paused.', placeholderMessage: tag.placeholderMessage });
    }

    if (tag.owner.isBlocked) {
      return res.status(403).json({ message: 'This account has been suspended by the administrator.', placeholderMessage: tag.placeholderMessage });
    }

    res.json({
        tagId: tag.tagId,
        name: tag.name,
        plateNumber: tag.plateNumber,
        status: tag.status,
        ownerName: tag.owner.name,
        isPremium: tag.owner.isPremium,
        placeholderMessage: tag.placeholderMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/user/:ownerId
router.get('/user/:ownerId', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { ownerId: req.params.ownerId }
    });
    // Append scanUrl for testing purposes
    const tagsWithUrl = tags.map(t => ({ ...t, scanUrl: getScanUrl(t.tagId) }));
    res.json(tagsWithUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/admin/all
router.get('/admin/all', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { owner: true }
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
