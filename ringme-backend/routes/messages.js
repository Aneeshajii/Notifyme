const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const os = require('os');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use OS temp directory for serverless compatibility (Vercel)
const uploadsDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `chat-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for media
});

const messageRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Max 10 messages per minute per IP
    message: { error: 'You are sending messages too quickly. Please wait a moment.' }
});

// POST /api/messages/upload
router.post('/upload', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Helper to upload to Cloudinary and delete local file
        const uploadToCloudinary = async (filePath, isAudioFile) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(filePath, { 
                    resource_type: isAudioFile ? 'video' : 'image',
                    folder: 'notifyme_chat'
                }, (error, result) => {
                    fs.unlink(filePath, () => {}); // Cleanup temp file
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result.secure_url);
                    }
                });
            });
        };
        
        const isAudio = req.file.mimetype.startsWith('audio/') || req.file.originalname.match(/\.(webm|mp4|m4a|ogg|weba)$/i);
        
        if (isAudio && !req.file.originalname.match(/\.mp3$/i)) {
            const inputPath = req.file.path;
            const outputPath = inputPath + '.mp3';
            
            ffmpeg(inputPath)
                .toFormat('mp3')
                .audioBitrate('128k')
                .on('end', async () => {
                    try {
                        const cloudUrl = await uploadToCloudinary(outputPath, true);
                        fs.unlink(inputPath, () => {}); // Cleanup original file
                        res.status(200).json({ url: cloudUrl });
                    } catch (cloudErr) {
                        res.status(500).json({ error: 'Cloud upload failed. Please check Cloudinary credentials.' });
                    }
                })
                .on('error', async (err) => {
                    console.error('FFmpeg transcoding error:', err);
                    // Fallback to original file
                    try {
                        const cloudUrl = await uploadToCloudinary(inputPath, true);
                        res.status(200).json({ url: cloudUrl });
                    } catch (cloudErr) {
                        res.status(500).json({ error: 'Cloud upload failed.' });
                    }
                })
                .save(outputPath);
        } else {
            // Direct upload (Image or already mp3)
            try {
                const cloudUrl = await uploadToCloudinary(req.file.path, isAudio);
                res.status(200).json({ url: cloudUrl });
            } catch (cloudErr) {
                res.status(500).json({ error: 'Cloud upload failed. Please check Cloudinary credentials.' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/messages/send
router.post('/send', messageRateLimiter, async (req, res) => {
    try {
        const { tagId, content, senderInfo, scannerId, senderRole } = req.body;
        let tag = await prisma.tag.findUnique({ 
            where: { tagId: tagId },
            include: { owner: true }
        });
        if (!tag) {
            tag = await prisma.tag.findUnique({ 
                where: { id: tagId },
                include: { owner: true }
            });
        }
        if (!tag) return res.status(404).json({ message: 'Tag not found' });

        if (tag.status === 'dnd' || tag.status === 'paused' || !tag.isActive) {
            return res.status(403).json({ error: 'This QR code is currently paused and cannot receive messages.' });
        }
        
        if (senderRole !== 'owner' && !tag.owner.allowMessages) {
            return res.status(403).json({ error: 'The owner has disabled messaging.' });
        }
        
        if (req.body.mediaUrl && !tag.owner.allowImageSharing) {
             return res.status(403).json({ error: 'The owner has disabled image/media sharing.' });
        }
        
        let conversationId = req.body.conversationId;
        let conv = null;
        
        if (senderRole !== 'owner') {
            const isBlocked = await prisma.blockedScanner.findUnique({
                where: { ownerId_scannerId: { ownerId: tag.ownerId, scannerId: scannerId || "anonymous" } }
            });
            if (isBlocked) {
                return res.status(403).json({ error: 'You have been blocked by the owner and cannot send messages.' });
            }
        }

        if (conversationId) {
            conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
        } else {
            conv = await prisma.conversation.findFirst({
                where: { tagId: tag.id, scannerId: scannerId || "anonymous" }
            });
            if (!conv) {
                conv = await prisma.conversation.create({
                    data: { tagId: tag.id, scannerId: scannerId || "anonymous" }
                });
            }
            conversationId = conv.id;
        }

        if (conv && conv.status === 'closed') {
            if (senderRole === 'owner') {
                // Auto-open if owner/admin replies
                await prisma.conversation.update({ where: { id: conv.id }, data: { status: 'open' } });
                const io = req.app.get('io');
                if (io) io.emit(`conversation-${conv.id}`, { action: 'status_changed', status: 'open' });
            } else {
                return res.status(400).json({ error: 'This conversation has been closed and cannot accept new messages.' });
            }
        }

        const msg = await prisma.message.create({
            data: {
                tagId: tag.id,
                content: req.body.content || "",
                senderInfo: senderInfo || "Anonymous",
                senderRole: senderRole || "scanner",
                conversationId,
                mediaUrl: req.body.mediaUrl || null,
                mediaType: req.body.mediaType || null,
                latitude: req.body.latitude || null,
                longitude: req.body.longitude || null
            },
            include: { tag: true, conversation: true }
        });

        const io = req.app.get('io');
        if (io) {
            io.emit(`conversation-${conversationId}`, msg);
            io.emit(`user-${tag.ownerId}-new-message`, msg);
        }

        // Web Push Notification
        try {
            const webpush = require('web-push');
            
            // Determine recipient based on senderRole
            let recipientId = null;
            if (senderRole === 'scanner') {
                recipientId = tag.ownerId; // Message sent to owner
            } else if (senderRole === 'owner') {
                // Future: Push to scanner if they have registered
                // For now, only owners have guaranteed accounts
            }
            
            if (recipientId) {
                const subscriptions = await prisma.pushSubscription.findMany({
                    where: { userId: recipientId }
                });

                if (subscriptions.length > 0) {
                    const payload = JSON.stringify({
                        type: 'MESSAGE',
                        title: `New message from ${msg.senderInfo}`,
                        body: msg.mediaType ? `Sent an attachment` : msg.content.substring(0, 50),
                        data: {
                            conversationId: msg.conversationId,
                            tagId: msg.tagId
                        }
                    });

                    for (const sub of subscriptions) {
                        try {
                            await webpush.sendNotification({
                                endpoint: sub.endpoint,
                                keys: { p256dh: sub.p256dh, auth: sub.auth }
                            }, payload);
                        } catch (err) {
                            if (err.statusCode === 410 || err.statusCode === 404) {
                                await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                            }
                        }
                    }
                }
            }
        } catch (pushErr) {
            console.error("Failed to send push notification for message:", pushErr);
        }

        res.status(201).json({ message: 'Message sent successfully!', messageData: msg, conversationId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/conversations/user/:userId
router.get('/conversations/user/:userId', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({ where: { ownerId: req.params.userId } });
        const tagIds = tags.map(t => t.id);

        const conversations = await prisma.conversation.findMany({
            where: { tagId: { in: tagIds } },
            include: { 
                tag: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { startedAt: 'desc' }
        });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/conversation/:conversationId
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: { conversationId: req.params.conversationId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/scanner/:tagId/:scannerId
router.get('/scanner/:tagId/:scannerId', async (req, res) => {
    try {
        let tag = await prisma.tag.findUnique({ where: { tagId: req.params.tagId } });
        if (!tag) {
            tag = await prisma.tag.findUnique({ where: { id: req.params.tagId } });
        }
        if (!tag) return res.status(404).json({ message: 'Tag not found' });

        const conv = await prisma.conversation.findFirst({
            where: { tagId: tag.id, scannerId: req.params.scannerId }
        });

        if (!conv) return res.json([]);

        const messages = await prisma.message.findMany({
            where: { conversationId: conv.id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/messages/admin/direct
router.post('/admin/direct', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    const userTags = await prisma.tag.findMany({ where: { ownerId: userId } });
    if (userTags.length === 0) {
      return res.status(400).json({ message: 'User has no active tags to receive messages.' });
    }
    
    let conv = await prisma.conversation.findFirst({
        where: { tagId: userTags[0].id, scannerId: "ADMIN" }
    });
    if (!conv) {
        conv = await prisma.conversation.create({
            data: { tagId: userTags[0].id, scannerId: "ADMIN" }
        });
    }

    const msg = await prisma.message.create({
      data: {
        tagId: userTags[0].id,
        content,
        senderInfo: 'System Admin',
        senderRole: 'owner',
        conversationId: conv.id
      },
      include: { tag: true, conversation: true }
    });
    
    const io = req.app.get('io');
    if (io) {
        io.emit(`conversation-${conv.id}`, msg);
        io.emit(`user-${userId}-new-message`, msg);
    }

    res.status(201).json({ message: 'Direct message sent to user inbox' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({ where: { ownerId: req.params.userId } });
        const tagIds = tags.map(t => t.id);

        const messages = await prisma.message.findMany({
            where: { tagId: { in: tagIds } },
            include: { tag: true, conversation: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.message.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/messages/conversation/:id
router.delete('/conversation/:id', verifyToken, async (req, res) => {
  try {
    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id }, include: { tag: true } });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (conv.tag.ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.conversation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/block
router.post('/block', verifyToken, async (req, res) => {
  try {
    const { scannerId } = req.body;
    if (scannerId === 'ADMIN') return res.status(403).json({ error: 'Cannot block Master Admin' });

    await prisma.blockedScanner.upsert({
      where: { ownerId_scannerId: { ownerId: req.user.id, scannerId } },
      update: {},
      create: { ownerId: req.user.id, scannerId }
    });
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/unblock
router.post('/unblock', verifyToken, async (req, res) => {
  try {
    const { scannerId } = req.body;
    await prisma.blockedScanner.delete({
      where: { ownerId_scannerId: { ownerId: req.user.id, scannerId } }
    });
    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.json({ message: 'User unblocked' });
  }
});

// GET /api/messages/blocked
router.get('/blocked', verifyToken, async (req, res) => {
  try {
    const blocked = await prisma.blockedScanner.findMany({ where: { ownerId: req.user.id } });
    res.json(blocked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/conversation/:id/status
router.post('/conversation/:id/status', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const conv = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    const io = req.app.get('io');
    if (io) {
      io.emit(`conversation-${conv.id}`, { action: 'status_changed', status });
    }
    
    res.json({ message: `Conversation ${status}`, conversation: conv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
