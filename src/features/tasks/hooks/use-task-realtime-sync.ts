"use client";

import { useEffect } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/socket-provider";
import { useAuth } from "@/features/auth/context/auth-context";
import type { Task, TasksResponse } from "../types";

interface UseTaskRealtimeSyncProps {
  workspaceId?: string;
  projectId?: string;
}

export function useTaskRealtimeSync({
  workspaceId,
  projectId,
}: UseTaskRealtimeSyncProps) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !workspaceId || !projectId) return;

    // 1. Task Created Listener
    const handleTaskCreated = ({
      task,
      actorId,
    }: {
      task: Task;
      actorId: string;
    }) => {
      // Update infinite query caches
      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, projectId] },
        (oldData) => {
          if (!oldData || !oldData.pages.length) return oldData;

          const exists = oldData.pages.some((page) =>
            page.tasks.some((t) => t.id === task.id)
          );
          if (exists) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page, idx) =>
              idx === 0
                ? {
                    ...page,
                    tasks: [task, ...page.tasks],
                    totalCount: (page.totalCount || 0) + 1,
                  }
                : page
            ),
          };
        }
      );

      // Invalidate count or task list to ensure accurate cursor pagination
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId, projectId],
        refetchType: "none",
      });

      // Show toast if created by another user
      if (actorId !== user?.id) {
        toast.info(`Task created: "${task.title}"`, {
          description: `By ${task.createdBy?.name || "a collaborator"}`,
        });
      }
    };

    // 2. Task Updated Listener
    const handleTaskUpdated = ({
      task,
      actorId,
    }: {
      task: Task;
      actorId: string;
    }) => {
      // If current user caused this, their optimistic update already updated the cache
      if (actorId === user?.id) return;

      // Update all matching infinite query caches for this project
      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, projectId] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              tasks: page.tasks.map((t) =>
                t.id === task.id ? { ...t, ...task } : t
              ),
            })),
          };
        }
      );

      // Update single task query if active
      queryClient.setQueryData<Task>(
        ["task", workspaceId, projectId, task.id],
        (oldTask) => (oldTask ? { ...oldTask, ...task } : oldTask)
      );
    };

    // 3. Task Deleted Listener
    const handleTaskDeleted = ({
      taskId,
      actorId,
    }: {
      taskId: string;
      actorId: string;
    }) => {
      if (actorId === user?.id) return;

      queryClient.setQueriesData<InfiniteData<TasksResponse>>(
        { queryKey: ["tasks", workspaceId, projectId] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              tasks: page.tasks.filter((t) => t.id !== taskId),
              totalCount: Math.max(0, (page.totalCount || 1) - 1),
            })),
          };
        }
      );

      // Invalidate to clean up any cached references
      queryClient.removeQueries({
        queryKey: ["task", workspaceId, projectId, taskId],
      });
    };

    // 4. On Reconnect: Invalidate queries to reconcile any missed events
    const handleReconnect = () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId, projectId],
      });
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
      socket.off("connect", handleReconnect);
    };
  }, [socket, workspaceId, projectId, user?.id, queryClient]);

  return { isConnected };
}

