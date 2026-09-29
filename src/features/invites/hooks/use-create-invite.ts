"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { InviteMemberInput } from "../schema";
import type { WorkspaceInvite } from "../types";

export function useCreateInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteMemberInput) => {
      const res = await apiClient.post<any>(
        `/workspaces/${workspaceId}/invites`,
        data
      );
      return (res.data || res) as WorkspaceInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", workspaceId],
      });
    },
  });
}
