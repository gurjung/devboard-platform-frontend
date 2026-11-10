"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { CommandPalette } from "./command-palette";
import { NetworkStatusBanner } from "@/components/shared/network-status-banner";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useWorkspaceRealtimeSync } from "@/features/workspace/hooks/use-workspace-realtime-sync";

const subscribeDesktopMedia = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(min-width: 1024px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};

const getDesktopSnapshot = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(min-width: 1024px)").matches
    : true;

const getDesktopServerSnapshot = () => true;

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
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const sidebarTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isDesktop = useSyncExternalStore(
    subscribeDesktopMedia,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;

  const { data: workspaces } = useWorkspaces();
  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  useWorkspaceRealtimeSync({
    workspaceId: currentWorkspace?.id,
    workspaceSlug,
  });

  const handleToggleSidebar = () => {
    if (!isDesktop) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopOpen((prev) => !prev);
    }
  };

  const sidebarExpanded = isDesktop ? desktopOpen : mobileOpen;

  return (
    <div className="flex min-h-screen bg-sidebar text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3.5 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-2 focus:outline-ring focus:outline-offset-2"
      >
        Skip to main content
      </a>

      <Sidebar
        open={desktopOpen}
        mobileOpen={mobileOpen}
        isDesktop={isDesktop}
        onClose={() => setMobileOpen(false)}
        onReturnFocus={() => sidebarTriggerRef.current?.focus()}
        onOpenCommandPalette={() => setCommandOpen(true)}
      />

      <div className="flex flex-1 flex-col min-w-0 lg:py-2 lg:pr-2">
        <div className="flex flex-1 flex-col min-w-0 bg-background lg:rounded-xl lg:border lg:border-border/50 lg:shadow-2xs overflow-x-clip">
          <NetworkStatusBanner />
          <Navbar
            user={user}
            onOpenSidebar={handleToggleSidebar}
            onOpenCommandPalette={() => setCommandOpen(true)}
            showSidebarTrigger={true}
            sidebarExpanded={sidebarExpanded}
            sidebarTriggerRef={sidebarTriggerRef}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-3 sm:p-5 lg:p-6 outline-none"
          >
            {children}
          </main>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
