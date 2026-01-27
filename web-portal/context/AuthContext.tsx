"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, newUser?: User, shouldRedirect?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const logout = useCallback(() => {
    authService.removeToken();
    setUser(null);
    const tenant = searchParams.get('tenant');
    if (tenant) {
      router.push(`/login?tenant=${tenant}`);
    } else {
      router.push('/login');
    }
  }, [router, searchParams]);

  const checkAuth = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      // Prevent redirect loop if already on login page
      if (window.location.pathname.includes('/login')) {
        return;
      }
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [checkAuth, logout]);

  useEffect(() => {
    if (user && !user.is_password_changed && pathname !== '/change-password') {
      router.replace('/change-password');
    }
  }, [user, pathname, router]);

  const login = useCallback(async (token: string, newUser?: User, shouldRedirect: boolean = true) => {
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
    
    // Preserve tenant param if present
    const tenant = searchParams.get('tenant');
    const querySuffix = tenant ? `?tenant=${tenant}` : '';
    
    // Redirect based on role
    if (userData.role === 'super_admin') router.replace('/platform' + querySuffix);
    else if (userData.role === 'admin') router.replace('/dashboard' + querySuffix);
    else if (userData.role === 'resident') router.replace('/resident' + querySuffix);
    else if (userData.role === 'guard') router.replace('/security' + querySuffix);
    else router.replace('/' + querySuffix);
  }, [router, searchParams]);

  const updateUser = useCallback((data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser, isAuthenticated: !!user }}>
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
