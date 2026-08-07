const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/subscriptions
// Public route to view active subscriptions
router.get('/', async (req, res) => {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscriptions/purchase
// User route to mock purchase a subscription
router.post('/purchase', verifyToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        
        if (!plan) {
            return res.status(404).json({ error: 'Subscription plan not found.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                pendingSubscriptionId: plan.id
            }
        });

        res.json({ message: 'Payment successful! Please verify your phone number to activate.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/subscriptions/admin/all
// Admin route to view ALL subscriptions
router.get('/admin/all', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { price: 'asc' }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscriptions
// Admin create a new plan
router.post('/', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        const { name, price, maxQrCodes, benefits, isActive } = req.body;
        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                name,
                price: parseFloat(price),
                maxQrCodes: parseInt(maxQrCodes, 10),
                benefits: JSON.stringify(benefits || []),
                isActive: isActive ?? true
            }
        });
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/subscriptions/:id
// Admin edit plan
router.put('/:id', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        const { name, price, maxQrCodes, benefits, isActive } = req.body;
        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id: req.params.id },
            data: {
                name,
                price: price !== undefined ? parseFloat(price) : undefined,
                maxQrCodes: maxQrCodes !== undefined ? parseInt(maxQrCodes, 10) : undefined,
                benefits: benefits ? JSON.stringify(benefits) : undefined,
                isActive
            }
        });
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/subscriptions/:id
// Admin delete plan
router.delete('/:id', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        await prisma.subscriptionPlan.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Subscription Plan deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
