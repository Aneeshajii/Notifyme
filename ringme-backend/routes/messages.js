const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/messages/send
router.post('/send', async (req, res) => {
    try {
        const { tagId, content, senderInfo, scannerId, senderRole } = req.body;
        let tag = await prisma.tag.findUnique({ where: { tagId: tagId } });
        if (!tag) {
            tag = await prisma.tag.findUnique({ where: { id: tagId } });
        }
        if (!tag) return res.status(404).json({ message: 'Tag not found' });
        
        let conversationId = req.body.conversationId;
        let conv = null;
        
        if (senderRole !== 'owner') {
            const isBlocked = await prisma.blockedScanner.findUnique({
                where: { ownerId_scannerId: { ownerId: tag.ownerId, scannerId: scannerId || "anonymous" } }
            });
            if (isBlocked) {
                return res.status(403).json({ error: 'You have been blocked by the owner and cannot send messages.' });
            }
        }

        if (conversationId) {
            conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
        } else {
            conv = await prisma.conversation.findFirst({
                where: { tagId: tag.id, scannerId: scannerId || "anonymous" }
            });
            if (!conv) {
                conv = await prisma.conversation.create({
                    data: { tagId: tag.id, scannerId: scannerId || "anonymous" }
                });
            }
            conversationId = conv.id;
        }

        if (conv && conv.status === 'closed') {
            return res.status(400).json({ error: 'This conversation has been closed and cannot accept new messages.' });
        }

        const msg = await prisma.message.create({
            data: {
                tagId: tag.id,
                content,
                senderInfo: senderInfo || "Anonymous",
                senderRole: senderRole || "scanner",
                conversationId
            }
        });

        const io = req.app.get('io');
        if (io) {
            io.emit(`conversation-${conversationId}`, msg);
            io.emit(`user-${tag.ownerId}-new-message`, msg);
        }

        res.status(201).json({ message: 'Message sent successfully!', messageData: msg, conversationId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/conversations/user/:userId
router.get('/conversations/user/:userId', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({ where: { ownerId: req.params.userId } });
        const tagIds = tags.map(t => t.id);

        const conversations = await prisma.conversation.findMany({
            where: { tagId: { in: tagIds } },
            include: { 
                tag: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { startedAt: 'desc' }
        });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/conversation/:conversationId
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: { conversationId: req.params.conversationId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/scanner/:tagId/:scannerId
router.get('/scanner/:tagId/:scannerId', async (req, res) => {
    try {
        let tag = await prisma.tag.findUnique({ where: { tagId: req.params.tagId } });
        if (!tag) {
            tag = await prisma.tag.findUnique({ where: { id: req.params.tagId } });
        }
        if (!tag) return res.status(404).json({ message: 'Tag not found' });

        const conv = await prisma.conversation.findFirst({
            where: { tagId: tag.id, scannerId: req.params.scannerId }
        });

        if (!conv) return res.json([]);

        const messages = await prisma.message.findMany({
            where: { conversationId: conv.id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/messages/admin/direct
router.post('/admin/direct', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    const userTags = await prisma.tag.findMany({ where: { ownerId: userId } });
    if (userTags.length === 0) {
      return res.status(400).json({ message: 'User has no active tags to receive messages.' });
    }
    
    let conv = await prisma.conversation.findFirst({
        where: { tagId: userTags[0].id, scannerId: "ADMIN" }
    });
    if (!conv) {
        conv = await prisma.conversation.create({
            data: { tagId: userTags[0].id, scannerId: "ADMIN" }
        });
    }

    const msg = await prisma.message.create({
      data: {
        tagId: userTags[0].id,
        content,
        senderInfo: 'System Admin',
        senderRole: 'owner',
        conversationId: conv.id
      }
    });
    
    const io = req.app.get('io');
    if (io) {
        io.emit(`conversation-${conv.id}`, msg);
        io.emit(`user-${userId}-new-message`, msg);
    }

    res.status(201).json({ message: 'Direct message sent to user inbox' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({ where: { ownerId: req.params.userId } });
        const tagIds = tags.map(t => t.id);

        const messages = await prisma.message.findMany({
            where: { tagId: { in: tagIds } },
            include: { tag: true, conversation: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.message.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/messages/conversation/:id
router.delete('/conversation/:id', verifyToken, async (req, res) => {
  try {
    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id }, include: { tag: true } });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (conv.tag.ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.conversation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/block
router.post('/block', verifyToken, async (req, res) => {
  try {
    const { scannerId } = req.body;
    if (scannerId === 'ADMIN') return res.status(403).json({ error: 'Cannot block Master Admin' });

    await prisma.blockedScanner.upsert({
      where: { ownerId_scannerId: { ownerId: req.user.id, scannerId } },
      update: {},
      create: { ownerId: req.user.id, scannerId }
    });
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/unblock
router.post('/unblock', verifyToken, async (req, res) => {
  try {
    const { scannerId } = req.body;
    await prisma.blockedScanner.delete({
      where: { ownerId_scannerId: { ownerId: req.user.id, scannerId } }
    });
    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.json({ message: 'User unblocked' });
  }
});

// GET /api/messages/blocked
router.get('/blocked', verifyToken, async (req, res) => {
  try {
    const blocked = await prisma.blockedScanner.findMany({ where: { ownerId: req.user.id } });
    res.json(blocked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/conversation/:id/status
router.post('/conversation/:id/status', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const conv = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    const io = req.app.get('io');
    if (io) {
      io.emit(`conversation-${conv.id}`, { action: 'status_changed', status });
    }
    
    res.json({ message: `Conversation ${status}`, conversation: conv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
