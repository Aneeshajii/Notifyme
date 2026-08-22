import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

// Use your computer's local IP address for physical device testing
export const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  async authenticate() {
    if (!this.socket) this.connect();
    
    const token = await getItem('accessToken');
    if (token && this.socket) {
      this.socket.emit('authenticate', token);
    }
  }
}

export const socketService = new SocketService();
