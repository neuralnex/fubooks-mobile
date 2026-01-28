import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrRegNumber: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    regNumber: string;
    password: string;
    accommodation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrRegNumber: string, password: string) => {
    const response: AuthResponse = await apiService.login(emailOrRegNumber, password);
    setToken(response.token);
    setUser(response.user);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  };

  const register = async (data: {
    name: string;
    email: string;
    regNumber: string;
    password: string;
    accommodation: string;
  }) => {
    const response: AuthResponse = await apiService.register(data);
    setToken(response.token);
    setUser(response.user);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

