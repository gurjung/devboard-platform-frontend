"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CheckSquare,
  ArrowRightCircle,
  ShieldCheck,
  FolderPlus,
  Clock,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "../hooks/use-notifications";
import type { Notification, NotificationType } from "../types";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "TASK_ASSIGNED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <CheckSquare className="size-4" />
        </div>
      );
    case "TASK_STATUS_CHANGED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ArrowRightCircle className="size-4" />
        </div>
      );
    case "MEMBER_ROLE_UPDATED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <ShieldCheck className="size-4" />
        </div>
      );
    case "PROJECT_CREATED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <FolderPlus className="size-4" />
        </div>
      );
    default:
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground border border-border">
          <Bell className="size-4" />
        </div>
      );
  }
};

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Filter based on active tab
  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-xl border border-transparent transition-all cursor-pointer outline-none hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring",
          isOpen && "bg-muted border-border"
        )}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="size-4.5 text-foreground/80 transition-transform active:scale-95" />

        {/* Live Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
            <span className="relative">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Flyout Panel (Jira-style) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-[340px] sm:w-[400px] rounded-2xl bg-popover text-popover-foreground border border-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border-primary/20"
                >
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                title="Mark all as read"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50 bg-background/50">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "all"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "unread"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="flex size-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2.5">
                  <Sparkles className="size-5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-foreground">
                  {activeTab === "unread"
                    ? "All caught up!"
                    : "No notifications yet"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                  {activeTab === "unread"
                    ? "You don't have any unread notifications."
                    : "You'll be notified when tasks are assigned or updated."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notification) => {
                const formattedTime = formatDistanceToNowStrict(
                  new Date(notification.createdAt),
                  { addSuffix: true }
                );

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/50",
                      !notification.isRead && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    {/* Event Type Icon */}
                    {getNotificationIcon(notification.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/75 mt-1">
                        <Clock className="size-3" />
                        <span>{formattedTime}</span>
                        {notification.actor?.name && (
                          <>
                            <span>•</span>
                            <span>{notification.actor.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Action on Hover */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
