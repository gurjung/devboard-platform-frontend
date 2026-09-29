"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HiXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "@/features/workspace/components/settings/workspace-switcher";
import { ProjectsSidebarList } from "@/features/projects/components/projects-sidebar-list";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { Navigation } from "./navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const { data: workspaces } = useWorkspaces();

  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ease-in-out lg:static lg:z-auto",
          open
            ? "w-64 p-4 translate-x-0"
            : "-translate-x-full w-64 p-4 lg:translate-x-0 lg:w-0 lg:p-0 lg:overflow-hidden lg:border-r-0"
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-sidebar-foreground"
          >
            <span>{en.dashboard.sidebar.brandName}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label={en.dashboard.sidebar.closeSidebar}
          >
            <HiXMark className="size-6" />
          </button>
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col gap-3 mb-3">
          <WorkspaceSwitcher />
        </div>

        <Navigation onNavigate={onClose} />

        <Separator className="my-3" />

        <ProjectsSidebarList
          workspaceId={currentWorkspace?.id}
          workspaceSlug={currentWorkspace?.slug || workspaceSlug}
          currentUserRole={currentWorkspace?.role}
          onNavigate={onClose}
        />
      </aside>
    </>
  );
}
