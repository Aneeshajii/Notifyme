const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock',
});

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

// POST /api/subscriptions/create-order
router.post('/create-order', verifyToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        
        if (!plan) {
            return res.status(404).json({ error: 'Subscription plan not found.' });
        }

        const options = {
            amount: Math.round(plan.price * 100), // amount in paisa
            currency: "INR",
            receipt: `rcpt_${req.user.id.substring(0, 8)}_${Date.now()}`
        };
        
        const order = await razorpay.orders.create(options);
        
        await prisma.payment.create({
            data: {
                userId: req.user.id,
                amount: plan.price,
                method: "Razorpay",
                status: "pending",
                razorpayOrderId: order.id,
                subscriptionPlanId: plan.id
            }
        });
        
        res.json({ orderId: order.id, amount: plan.price, key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscriptions/create-payment-link
router.post('/create-payment-link', verifyToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        
        if (!plan) {
            return res.status(404).json({ error: 'Subscription plan not found.' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const options = {
            amount: Math.round(plan.price * 100),
            currency: "INR",
            description: `Subscription to ${plan.name}`,
            customer: {
                name: user.name || "Customer",
                email: user.email || "customer@example.com"
            },
            notify: {
                sms: false,
                email: false
            },
            reminder_enable: false,
            // You can optionally redirect them back to a deep link or the web portal
            callback_url: "http://localhost:5173/account/subscriptions",
            callback_method: "get"
        };
        
        const paymentLink = await razorpay.paymentLink.create(options);
        
        // We still create a payment record but associate it with the payment link id
        await prisma.payment.create({
            data: {
                userId: req.user.id,
                amount: plan.price,
                method: "Razorpay_Link",
                status: "pending",
                razorpayOrderId: paymentLink.id, // storing link id here for now
                subscriptionPlanId: plan.id
            }
        });
        
        res.json({ url: paymentLink.short_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscriptions/verify-payment
router.post('/verify-payment', verifyToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock';
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature.' });
        }
        
        const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
        if (!payment || payment.userId !== req.user.id) {
            return res.status(404).json({ error: 'Payment record not found or unauthorized.' });
        }
        
        // TEMPORARY BYPASS: Activate immediately without phone verification
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Standard 30 day cycle

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                isPremium: true,
                premiumExpiresAt: expiresAt,
                subscriptionId: payment.subscriptionPlanId,
                pendingSubscriptionId: null
            }
        });

        await prisma.payment.update({
            where: { razorpayOrderId: razorpay_order_id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'completed' // Jump straight to completed instead of paid_unverified
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'USER_SUBSCRIBED',
                entityId: req.user.id,
                details: JSON.stringify({ planId: payment.subscriptionPlanId }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });
        
        res.json({ message: 'Payment verified and subscription activated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscriptions/activate
router.post('/activate', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user.phoneVerified) {
            return res.status(403).json({ error: 'Mobile number must be verified before activating a subscription.' });
        }

        const payment = await prisma.payment.findFirst({
            where: { userId: req.user.id, status: 'paid_unverified' },
            orderBy: { createdAt: 'desc' }
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'No verified pending payment found.' });
        }
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Standard 30 day cycle
        
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                isPremium: true,
                premiumExpiresAt: expiresAt,
                subscriptionId: payment.subscriptionPlanId,
                pendingSubscriptionId: null
            }
        });
        
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'completed' }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'USER_SUBSCRIBED',
                entityId: req.user.id,
                details: JSON.stringify({ planId: payment.subscriptionPlanId }),
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });
        
        res.json({ message: 'Subscription activated successfully.', user: updatedUser });
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
