const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/tickets (Admin)
router.get('/', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // fetch user names for tickets
        const ticketsWithUsers = await Promise.all(tickets.map(async t => {
            const user = await prisma.user.findUnique({ where: { id: t.userId }, select: { name: true, email: true } });
            return { ...t, user: user ? user.name || user.email : 'Unknown' };
        }));
        res.json(ticketsWithUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tickets/my (User)
router.get('/my', verifyToken, async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tickets
router.post('/', verifyToken, async (req, res) => {
    try {
        const { subject, description, priority } = req.body;
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: req.user.id,
                subject,
                description,
                priority: priority || 'medium'
            }
        });
        
        const io = req.app.get('io');
        if (io) {
            io.emit('admin_notification', { type: 'new_ticket', ticket });
        }
        
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'TICKET_CREATED',
                entityId: req.user.id,
                details: JSON.stringify({ ticketId: ticket.id, subject }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tickets/:id/reply (Admin)
router.post('/:id/reply', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { adminReply } = req.body;
        const ticket = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: {
                adminReply,
                status: 'responded'
            }
        });

        const io = req.app.get('io');
        if (io) {
            io.emit(`user-${ticket.userId}-notification`, { type: 'ticket_reply', ticket });
        }

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'TICKET_REPLIED',
                entityId: ticket.userId,
                details: JSON.stringify({ ticketId: ticket.id, adminReply }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tickets/:id/close
router.post('/:id/close', verifyToken, async (req, res) => {
    try {
        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        
        // Either the owner or an admin can close it
        if (ticket.userId !== req.user.id && req.user.role !== 'MASTER_ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: {
                status: 'closed',
                resolvedAt: new Date()
            }
        });
        
        const io = req.app.get('io');
        if (io) {
            io.emit(`user-${ticket.userId}-notification`, { type: 'ticket_closed', ticket: updated });
            io.emit('admin_notification', { type: 'ticket_closed', ticket: updated });
        }

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'TICKET_CLOSED',
                entityId: ticket.userId,
                details: JSON.stringify({ ticketId: ticket.id }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
