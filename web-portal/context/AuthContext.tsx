"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
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
  const params = useParams();
  const tenantSlug = params?.tenant as string;

  const logout = useCallback(() => {
    authService.removeToken();
    setUser(null);
    if (pathname?.startsWith('/platform')) {
        router.push('/platform/login');
        return;
    }
    const tenant = tenantSlug || searchParams.get('tenant');
    if (tenant) {
      router.push(`/${tenant}/login`);
    } else {
      router.push('/');
    }
  }, [router, searchParams, tenantSlug, pathname]);

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
    if (user && !user.is_password_changed && !pathname.includes('/change-password')) {
        const tenant = tenantSlug || searchParams.get('tenant') || 'default';
        router.replace(`/${tenant}/change-password`);
    }
  }, [user, pathname, router, tenantSlug, searchParams]);

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
    
    // Resolve tenant
    const targetTenant = tenantSlug || searchParams.get('tenant') || 'default';
    
    // Redirect based on role
    if (userData.role === 'super_admin') router.replace(`/platform`);
    else if (userData.role === 'admin') router.replace(`/${targetTenant}/dashboard`);
    else if (userData.role === 'resident') router.replace(`/${targetTenant}/resident`);
    else if (userData.role === 'guard') router.replace(`/${targetTenant}/security`);
    else router.replace('/');
  }, [router, searchParams, tenantSlug]);

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
