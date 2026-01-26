"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, newUser?: User, shouldRedirect?: boolean) => Promise<void>;
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

  useEffect(() => {
    if (user && !user.is_password_changed && pathname !== '/change-password') {
      router.replace('/change-password');
    }
  }, [user, pathname, router]);

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

  const login = async (token: string, newUser?: User, shouldRedirect: boolean = true) => {
    authService.setToken(token);
    let userData = newUser;
    if (!userData) {
      userData = await authService.getCurrentUser(token);
    }
    setUser(userData);
    
    // Allow useEffect to handle the redirect if password change is needed
    if (!userData.is_password_changed) {
      return;
    }

    if (!shouldRedirect) {
      return;
    }
    
    // Redirect based on role
    if (userData.role === 'admin') router.replace('/dashboard');
    else if (userData.role === 'resident') router.replace('/resident');
    else if (userData.role === 'guard') router.replace('/security');
    else router.replace('/');
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
