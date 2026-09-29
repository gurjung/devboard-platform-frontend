"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProject } from "@/features/projects/hooks/use-project";
import { ProjectForm } from "@/features/projects/components/project-form";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";
import type { WorkspaceRole } from "@/features/workspace/types";

interface ProjectSettingsPageProps {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
  }>;
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
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

  if (isError || !project || !currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold text-foreground">Project not found</h2>
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

  // Access Denied for regular MEMBERS
  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
          <ShieldAlert className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {en.project.settingsPage.accessDeniedTitle}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {en.project.settingsPage.accessDeniedDescription}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 text-xs cursor-pointer"
          onClick={() =>
            router.push(`/dashboard/${workspaceSlug}/projects/${project.slug}`)
          }
        >
          Back to Project
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-5">
        <Link
          href={`/dashboard/${workspaceSlug}/projects/${project.slug}`}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {en.project.settingsPage.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage settings and identity for{" "}
            <strong className="text-foreground">{project.name}</strong>.
          </p>
        </div>
      </div>

      <ProjectForm
        workspaceId={currentWorkspace.id}
        workspaceSlug={currentWorkspace.slug}
        project={project}
        currentUserRole={role}
      />
    </div>
  );
}
