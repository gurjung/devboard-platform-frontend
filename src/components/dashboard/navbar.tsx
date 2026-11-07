"use client";

import { en } from "@/locales/en";
import { HiBars3 } from "react-icons/hi2";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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
  showSidebarTrigger?: boolean;
}

export function Navbar({
  user,
  onOpenSidebar,
  showSidebarTrigger = true,
}: NavbarProps) {
  const { isDemo, exitDemo } = useSimulation();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        {showSidebarTrigger && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            className="cursor-pointer"
            aria-label={en.dashboard.navbar.toggleSidebar}
          >
            <HiBars3 className="size-6" />
          </Button>
        )}
        <span className="font-semibold text-lg">
          {en.dashboard.navbar.brandName}
        </span>

        {isDemo && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
            </span>
            <span>Demo Sandbox Mode</span>
            <button
              type="button"
              onClick={exitDemo}
              className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <NotificationBell />
        <ThemeToggle />
        <UserButton user={user} />
      </div>
    </header>
  );
}
