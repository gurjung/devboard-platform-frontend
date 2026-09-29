"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { WorkspaceMember } from "../types";

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/workspaces/${workspaceId}/members`);
      return (res.data || res) as WorkspaceMember[];
    },
    enabled: !!workspaceId,
  });
}
