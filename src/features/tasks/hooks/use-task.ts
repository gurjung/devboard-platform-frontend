"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Task } from "../types";

export function useTask(
  workspaceId?: string,
  projectId?: string,
  taskId?: string
) {
  return useQuery({
    queryKey: ["task", workspaceId, projectId, taskId],
    queryFn: async () => {
      if (!workspaceId || !projectId || !taskId) return null;
      const res = await apiClient.get<any>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
      );
      return (res.data || res) as Task;
    },
    enabled: Boolean(workspaceId && projectId && taskId),
  });
}
