"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AcceptInviteResponse } from "../types";

export function useAcceptInvite(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<any>(`/invites/${token}/accept`, {});
      return (res.data || res) as AcceptInviteResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (data?.workspace?.id) {
        queryClient.invalidateQueries({
          queryKey: ["workspace", data.workspace.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["workspace-members", data.workspace.id],
        });
      }
      if (data?.workspace?.slug) {
        queryClient.invalidateQueries({
          queryKey: ["workspace", data.workspace.slug],
        });
      }
    },
  });
}
