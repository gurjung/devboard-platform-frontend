"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { InvitePreview } from "../types";

export function useInvite(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/invites/${token}`, {
        skipAuth: true,
      });
      return (res.data || res) as InvitePreview;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
