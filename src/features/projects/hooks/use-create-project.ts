"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateProjectInput, Project } from "../types";

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await apiClient.post<any>(
        `/workspaces/${workspaceId}/projects`,
        data
      );
      return (res.data || res) as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });
    },
  });
}
