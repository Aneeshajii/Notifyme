const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken, requireRole } = require('../middleware/auth');

const verifyMasterAdmin = [verifyToken, requireRole('MASTER_ADMIN')];

// === ADMIN ROUTES ===

// Create Announcement
router.post('/admin', verifyMasterAdmin, async (req, res) => {
    const {
        title, description, imageUrl, actionButtonText, actionUrl,
        deliveryTypes, targetAudience, selectedUsers, publishAt, expiresAt
    } = req.body;

    try {
        const announcement = await prisma.announcement.create({
            data: {
                title,
                description,
                imageUrl,
                actionButtonText,
                actionUrl,
                deliveryTypes: JSON.stringify(deliveryTypes || []),
                targetAudience,
                selectedUsers: selectedUsers ? JSON.stringify(selectedUsers) : null,
                publishAt: publishAt ? new Date(publishAt) : new Date(),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                status: (publishAt && new Date(publishAt) > new Date()) ? 'SCHEDULED' : 'ACTIVE',
                createdBy: req.user.id
            }
        });
        res.status(201).json(announcement);
    } catch (err) {
        console.error('Create announcement error:', err);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Get all announcements (Admin)
router.get('/admin', verifyMasterAdmin, async (req, res) => {
    try {
        // Automatically mark expired announcements
        await prisma.announcement.updateMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { lt: new Date() }
            },
            data: { status: 'EXPIRED' }
        });

        // Automatically mark active announcements
        await prisma.announcement.updateMany({
            where: {
                status: 'SCHEDULED',
                publishAt: { lte: new Date() }
            },
            data: { status: 'ACTIVE' }
        });

        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { userStates: true }
                }
            }
        });
        res.json(announcements);
    } catch (err) {
        console.error('Get announcements error:', err);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Update Announcement
router.put('/admin/:id', verifyMasterAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        title, description, imageUrl, actionButtonText, actionUrl,
        deliveryTypes, targetAudience, selectedUsers, publishAt, expiresAt, status
    } = req.body;

    try {
        let currentStatus = status;
        if (!currentStatus) {
            currentStatus = (publishAt && new Date(publishAt) > new Date()) ? 'SCHEDULED' : 'ACTIVE';
        }

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                actionButtonText,
                actionUrl,
                deliveryTypes: JSON.stringify(deliveryTypes || []),
                targetAudience,
                selectedUsers: selectedUsers ? JSON.stringify(selectedUsers) : null,
                publishAt: publishAt ? new Date(publishAt) : undefined,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                status: currentStatus
            }
        });
        res.json(announcement);
    } catch (err) {
        console.error('Update announcement error:', err);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// Delete Announcement
router.delete('/admin/:id', verifyMasterAdmin, async (req, res) => {
    try {
        await prisma.announcement.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete announcement error:', err);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});


// === USER ROUTES ===

// Get active announcements for current user
router.get('/active', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update scheduled -> active and active -> expired
        await prisma.announcement.updateMany({
            where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
            data: { status: 'EXPIRED' }
        });
        await prisma.announcement.updateMany({
            where: { status: 'SCHEDULED', publishAt: { lte: new Date() } },
            data: { status: 'ACTIVE' }
        });

        // Find active announcements
        const activeAnnouncements = await prisma.announcement.findMany({
            where: { status: 'ACTIVE' }
        });

        // Filter by audience
        let validAnnouncements = [];
        for (let ann of activeAnnouncements) {
            let include = false;
            if (ann.targetAudience === 'ALL') {
                include = true;
            } else if (ann.targetAudience === 'BASIC' && (!user.subscriptionId || user.subscriptionId === '')) {
                include = true;
            } else if (ann.targetAudience === 'PREMIUM' && user.subscriptionId) {
                include = true;
            } else if (ann.targetAudience === 'SPECIFIC' && ann.selectedUsers) {
                const users = JSON.parse(ann.selectedUsers);
                if (users.includes(user.id) || users.includes(user.email)) {
                    include = true;
                }
            }

            if (include) {
                // Check if user has already dismissed it
                const state = await prisma.userAnnouncementState.findUnique({
                    where: {
                        userId_announcementId: {
                            userId: user.id,
                            announcementId: ann.id
                        }
                    }
                });

                if (!state || !state.dismissed) {
                    validAnnouncements.push({
                        ...ann,
                        deliveryTypes: JSON.parse(ann.deliveryTypes || '[]')
                    });
                }
            }
        }

        res.json(validAnnouncements);
    } catch (err) {
        console.error('Fetch active announcements error:', err);
        res.status(500).json({ error: 'Failed to fetch active announcements' });
    }
});

// Dismiss announcement
router.post('/:id/dismiss', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const announcementId = req.params.id;

        await prisma.userAnnouncementState.upsert({
            where: {
                userId_announcementId: { userId, announcementId }
            },
            update: { dismissed: true },
            create: {
                userId,
                announcementId,
                dismissed: true,
                seen: true
            }
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Dismiss announcement error:', err);
        res.status(500).json({ error: 'Failed to dismiss announcement' });
    }
});

module.exports = router;
