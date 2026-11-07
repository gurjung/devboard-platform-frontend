"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { NetworkStatusBanner } from "@/components/shared/network-status-banner";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useWorkspaceRealtimeSync } from "@/features/workspace/hooks/use-workspace-realtime-sync";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  user?: User | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;

  const { data: workspaces } = useWorkspaces();
  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  // Real-time synchronization for projects, members, and workspace events
  useWorkspaceRealtimeSync({
    workspaceId: currentWorkspace?.id,
    workspaceSlug,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <NetworkStatusBanner />
        <Navbar
          user={user}
          onOpenSidebar={() => setSidebarOpen((prev) => !prev)}
          showSidebarTrigger={true}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
