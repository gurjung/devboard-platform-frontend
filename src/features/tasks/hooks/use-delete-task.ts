"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { en } from "@/locales/en";

export function useDeleteTask(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!workspaceId || !projectId) {
        throw new Error("Workspace and Project are required to delete a task");
      }

      await apiClient.delete<any>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
      );
      return taskId;
    },
    onSuccess: (deletedTaskId) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-stats", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
      });
      toast.success(en.tasks.toasts.deleteSuccess);
    },
    onError: (error: any) => {
      toast.error(error?.message || en.tasks.toasts.deleteError);
    },
  });
}
