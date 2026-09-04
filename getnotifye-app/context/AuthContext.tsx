import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { SOCKET_URL } from '../constants/config';

interface User {
  id: string;
  email: string;
  name?: string;
  lastName?: string;
  phone?: string;
  profilePicUrl?: string;
  isPremium?: boolean;
  isOnboarded?: boolean;
  phoneVerified?: boolean;
  tags?: any[];
  subscription?: any;
}

interface AuthContextType {
  user: User | null;
  tags: any[];
  messages: any[];
  socket: Socket | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  fetchTagsAndMessages: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connect socket when user logs in
  const connectSocket = (userId: string) => {
    if (socketRef.current) socketRef.current.disconnect();
    const s = io(SOCKET_URL, { transports: ['websocket'] });
    s.on('connect', () => console.log('Socket connected'));
    s.on(`user-${userId}-new-message`, (msg: any) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        if (exists) return prev;
        return [msg, ...prev];
      });
    });
    socketRef.current = s;
  };

  const fetchTagsAndMessages = async (userId: string) => {
    try {
      const [tagsRes, msgsRes] = await Promise.all([
        api.get(`/tags/user/${userId}`),
        api.get(`/messages/user/${userId}`),
      ]);
      setTags(tagsRes.data || []);
      setMessages(msgsRes.data || []);
    } catch (e) {
      console.error('Failed to fetch tags/messages', e);
    }
  };

  // Check saved session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setIsAuthenticated(true);
          await fetchTagsAndMessages(res.data.id);
          connectSocket(res.data.id);
        }
      } catch {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    setIsAuthenticated(true);
    await fetchTagsAndMessages(res.data.user.id);
    connectSocket(res.data.user.id);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await api.post('/auth/google', { idToken });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    setIsAuthenticated(true);
    await fetchTagsAndMessages(res.data.user.id);
    connectSocket(res.data.user.id);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    socketRef.current?.disconnect();
    setUser(null);
    setTags([]);
    setMessages([]);
    setIsAuthenticated(false);
  };

  const refreshUserData = async () => {
    if (!user) return;
    const res = await api.get('/auth/me');
    setUser(res.data);
    await fetchTagsAndMessages(res.data.id);
  };

  return (
    <AuthContext.Provider value={{
      user, tags, messages, socket: socketRef.current,
      isLoading, isAuthenticated,
      login, loginWithGoogle, logout, refreshUserData, fetchTagsAndMessages
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
