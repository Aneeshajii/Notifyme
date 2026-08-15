const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken, requireRole } = require('../middleware/auth');

const verifyMasterAdmin = [verifyToken, requireRole('MASTER_ADMIN')];

// GET /api/admin/security-alerts
router.get('/security-alerts', verifyMasterAdmin, async (req, res) => {
    try {
        const alerts = await prisma.securityAlert.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch security alerts' });
    }
});

// PUT /api/admin/security-alerts/:id/status
router.put('/security-alerts/:id/status', verifyMasterAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updated = await prisma.securityAlert.update({
            where: { id },
            data: { status }
        });
        
        // Log action
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'SECURITY_ALERT_STATUS_UPDATED',
                entityId: id,
                details: JSON.stringify({ newStatus: status }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });
        
        res.json(updated);
    } catch (error) {
        console.error('Error updating alert status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
