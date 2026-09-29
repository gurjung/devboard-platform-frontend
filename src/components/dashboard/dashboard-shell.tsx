"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
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
