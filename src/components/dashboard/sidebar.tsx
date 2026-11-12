"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";
import { Separator } from "@/components/ui/separator";
import { Kbd } from "@/components/ui/kbd";
import { DevBoardLogo } from "@/components/shared/devboard-logo";
import { WorkspaceSwitcher } from "@/features/workspace/components/settings/workspace-switcher";
import { ProjectsSidebarList } from "@/features/projects/components/projects-sidebar-list";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { Navigation } from "./navigation";

interface SidebarProps {
  open: boolean;
  mobileOpen?: boolean;
  isDesktop?: boolean;
  onClose: () => void;
  onReturnFocus?: () => void;
  onOpenCommandPalette?: () => void;
}

export function Sidebar({
  open,
  mobileOpen = false,
  isDesktop = true,
  onClose,
  onReturnFocus,
  onOpenCommandPalette,
}: SidebarProps) {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const { data: workspaces } = useWorkspaces();
  const asideRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  const isMobileDrawer = !isDesktop && mobileOpen;
  const isSidebarVisible = isDesktop ? open : mobileOpen;

  const releaseSidebarFocus = React.useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && asideRef.current?.contains(active)) {
      active.blur();
    }
  }, []);

  const handleCloseDrawer = React.useCallback(() => {
    releaseSidebarFocus();
    onClose();
    requestAnimationFrame(() => {
      onReturnFocus?.();
    });
  }, [onClose, onReturnFocus, releaseSidebarFocus]);

  const handleMobileNavigate = () => {
    if (!isDesktop) {
      releaseSidebarFocus();
      onClose();
    }
  };

  React.useLayoutEffect(() => {
    if (!isSidebarVisible) {
      releaseSidebarFocus();
    }
  }, [isSidebarVisible, releaseSidebarFocus]);

  React.useEffect(() => {
    if (!isMobileDrawer) return;
    const frameId = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [isMobileDrawer]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented && isMobileDrawer) {
        const activeModal = document.querySelector(
          '[data-slot="dialog-content"], [data-slot="select-content"], [data-slot="dropdown-menu-content"]'
        );
        if (activeModal) return;
        handleCloseDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileDrawer, handleCloseDrawer]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity lg:hidden"
          onClick={handleCloseDrawer}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        ref={asideRef}
        id="workspace-sidebar"
        aria-label="Workspace sidebar"
        role={isMobileDrawer ? "dialog" : undefined}
        aria-modal={isMobileDrawer ? true : undefined}
        inert={!isSidebarVisible || undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border lg:border-r-0 transition-all duration-200 ease-in-out lg:static lg:z-auto",
          mobileOpen ? "w-60 p-3 translate-x-0" : "-translate-x-full w-60 p-3 invisible lg:visible",
          open
            ? "lg:translate-x-0 lg:w-60 lg:p-3 lg:visible"
            : "lg:translate-x-0 lg:w-0 lg:p-0 lg:overflow-hidden lg:invisible"
        )}
      >
        <div className="flex items-center justify-between px-1.5 h-8">
          <Link
            href="/dashboard"
            onClick={handleMobileNavigate}
            className="inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <DevBoardLogo size="sm" />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleCloseDrawer}
            className="inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-ring outline-none"
            aria-label={en.dashboard.sidebar.closeSidebar}
          >
            <X className="size-4" />
          </button>
        </div>

        <Separator className="my-2.5 bg-sidebar-border" />

        <div className="flex flex-col gap-3 mb-2">
          <WorkspaceSwitcher />
        </div>

        <Navigation onNavigate={handleMobileNavigate} />

        <Separator className="my-2.5 bg-sidebar-border" />

        <div className="flex-1 overflow-y-auto min-h-0">
          <ProjectsSidebarList
            workspaceId={currentWorkspace?.id}
            workspaceSlug={currentWorkspace?.slug || workspaceSlug}
            currentUserRole={currentWorkspace?.role}
            onNavigate={handleMobileNavigate}
          />
        </div>

        {onOpenCommandPalette && (
          <div className="pt-2 mt-2 border-t border-sidebar-border">
            <button
              type="button"
              onClick={() => {
                handleMobileNavigate();
                onOpenCommandPalette();
              }}
              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/70 transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5 truncate">
                <Search className="size-3.5 shrink-0" />
                <span>Command menu</span>
              </span>
              <Kbd className="text-[10px]">⌘K</Kbd>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
