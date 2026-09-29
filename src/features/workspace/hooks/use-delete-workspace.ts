"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useDeleteWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.removeQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
}
