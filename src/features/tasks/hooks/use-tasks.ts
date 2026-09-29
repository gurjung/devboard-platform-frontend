"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import type { Task, TaskFilters, TasksResponse } from "../types";

export interface UseTasksOptions {
  workspaceId?: string;
  projectId?: string;
  filters?: TaskFilters;
  pageSize?: number;
}

export function useTasks({
  workspaceId,
  projectId,
  filters = {},
  pageSize = 25,
}: UseTasksOptions) {
  const query = useInfiniteQuery({
    queryKey: ["tasks", workspaceId, projectId, filters],
    queryFn: async ({ pageParam }) => {
      if (!workspaceId || !projectId) {
        return { tasks: [], nextCursor: null, hasMore: false, totalCount: 0 };
      }

      const params = new URLSearchParams();
      params.append("pageSize", String(pageSize));
      if (pageParam) {
        params.append("cursor", String(pageParam));
      }

      if (filters.status && filters.status !== "ALL") {
        params.append("status", filters.status);
      }

      if (filters.priority && filters.priority !== "ALL") {
        params.append("priority", filters.priority);
      }

      if (filters.assigneeId && filters.assigneeId !== "ALL") {
        params.append(
          "assigneeId",
          filters.assigneeId === "UNASSIGNED" ? "unassigned" : filters.assigneeId
        );
      }

      if (filters.dueDate) {
        params.append("dueDate", filters.dueDate);
      }

      if (filters.overdue) {
        params.append("overdue", "true");
      }

      const queryString = params.toString();
      const url = `/workspaces/${workspaceId}/projects/${projectId}/tasks${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await apiClient.get<any>(url);
      const data: TasksResponse = res.data || res;
      return data;
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: Boolean(workspaceId && projectId),
  });

  const allTasks = useMemo(() => {
    if (!query.data?.pages) return [];
    const flattened = query.data.pages.flatMap((page) => page.tasks || []);

    if (filters.search && filters.search.trim() !== "") {
      const searchLower = filters.search.toLowerCase().trim();
      return flattened.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    return flattened;
  }, [query.data?.pages, filters.search]);

  const totalCount =
    query.data?.pages?.[0]?.totalCount ?? allTasks.length;

  return {
    ...query,
    tasks: allTasks,
    totalCount,
  };
}
