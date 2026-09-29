"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Project } from "../types";

export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await apiClient.get<any>(
        `/workspaces/${workspaceId}/projects`
      );
      return (res.data || res) as Project[];
    },
    enabled: Boolean(workspaceId),
  });
}
