"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { NotificationsResponse } from "../types";

export interface UseNotificationsOptions {
  unreadOnly?: boolean;
  pageSize?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { unreadOnly = false, pageSize = 30 } = options;

  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unreadOnly) params.append("unreadOnly", "true");
      params.append("pageSize", String(pageSize));

      const res = await apiClient.get<any>(`/notifications?${params.toString()}`);
      return (res.data || res) as NotificationsResponse;
    },
    staleTime: 1000 * 30, // 30s cache
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiClient.patch<any>(`/notifications/${notificationId}/read`);
      return res.data || res;
    },
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Optimistically update all matching notifications queries
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unreadCount: Math.max(0, old.unreadCount - 1),
            notifications: old.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch<any>("/notifications/read-all");
      return res.data || res;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unreadCount: 0,
            notifications: old.notifications.map((n) => ({
              ...n,
              isRead: true,
            })),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.delete(`/notifications/${notificationId}`);
    },
    onMutate: async (notificationId: string) => {
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return old;
          const wasUnread = old.notifications.find((n) => n.id === notificationId)?.isRead === false;
          return {
            ...old,
            unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
            totalCount: Math.max(0, old.totalCount - 1),
            notifications: old.notifications.filter((n) => n.id !== notificationId),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

