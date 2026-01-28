"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PlatformSidebar from '@/components/platform/PlatformSidebar';
import { Loader2 } from 'lucide-react';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params?.tenant as string;

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'super_admin')) {
      router.replace(tenantSlug ? `/${tenantSlug}/login` : '/');
    }
  }, [user, isLoading, router, tenantSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PlatformSidebar />
      <main className="pl-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
