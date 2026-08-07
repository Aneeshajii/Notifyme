require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const redis = require('./redisClient');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
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
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], credentials: true })); // Restrict CORS
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload too large

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
      const tag = await prisma.tag.findUnique({ where: { tagId: data.tagId } });
      if (tag) {
        console.log(`Routing call for tag ${data.tagId} to owner ${tag.ownerId}`);
        const room = io.sockets.adapter.rooms.get(tag.ownerId.toString());
        if (room && room.size > 0) {
            io.to(tag.ownerId.toString()).emit('incoming-call', {
              signal: data.signalData,
              callerId: data.callerId,
              tagId: data.tagId
            });
        } else {
            // Owner offline, log as missed
            console.log(`Owner offline, logging missed call for tag ${tag.tagId}`);
            await prisma.callLog.create({
                data: {
                    tagId: tag.id,
                    status: 'missed',
                    callerId: data.callerId
                }
            });
            // Let the scanner know the user is offline
            io.to(data.callerId).emit('owner-offline');
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

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/calls', callsRoutes);

// Serve uploaded profile pictures statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebRTC enabled`);
});
