"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { en } from "@/locales/en";
import type { Task, TasksResponse, UpdateTaskInput } from "../types";

export interface UpdateTaskParams {
  taskId: string;
  data: UpdateTaskInput;
  silent?: boolean;
}

export function useUpdateTask(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: UpdateTaskParams) => {
      if (!workspaceId || !projectId) {
        throw new Error("Workspace and Project are required to update a task");
      }

      const res = await apiClient.patch<any>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        data
      );
      return (res.data || res) as Task;
    },
    onMutate: async ({ taskId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["tasks", workspaceId, projectId],
      });

      // Snapshot previous queries data
      const previousQueries = queryClient.getQueriesData<InfiniteData<TasksResponse>>({
        queryKey: ["tasks", workspaceId, projectId],
      });

      // Optimistically update all matching infinite query caches
      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, projectId] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              tasks: page.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      ...data,
                      updatedAt: new Date().toISOString(),
                    }
                  : task
              ),
            })),
          };
        }
      );

      // Also update single task cache if present
      const previousSingleTask = queryClient.getQueryData<Task>([
        "task",
        workspaceId,
        projectId,
        taskId,
      ]);
      if (previousSingleTask) {
        queryClient.setQueryData<Task>(
          ["task", workspaceId, projectId, taskId],
          {
            ...previousSingleTask,
            ...data,
            updatedAt: new Date().toISOString(),
          }
        );
      }

      return { previousQueries, previousSingleTask };
    },
    onError: (error: any, { taskId }, context) => {
      // Rollback caches on error
      if (context?.previousQueries) {
        for (const [key, value] of context.previousQueries) {
          queryClient.setQueryData(key, value);
        }
      }
      if (context?.previousSingleTask) {
        queryClient.setQueryData(
          ["task", workspaceId, projectId, taskId],
          context.previousSingleTask
        );
      }
      toast.error(error?.message || en.tasks.toasts.updateError);
    },
    onSuccess: (_, { silent }) => {
      if (!silent) {
        toast.success(en.tasks.toasts.updateSuccess);
      }
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
