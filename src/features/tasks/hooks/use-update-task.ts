"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { en } from "@/locales/en";
import type { Task, TasksResponse, UpdateTaskInput } from "../types";

export interface UpdateTaskParams {
  taskId: string;
  projectId?: string;
  data: UpdateTaskInput;
  silent?: boolean;
}

export function useUpdateTask(workspaceId?: string, defaultProjectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, projectId, data }: UpdateTaskParams) => {
      const targetProjectId = projectId || defaultProjectId;
      if (!workspaceId || !targetProjectId) {
        throw new Error("Workspace and Project are required to update a task");
      }

      const res = await apiClient.patch<{ data?: Task } | Task>(
        `/workspaces/${workspaceId}/projects/${targetProjectId}/tasks/${taskId}`,
        data
      );
      return ("data" in res && res.data ? res.data : res) as Task;
    },
    onMutate: async ({ taskId, projectId, data }) => {
      const targetProjectId = projectId || defaultProjectId;

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

      const applyTaskPatch = (oldData: InfiniteData<TasksResponse> | undefined) => {
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
      };

      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, targetProjectId] },
        applyTaskPatch
      );
      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["my-tasks", workspaceId] },
        applyTaskPatch
      );

      const previousSingleTask = queryClient.getQueryData<Task>([
        "task",
        workspaceId,
        targetProjectId,
        taskId,
      ]);
      if (previousSingleTask) {
        queryClient.setQueryData<Task>(
          ["task", workspaceId, targetProjectId, taskId],
          {
            ...previousSingleTask,
            ...data,
            updatedAt: new Date().toISOString(),
          }
        );
      }

      return { previousQueries, previousMyTasksQueries, previousSingleTask, targetProjectId };
    },
    onError: (error: unknown, { taskId }, context) => {
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
      if (context?.previousSingleTask && context?.targetProjectId) {
        queryClient.setQueryData(
          ["task", workspaceId, context.targetProjectId, taskId],
          context.previousSingleTask
        );
      }
      const message =
        error instanceof Error ? error.message : en.tasks.toasts.updateError;
      toast.error(message);
    },
    onSuccess: (_, { silent }) => {
      if (!silent) {
        toast.success(en.tasks.toasts.updateSuccess);
      }
    },
    onSettled: (_, __, { projectId }) => {
      const targetProjectId = projectId || defaultProjectId;
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
