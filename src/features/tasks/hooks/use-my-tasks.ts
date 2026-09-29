"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import type { Task, TaskFilters, TasksResponse } from "../types";

export interface UseMyTasksOptions {
  workspaceId?: string;
  filters?: Omit<TaskFilters, "assigneeId">;
  pageSize?: number;
}

export function useMyTasks({
  workspaceId,
  filters = {},
  pageSize = 25,
}: UseMyTasksOptions) {
  const { search, ...serverFilters } = filters;

  const query = useInfiniteQuery({
    queryKey: ["my-tasks", workspaceId, serverFilters],
    queryFn: async ({ pageParam }) => {
      if (!workspaceId) {
        return { tasks: [], nextCursor: null, hasMore: false, totalCount: 0 };
      }

      const params = new URLSearchParams();
      params.append("pageSize", String(pageSize));
      if (pageParam) {
        params.append("cursor", String(pageParam));
      }

      if (serverFilters.status && serverFilters.status !== "ALL") {
        params.append("status", serverFilters.status);
      }

      if (serverFilters.priority && serverFilters.priority !== "ALL") {
        params.append("priority", serverFilters.priority);
      }

      if (serverFilters.dueDate) {
        params.append("dueDate", serverFilters.dueDate);
      }

      if (serverFilters.overdue) {
        params.append("overdue", "true");
      }

      const queryString = params.toString();
      const url = `/workspaces/${workspaceId}/my-tasks${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await apiClient.get<any>(url);
      const data: TasksResponse = res.data || res;
      return data;
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: Boolean(workspaceId),
  });

  const allTasks = useMemo(() => {
    if (!query.data?.pages) return [];
    const flattened = query.data.pages.flatMap((page) => page.tasks || []);

    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      return flattened.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.project?.name.toLowerCase().includes(searchLower)
      );
    }

    return flattened;
  }, [query.data?.pages, search]);

  const totalCount =
    query.data?.pages?.[0]?.totalCount ?? allTasks.length;

  return {
    ...query,
    tasks: allTasks,
    totalCount,
  };
}
