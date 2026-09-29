"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Workspace } from "../types";

export function useWorkspace(workspaceIdOrSlug: string) {
  return useQuery({
    queryKey: ["workspace", workspaceIdOrSlug],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/workspaces/${workspaceIdOrSlug}`);
      return (res.data || res) as Workspace;
    },
    enabled: !!workspaceIdOrSlug,
  });
}
