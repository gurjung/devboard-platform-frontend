"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@/features/auth/context/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthGuard>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
