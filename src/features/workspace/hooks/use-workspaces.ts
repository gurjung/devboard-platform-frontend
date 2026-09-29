"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Workspace } from "../types";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/workspaces");
      return (res.data || res) as Workspace[];
    },
  });
}
