"use client";

import type { RefObject } from "react";
import { PanelLeft, Search } from "lucide-react";
import { en } from "@/locales/en";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { DevBoardLogo } from "@/components/shared/devboard-logo";
import { UserButton } from "./user-button";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useSimulation } from "@/features/simulation/context/simulation-context";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user?: User | null;
  onOpenSidebar: () => void;
  onOpenCommandPalette?: () => void;
  showSidebarTrigger?: boolean;
  sidebarExpanded?: boolean;
  sidebarTriggerRef?: RefObject<HTMLButtonElement | null>;
}

export function Navbar({
  user,
  onOpenSidebar,
  onOpenCommandPalette,
  showSidebarTrigger = true,
  sidebarExpanded,
  sidebarTriggerRef,
}: NavbarProps) {
  const { isDemo, exitDemo } = useSimulation();

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border/50 bg-background/90 backdrop-blur-md px-3 sm:px-5 lg:rounded-t-xl">
      <div className="flex items-center gap-2.5 min-w-0">
        {showSidebarTrigger && (
          <Button
            ref={sidebarTriggerRef}
            variant="ghost"
            size="icon-sm"
            onClick={onOpenSidebar}
            className="cursor-pointer text-muted-foreground hover:text-foreground rounded-md"
            aria-label={en.dashboard.navbar.toggleSidebar}
            aria-expanded={sidebarExpanded}
            aria-controls="workspace-sidebar"
          >
            <PanelLeft className="size-4" />
          </Button>
        )}

        <DevBoardLogo size="sm" className="lg:hidden" />

        {isDemo && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
            </span>
            <span>Demo Sandbox Mode</span>
            <button
              type="button"
              onClick={exitDemo}
              className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:inline-flex items-center gap-3 h-7.5 px-2.5 rounded-md border border-input bg-muted/35 hover:bg-muted/70 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Open command menu"
          >
            <span className="inline-flex items-center gap-1.5">
              <Search className="size-3.5 text-muted-foreground" />
              <span>Quick jump...</span>
            </span>
            <Kbd className="text-[10px]">⌘K</Kbd>
          </button>
        )}
        <NotificationBell />
        <ThemeToggle />
        <UserButton user={user} />
      </div>
    </header>
  );
}
