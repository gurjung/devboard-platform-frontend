"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectAvatar } from "./project-avatar";
import { useProjects } from "../hooks/use-projects";
import type { WorkspaceRole } from "@/features/workspace/types";

const CreateProjectDialog = dynamic(
  () =>
    import("./create-project-dialog").then((mod) => mod.CreateProjectDialog),
  { ssr: false }
);

interface ProjectsSidebarListProps {
  workspaceId?: string;
  workspaceSlug?: string;
  currentUserRole?: WorkspaceRole;
  onNavigate?: () => void;
}

export function ProjectsSidebarList({
  workspaceId,
  workspaceSlug,
  currentUserRole,
  onNavigate,
}: ProjectsSidebarListProps) {
  const pathname = usePathname();
  const { data: projects, isLoading } = useProjects(workspaceId);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [hasOpenedCreate, setHasOpenedCreate] = React.useState(false);

  const canCreate =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  if (!workspaceId || !workspaceSlug) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1.5">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {en.project.switcher.sectionTitle}
        </span>
        {canCreate && (
          <>
            <button
              type="button"
              onClick={() => {
                setHasOpenedCreate(true);
                setCreateOpen(true);
              }}
              className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
              aria-label={en.project.switcher.createTooltip}
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
            {hasOpenedCreate && (
              <CreateProjectDialog
                workspaceId={workspaceId}
                workspaceSlug={workspaceSlug}
                open={createOpen}
                onOpenChange={setCreateOpen}
              />
            )}
          </>
        )}
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex flex-col gap-1 px-1.5 py-1">
          <Skeleton className="h-7 w-full rounded-md" />
          <Skeleton className="h-7 w-4/5 rounded-md" />
        </div>
      ) : projects && projects.length > 0 ? (
        <ul className="flex flex-col gap-y-0.5">
          {projects.map((project) => {
            const projectHref = `/dashboard/${workspaceSlug}/projects/${project.slug}`;
            const isActive =
              pathname === projectHref || pathname.startsWith(`${projectHref}/`);

            return (
              <li key={project.id}>
                <Link
                  href={projectHref}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault();
                    }
                    onNavigate?.();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/55"
                  )}
                >
                  <ProjectAvatar
                    name={project.name}
                    image={project.logo}
                    className="size-4.5 rounded-sm shrink-0"
                    fallbackClassName="text-[9px]"
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-2 py-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <FolderKanban className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <span>{en.project.switcher.noProjects}</span>
        </div>
      )}
    </div>
  );
}
