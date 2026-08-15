const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

// POST /api/calls/log
router.post('/log', async (req, res) => {
    try {
        const { tagId, status, duration, callerId } = req.body;
        // tagId is likely the 6-char public ID, find the real ID
        let tag = await prisma.tag.findUnique({ where: { tagId: tagId } });
        if (!tag) {
            tag = await prisma.tag.findUnique({ where: { id: tagId } });
        }
        if (!tag) return res.status(404).json({ message: 'Tag not found' });

        const log = await prisma.callLog.create({
            data: {
                tagId: tag.id,
                status: status || 'completed',
                duration: duration || null,
                callerId: callerId || 'anonymous'
            }
        });

        // Inject Call Event into Chat
        let conv = await prisma.conversation.findFirst({
            where: { tagId: tag.id, scannerId: callerId || "anonymous" }
        });
        if (!conv) {
            conv = await prisma.conversation.create({
                data: { tagId: tag.id, scannerId: callerId || "anonymous" }
            });
        }
        const msg = await prisma.message.create({
            data: {
                tagId: tag.id,
                content: JSON.stringify({ type: status, duration: duration || 0 }),
                senderInfo: 'System',
                senderRole: 'scanner',
                mediaType: 'call_event',
                conversationId: conv.id
            }
        });
        
        const io = req.app.get('io');
        if (io) {
            io.emit(`conversation-${conv.id}`, msg);
            io.emit(`user-${tag.ownerId}-new-message`, msg);
        }

        res.status(201).json({ message: 'Call logged successfully', log });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/calls/user
router.get('/user', verifyToken, async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({ where: { ownerId: req.user.id } });
        const tagIds = tags.map(t => t.id);

        const logs = await prisma.callLog.findMany({
            where: { tagId: { in: tagIds } },
            include: { tag: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
