import express, { Request, Response } from 'express';
import Tag from '../models/Tag';

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { ownerId, name, plateNumber } = req.body;
    const tagId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://notifyme.com/scan/${tagId}`;

    const newTag = new Tag({ ownerId, tagId, name, plateNumber, qrCodeDataUrl });
    await newTag.save();
    
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.get('/user/:ownerId', async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find({ ownerId: req.params.ownerId });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

export default router;
