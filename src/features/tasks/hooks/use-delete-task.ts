"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { en } from "@/locales/en";
import type { TasksResponse } from "../types";

export function useDeleteTask(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!workspaceId || !projectId) {
        throw new Error("Workspace and Project are required to delete a task");
      }

      await apiClient.delete<unknown>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
      );
      return taskId;
    },
    onMutate: async (taskId: string) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: ["tasks", workspaceId, projectId],
      });

      // 2. Snapshot previous queries data
      const previousQueries = queryClient.getQueriesData<InfiniteData<TasksResponse>>({
        queryKey: ["tasks", workspaceId, projectId],
      });

      // 3. Optimistically remove task from all matching caches
      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, projectId] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              tasks: page.tasks.filter((task) => task.id !== taskId),
              totalCount: Math.max(0, (page.totalCount || 1) - 1),
            })),
          };
        }
      );

      return { previousQueries };
    },
    onError: (error: Error, _taskId, context) => {
      // Rollback to previous snapshot on error
      if (context?.previousQueries) {
        for (const [key, value] of context.previousQueries) {
          queryClient.setQueryData(key, value);
        }
      }
      toast.error(error?.message || en.tasks.toasts.deleteError);
    },
    onSuccess: () => {
      toast.success(en.tasks.toasts.deleteSuccess);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-stats", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
      });
    },
  });
}
