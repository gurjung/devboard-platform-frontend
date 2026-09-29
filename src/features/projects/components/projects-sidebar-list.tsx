"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectAvatar } from "./project-avatar";
import { CreateProjectDialog } from "./create-project-dialog";
import { useProjects } from "../hooks/use-projects";
import type { WorkspaceRole } from "@/features/workspace/types";

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

  const canCreate =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  if (!workspaceId || !workspaceSlug) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2 mt-4">
      {/* Header Row */}
      <div className="flex items-center justify-between px-2.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {en.project.switcher.sectionTitle}
        </span>
        {canCreate && (
          <CreateProjectDialog
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
          >
            <button
              type="button"
              className="size-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition"
              title={en.project.switcher.createTooltip}
            >
              <Plus className="size-3.5" />
            </button>
          </CreateProjectDialog>
        )}
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex flex-col gap-1.5 px-2.5 py-1">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-4/5 rounded-md" />
        </div>
      ) : projects && projects.length > 0 ? (
        <ul className="flex flex-col gap-y-1">
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
                >
                  <div
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-md font-medium text-xs hover:text-primary transition text-muted-foreground group cursor-pointer",
                      isActive &&
                        "bg-background shadow-xs text-foreground font-semibold"
                    )}
                  >
                    <ProjectAvatar
                      name={project.name}
                      image={project.logo}
                      className="size-5 rounded"
                      fallbackClassName="text-[10px]"
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-3 py-2 text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
          <FolderKanban className="size-3.5 text-muted-foreground/50 shrink-0" />
          <span>{en.project.switcher.noProjects}</span>
        </div>
      )}
    </div>
  );
}
