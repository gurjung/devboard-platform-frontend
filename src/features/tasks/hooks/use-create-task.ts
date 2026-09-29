"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { en } from "@/locales/en";
import type { CreateTaskInput, Task } from "../types";

export function useCreateTask(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      if (!workspaceId || !projectId) {
        throw new Error("Workspace and Project are required to create a task");
      }

      const res = await apiClient.post<any>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        data
      );
      return (res.data || res) as Task;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-stats", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
      });
      toast.success(en.tasks.toasts.createSuccess);
    },
    onError: (error: any) => {
      toast.error(error?.message || en.tasks.toasts.createError);
    },
  });
}
