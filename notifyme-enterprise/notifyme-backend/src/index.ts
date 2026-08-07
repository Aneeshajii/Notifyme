import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const authRoutes = require('./routes/auth').default || require('./routes/auth');
const tagRoutes = require('./routes/tags').default || require('./routes/tags');
const paymentRoutes = require('./routes/payments').default || require('./routes/payments');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/payments', paymentRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notifyme_enterprise')
  .then(() => console.log('Connected to Enterprise MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', version: '2.0.0', stack: 'Enterprise TS' });
});

server.listen(PORT, () => {
  console.log(`Enterprise Backend running on port ${PORT}`);
});
