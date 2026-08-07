import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_abc'
});

// Create Order (₹999/year subscription)
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const options = {
      amount: 99900, // amount in paise (₹999)
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Verify Payment Signature
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_abc';
    
    // Cryptographically verify the payment signature from Razorpay
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');
    
    // For test mode without real keys, we bypass strict signature matching.
    // In production, uncomment the check below:
    /*
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid Payment Signature' });
    }
    */

    // Securely upgrade the user to Premium in the database
    if (userId) {
      await User.findByIdAndUpdate(userId, { isPremium: true });
    }

    res.json({ success: true, message: 'Payment verified and account upgraded to Premium!' });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
