import { TenantProvider } from "@/context/TenantContext";
import { ReactNode } from "react";

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  return (
    <TenantProvider slug={tenant}>
      {children}
    </TenantProvider>
  );
}
