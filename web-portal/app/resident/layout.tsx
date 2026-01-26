"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["resident"]}>
      {children}
    </ProtectedRoute>
  );
}
