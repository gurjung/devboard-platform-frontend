"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { WorkspaceRole } from "../types";

export function useUpdateMemberRole(defaultWorkspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId = defaultWorkspaceId,
      memberId,
      role,
    }: {
      workspaceId?: string;
      memberId: string;
      role: WorkspaceRole;
    }) => {
      const targetWorkspaceId = workspaceId || defaultWorkspaceId;
      const res = await apiClient.patch<any>(
        `/workspaces/${targetWorkspaceId}/members/${memberId}`,
        { role }
      );
      return res.data || res;
    },
    onSuccess: (_, vars) => {
      const targetWorkspaceId = vars.workspaceId || defaultWorkspaceId;
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", targetWorkspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", targetWorkspaceId],
      });
    },
  });
}
