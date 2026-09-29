"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Loader2,
  User,
} from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProject } from "@/features/projects/hooks/use-project";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceRole } from "@/features/workspace/types";

interface ProjectPageProps {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
  }>;
}

export default function ProjectHomePage({ params }: ProjectPageProps) {
  const { workspaceSlug, projectSlug } = use(params);
  const router = useRouter();

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  const {
    project,
    isLoading: isProjectLoading,
    isError,
  } = useProject(currentWorkspace?.id, projectSlug);

  const isLoading = isWorkspacesLoading || isProjectLoading;
  const role = (currentWorkspace?.role || "MEMBER").toUpperCase() as WorkspaceRole;
  const canManage = role === "OWNER" || role === "ADMIN";

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FolderKanban className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Project not found</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          The project you are looking for does not exist or you don't have access to it.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 text-xs cursor-pointer"
          onClick={() => router.push(`/dashboard/${workspaceSlug}`)}
        >
          Back to Workspace Overview
        </Button>
      </div>
    );
  }

  const createdDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
      {/* Project Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5">
          <ProjectAvatar
            name={project.name}
            image={project.logo}
            className="size-12 rounded-xl border border-border shadow-xs"
            fallbackClassName="text-sm font-bold"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                Project
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Part of{" "}
              <Link
                href={`/dashboard/${workspaceSlug}`}
                className="font-medium hover:underline text-foreground"
              >
                {currentWorkspace?.name}
              </Link>
              {createdDate && ` • Created on ${createdDate}`}
            </p>
          </div>
        </div>

        {canManage && (
          <Link
            href={`/dashboard/${workspaceSlug}/projects/${project.slug}/settings`}
          >
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <Settings className="size-3.5" />
              <span>Project Settings</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Project Overview Teaser for Phase 5 (Tasks) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created By</span>
            <User className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate mt-1">
            {project.createdBy?.name || project.createdBy?.email || "Workspace Admin"}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {project.createdBy?.email || ""}
          </span>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Workspace</span>
            <Layers className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate mt-1">
            {currentWorkspace?.name}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            Role: {role}
          </span>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status</span>
            <CheckCircle2 className="size-3.5 text-emerald-500" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate mt-1">
            Active
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Ready for tasks
          </span>
        </div>
      </div>

      {/* Phase 5 Tasks Preview Teaser */}
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
          <FolderKanban className="size-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-bold text-foreground flex items-center justify-center gap-2">
            <span>Task Engine (Phase 5)</span>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Coming Up
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Phase 5 will bring interactive <strong>Table</strong>, drag-and-drop <strong>Kanban</strong>, and monthly <strong>Calendar</strong> views directly inside this project board.
          </p>
        </div>
      </div>
    </div>
  );
}
