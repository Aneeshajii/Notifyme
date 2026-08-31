import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'https://notifyme-api-px9n.onrender.com', {
  transports: ['websocket']
});
