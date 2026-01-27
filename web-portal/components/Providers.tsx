"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmationProvider } from "@/context/ConfirmationContext";
import { TenantProvider } from "@/context/TenantContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmationProvider>
            {children}
          </ConfirmationProvider>
        </ToastProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
