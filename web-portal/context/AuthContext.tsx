"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        const userData = await authService.getCurrentUser(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    authService.setToken(token);
    const userData = await authService.getCurrentUser(token);
    setUser(userData);
    
    // Redirect based on role
    if (userData.role === 'admin') router.push('/dashboard');
    else if (userData.role === 'resident') router.push('/resident');
    else if (userData.role === 'guard') router.push('/security');
    else router.push('/');
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
