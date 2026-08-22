import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { socketService } from '../services/socket';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { initializeCallKeep } from '../services/callkeep';

// Web Fallback for SecureStore
const setStorageItemAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

type User = {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  isOnboarded?: boolean;
  isPremium?: boolean;
  subscriptionId?: string;
  subscription?: any;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await getStorageItemAsync('user');
      const token = await getStorageItemAsync('accessToken');
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        socketService.connect();
        socketService.authenticate();
        
        // Initialize Native Services
        initializeCallKeep();
        registerForPushNotificationsAsync(parsedUser.id);
        
        // Optionally refresh profile here
        api.get('/auth/me').then(res => {
          if (res.data.user) {
            updateUser(res.data.user);
          }
        }).catch((err) => {
          // If token is completely invalid, clear storage to prevent getting stuck
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        });
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, user: User, refreshToken?: string) => {
    await setStorageItemAsync('accessToken', token);
    if (refreshToken) {
      await setStorageItemAsync('refreshToken', refreshToken);
    }
    await setStorageItemAsync('user', JSON.stringify(user));
    setUser(user);
    socketService.connect();
    socketService.authenticate();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.log('Backend logout failed, continuing local logout');
    }
    await deleteStorageItemAsync('accessToken');
    await deleteStorageItemAsync('refreshToken');
    await deleteStorageItemAsync('user');
    setUser(null);
    socketService.disconnect();
  };

  const updateUser = async (newUser: User) => {
    await setStorageItemAsync('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
