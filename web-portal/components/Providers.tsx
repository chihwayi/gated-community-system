"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmationProvider } from "@/context/ConfirmationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmationProvider>
          {children}
        </ConfirmationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
