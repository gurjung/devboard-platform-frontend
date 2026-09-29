"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UpdateProjectInput, Project } from "../types";

export function useUpdateProject(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectInput) => {
      const res = await apiClient.patch<any>(
        `/workspaces/${workspaceId}/projects/${projectId}`,
        data
      );
      return (res.data || res) as Project;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      if (updated?.slug) {
        queryClient.invalidateQueries({
          queryKey: ["project", workspaceId, updated.slug],
        });
      }
    },
  });
}
