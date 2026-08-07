const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken } = require('../middleware/auth');

// POST /api/notifications
// Create a new notification (e.g. Security Event, New Login)
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
    
    // Optional: Emit via Socket.io if active
    const io = req.app.get('io');
    if (io) {
        io.emit(`user-${userId}-notification`, notification);
    }
    
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications
// Get all notifications for the authenticated user
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
