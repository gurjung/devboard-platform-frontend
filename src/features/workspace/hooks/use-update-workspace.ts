"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UpdateWorkspaceInput } from "../schema";
import type { Workspace } from "../types";

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWorkspaceInput) => {
      const res = await apiClient.patch<any>(`/workspaces/${workspaceId}`, data);
      return (res.data || res) as Workspace;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      if (updated?.slug) {
        queryClient.invalidateQueries({ queryKey: ["workspace", updated.slug] });
      }
    },
  });
}
