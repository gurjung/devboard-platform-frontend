"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useWorkspaceStats(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace-stats", workspaceId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/workspaces/${workspaceId}/stats`);
      return res.data || res;
    },
    enabled: !!workspaceId,
  });
}
