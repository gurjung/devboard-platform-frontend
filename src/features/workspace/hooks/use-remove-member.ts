"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useRemoveMember(defaultWorkspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: string | { workspaceId?: string; memberId: string }
    ) => {
      const memberId = typeof params === "string" ? params : params.memberId;
      const workspaceId =
        (typeof params === "object" ? params.workspaceId : undefined) ||
        defaultWorkspaceId;
      return apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    },
    onSuccess: (_, params) => {
      const workspaceId =
        (typeof params === "object" ? params.workspaceId : undefined) ||
        defaultWorkspaceId;
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
