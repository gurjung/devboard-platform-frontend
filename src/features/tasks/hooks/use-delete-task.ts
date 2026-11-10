"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { en } from "@/locales/en";
import type { TasksResponse } from "../types";

export type DeleteTaskInput = string | { taskId: string; projectId?: string };

function parseDeleteInput(input: DeleteTaskInput, defaultProjectId?: string) {
  if (typeof input === "string") {
    return { taskId: input, targetProjectId: defaultProjectId };
  }
  return {
    taskId: input.taskId,
    targetProjectId: input.projectId || defaultProjectId,
  };
}

export function useDeleteTask(workspaceId?: string, defaultProjectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteTaskInput) => {
      const { taskId, targetProjectId } = parseDeleteInput(input, defaultProjectId);
      if (!workspaceId || !targetProjectId) {
        throw new Error("Workspace and Project are required to delete a task");
      }

      await apiClient.delete<unknown>(
        `/workspaces/${workspaceId}/projects/${targetProjectId}/tasks/${taskId}`
      );
      return taskId;
    },
    onMutate: async (input: DeleteTaskInput) => {
      const { taskId, targetProjectId } = parseDeleteInput(input, defaultProjectId);

      await queryClient.cancelQueries({
        queryKey: ["tasks", workspaceId, targetProjectId],
      });
      await queryClient.cancelQueries({
        queryKey: ["my-tasks", workspaceId],
      });

      const previousQueries = queryClient.getQueriesData<InfiniteData<TasksResponse>>({
        queryKey: ["tasks", workspaceId, targetProjectId],
      });
      const previousMyTasksQueries = queryClient.getQueriesData<InfiniteData<TasksResponse>>({
        queryKey: ["my-tasks", workspaceId],
      });

      const applyRemoval = (oldData: InfiniteData<TasksResponse> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            tasks: page.tasks.filter((task) => task.id !== taskId),
            totalCount: Math.max(0, (page.totalCount || 1) - 1),
          })),
        };
      };

      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, targetProjectId] },
        applyRemoval
      );
      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["my-tasks", workspaceId] },
        applyRemoval
      );

      return { previousQueries, previousMyTasksQueries };
    },
    onError: (error: Error, _input, context) => {
      if (context?.previousQueries) {
        for (const [key, value] of context.previousQueries) {
          queryClient.setQueryData(key, value);
        }
      }
      if (context?.previousMyTasksQueries) {
        for (const [key, value] of context.previousMyTasksQueries) {
          queryClient.setQueryData(key, value);
        }
      }
      toast.error(error?.message || en.tasks.toasts.deleteError);
    },
    onSuccess: () => {
      toast.success(en.tasks.toasts.deleteSuccess);
    },
    onSettled: (_, __, input) => {
      const { targetProjectId } = parseDeleteInput(input, defaultProjectId);
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId, targetProjectId],
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
