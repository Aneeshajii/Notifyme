require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const redis = require('./redisClient');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BJdPrqJCwjZM7qd4uX1olNSwUxfHbvzNxakqT_jQ-H-BwuUM4dDz3Rjsc8eZ-suPDEyDUFs9xfHQSpc1Y7nQDeg';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'tRwgv6ZwHM-OwA2v39x7rtEX2UQbw_zUTydP_HJueIQ';
webpush.setVapidDetails('mailto:support@notifyme.com', publicVapidKey, privateVapidKey);

const app = express();

// Trust the first proxy (Render/Heroku/Load Balancers) to allow rate-limiting by real IPs
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({ origin: true, credentials: true })); // Allow all origins dynamically for Vercel/Localhost
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload too large

// TEMPORARY SEED ROUTE (Can be removed later)
app.get('/api/admin-setup', async (req, res) => {
   try {
       await prisma.user.updateMany({ where: { email: 'aneesha6868@gmail.com' }, data: { role: 'MASTER_ADMIN' } });
       res.send('Admin access granted to aneesha6868@gmail.com! You can now use the Admin Panel.');
   } catch(err) {
       res.send(err.message);
   }
});

app.get('/api/seed-plans', async (req, res) => {
    try {
        await prisma.subscriptionPlan.create({
            data: { name: 'Basic', price: 0, maxQrCodes: 1, benefits: JSON.stringify(['1 QR Code', 'Basic Analytics']), isActive: true }
        });
        await prisma.subscriptionPlan.create({
            data: { name: 'Gold', price: 9, maxQrCodes: 5, benefits: JSON.stringify(['5 QR Codes', 'Advanced Analytics', 'Premium Support']), isActive: true }
        });
        res.send('Basic and Gold plans created successfully! You can go check your mobile app now.');
    } catch(err) {
        res.send('Error: ' + err.message);
    }
});

app.get('/api/create-admin-account', async (req, res) => {
    try {
        const argon2 = require('argon2');
        const hashedPassword = await argon2.hash('Admin1234!');
        await prisma.user.upsert({
            where: { email: 'admin@notifyme.com' },
            update: { password: hashedPassword, role: 'MASTER_ADMIN' },
            create: { email: 'admin@notifyme.com', name: 'Master Admin', password: hashedPassword, role: 'MASTER_ADMIN', isPremium: true }
        });
        res.send('Admin account successfully created! Email: admin@notifyme.com | Password: Admin1234!');
    } catch(err) {
        res.send('Error: ' + err.message);
    }
});

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use('/api', globalLimiter);

// Database Connection is handled automatically by PrismaClient
console.log('Using Prisma ORM for PostgreSQL');

// --- Socket.io WebRTC Signaling ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Car owner joins a private room with their userId
  socket.on('join-owner-room', (userId) => {
    socket.join(userId);
    socket.join(`user-room-${userId}`);
    console.log(`User ${userId} joined their rooms for incoming calls and updates.`);
  });

  // Scanner initiates a call
  socket.on('call-owner', async (data) => {
    try {
      const tag = await prisma.tag.findUnique({ where: { id: data.tagId } });
      if (tag) {
        // Check if scanner is blocked
        const isBlocked = await prisma.blockedScanner.findUnique({
            where: { ownerId_scannerId: { ownerId: tag.ownerId, scannerId: data.callerId || "anonymous" } }
        });

        if (isBlocked) {
            console.log(`Call blocked from ${data.callerId} to owner ${tag.ownerId}`);
            // Emit offline to pretend the user isn't available, or a specific blocked message if desired.
            // For privacy, we just say owner is offline so they don't know they're blocked explicitly.
            return io.to(data.callerId).emit('owner-offline');
        }

        console.log(`Routing call for tag ${data.tagId} to owner ${tag.ownerId}`);
          const room = io.sockets.adapter.rooms.get(tag.ownerId.toString());
          if (room && room.size > 0) {
              io.to(tag.ownerId.toString()).emit('incoming-call', {
                signal: data.signalData,
                callerId: data.callerId,
                tagId: data.tagId
              });
          } else {
              // Owner offline, try sending push notification
              console.log(`Owner offline, sending Web Push notification for tag ${tag.tagId}`);
              
              const subscriptions = await prisma.pushSubscription.findMany({
                  where: { userId: tag.ownerId }
              });

              if (subscriptions.length > 0) {
                  const payload = JSON.stringify({
                      title: 'Incoming Call',
                      body: `You have an incoming call for tag: ${tag.name}`,
                      data: {
                          tagId: data.tagId,
                          callerId: data.callerId,
                          signal: data.signalData
                      }
                  });

                  for (const sub of subscriptions) {
                      try {
                          await webpush.sendNotification({
                              endpoint: sub.endpoint,
                              keys: { p256dh: sub.p256dh, auth: sub.auth }
                          }, payload);
                      } catch (err) {
                          console.error('Push error:', err);
                          // Clean up expired subscriptions
                          if (err.statusCode === 410 || err.statusCode === 404) {
                              await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                          }
                      }
                  }
                  
                  // Let scanner know ringing via push
                  io.to(data.callerId).emit('ringing-push');
                  
              } else {
                  // No push subscription, log as missed immediately
                  await prisma.callLog.create({
                      data: {
                          tagId: tag.id,
                          status: 'missed',
                          callerId: data.callerId
                      }
                  });
                  io.to(data.callerId).emit('owner-offline');
              }
          }
        }
      } catch (e) {
      console.error('Call routing error', e);
    }
  });

  // Owner answers the call
  socket.on('answer-call', (data) => {
    console.log(`Owner answered call, bridging to caller: ${data.callerId}`);
    io.to(data.callerId).emit('call-accepted', data.signalData);
  });

  socket.on('typing', (data) => {
    io.to(data.to).emit('typing', { from: data.from, tagId: data.tagId });
  });

  socket.on('stop-typing', (data) => {
    io.to(data.to).emit('stop-typing', { from: data.from, tagId: data.tagId });
  });

  socket.on('message-delivered', (data) => {
    io.to(data.to).emit('message-delivered', { messageId: data.messageId, tagId: data.tagId });
  });

  socket.on('message-read', (data) => {
    io.to(data.to).emit('message-read', { messageId: data.messageId, tagId: data.tagId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.send('RingMe Clone Backend API is running');
});

// API Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const tagsRoutes = require('./routes/tags');
const messagesRoutes = require('./routes/messages');
const subscriptionsRoutes = require('./routes/subscriptions');
const notificationsRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const callsRoutes = require('./routes/calls');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin'); // we will create this for admin security alerts

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded profile pictures statically
const path = require('path');
const fs = require('fs');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Background Cleanup Job (Runs every hour)
setInterval(async () => {
    try {
        console.log('Running auto-cleanup for old chat messages and media...');
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Find and delete media files older than 24 hours
        const oldMediaMessages = await prisma.message.findMany({
            where: { createdAt: { lt: oneDayAgo }, mediaUrl: { not: null } }
        });
        
        for (const msg of oldMediaMessages) {
            if (msg.mediaUrl) {
                const filePath = path.join(__dirname, msg.mediaUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }
        
        // Remove media links from db for >24hr messages
        if (oldMediaMessages.length > 0) {
            await prisma.message.updateMany({
                where: { createdAt: { lt: oneDayAgo }, mediaUrl: { not: null } },
                data: { mediaUrl: null, mediaType: null, content: '[Media Expired]' }
            });
            console.log(`Cleaned up media for ${oldMediaMessages.length} messages.`);
        }

        // 2. Delete all messages older than 7 days
        const deletedMsgs = await prisma.message.deleteMany({
            where: { createdAt: { lt: sevenDaysAgo } }
        });
        if (deletedMsgs.count > 0) {
            console.log(`Deleted ${deletedMsgs.count} messages older than 7 days.`);
        }
    } catch (err) {
        console.error('Error during auto-cleanup:', err);
    }
}, 1000 * 60 * 60); // 1 hour

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebRTC enabled`);
});
