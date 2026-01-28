"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["guard", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}
