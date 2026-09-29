"use client";

import { useProjects } from "./use-projects";
import type { Project } from "../types";

export function useProject(workspaceId?: string, projectSlugOrId?: string) {
  const { data: projects, isLoading, isError, error } = useProjects(workspaceId);

  const project = projects?.find(
    (p) => p.slug === projectSlugOrId || p.id === projectSlugOrId
  );

  return {
    project: project as Project | undefined,
    isLoading,
    isError,
    error,
  };
}
