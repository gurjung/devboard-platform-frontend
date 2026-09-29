"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateWorkspaceInput } from "../schema";
import type { Workspace } from "../types";

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceInput) => {
      const res = await apiClient.post<any>("/workspaces", data);
      return (res.data || res) as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
