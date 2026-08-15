const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const prisma = require('../prismaClient');
const { verifyToken } = require('../middleware/auth');

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@notifyme.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn("WARNING: VAPID keys are not set. Web Push notifications will not work.");
}

// GET /api/push/vapid-public-key
// Expose the public key so the frontend can subscribe
router.get('/vapid-public-key', (req, res) => {
    if (!process.env.VAPID_PUBLIC_KEY) {
        return res.status(500).json({ error: 'VAPID public key not configured on server.' });
    }
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe
// Save a push subscription for the logged-in user
router.post('/subscribe', verifyToken, async (req, res) => {
    try {
        const { subscription } = req.body;
        
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription object.' });
        }

        // Upsert subscription based on endpoint to avoid duplicates
        const savedSubscription = await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId: req.user.id,
                p256dh: subscription.keys?.p256dh || '',
                auth: subscription.keys?.auth || ''
            },
            create: {
                userId: req.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys?.p256dh || '',
                auth: subscription.keys?.auth || ''
            }
        });

        res.status(201).json({ message: 'Push subscription saved.', subscription: savedSubscription });
    } catch (error) {
        console.error("Push Subscription Error:", error);
        res.status(500).json({ error: 'Failed to save push subscription.' });
    }
});

// POST /api/push/unsubscribe
router.post('/unsubscribe', verifyToken, async (req, res) => {
    try {
        const { endpoint } = req.body;
        
        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint is required.' });
        }

        await prisma.pushSubscription.deleteMany({
            where: { 
                userId: req.user.id,
                endpoint: endpoint 
            }
        });

        res.json({ message: 'Push subscription removed.' });
    } catch (error) {
        console.error("Push Unsubscribe Error:", error);
        res.status(500).json({ error: 'Failed to remove push subscription.' });
    }
});

module.exports = router;
