import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_secret_key';

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, name, googleId } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, googleId });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/request-otp', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  // Simulated Twilio API Call
  console.log(`[Twilio Mock] Sending 6-digit OTP to ${phoneNumber}...`);
  res.json({ success: true, message: 'OTP Sent successfully (Check server logs)' });
});

export default router;
