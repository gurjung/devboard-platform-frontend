"use client";

import React, { useState, useRef, useEffect, useId } from "react";
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
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
          <CheckSquare className="size-4" aria-hidden="true" />
        </div>
      );
    case "TASK_STATUS_CHANGED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <ArrowRightCircle className="size-4" aria-hidden="true" />
        </div>
      );
    case "MEMBER_ROLE_UPDATED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </div>
      );
    case "PROJECT_CREATED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          <FolderPlus className="size-4" aria-hidden="true" />
        </div>
      );
    default:
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground border border-border">
          <Bell className="size-4" aria-hidden="true" />
        </div>
      );
  }
};

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelHeadingId = useId();
  const panelId = useId();

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

  useEffect(() => {
    if (!isOpen) return;
    const frameId = requestAnimationFrame(() => {
      panelRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  // Close on outside click or Escape
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
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
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
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative flex size-8 items-center justify-center rounded-md border border-transparent transition-colors cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring",
          isOpen && "bg-muted border-border text-foreground"
        )}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <Bell className="size-4 transition-transform active:scale-95" aria-hidden="true" />

        {/* Live Unread Badge */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold shadow-xs"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
            <span className="relative">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div
          id={panelId}
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-labelledby={panelHeadingId}
          className="absolute right-0 top-full mt-2 w-[330px] sm:w-[390px] rounded-xl bg-popover text-popover-foreground border border-border shadow-2xl z-50 overflow-hidden outline-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <h2 id={panelHeadingId} className="font-bold text-sm tracking-tight">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-brand-text border-primary/20"
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
                className="flex items-center gap-1 min-h-6 px-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50 bg-background/50">
            <button
              type="button"
              aria-pressed={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-2.5 py-1 min-h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "all"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              aria-pressed={activeTab === "unread"}
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-2.5 py-1 min-h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "unread"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="max-h-[380px] overflow-y-auto">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="flex size-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2.5">
                  <Sparkles className="size-5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
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
              <ul className="divide-y divide-border/35">
                {displayedNotifications.map((notification) => {
                  const formattedTime = formatDistanceToNowStrict(
                    new Date(notification.createdAt),
                    { addSuffix: true }
                  );

                  return (
                    <li
                      key={notification.id}
                      className={cn(
                        "group relative flex items-start transition-colors hover:bg-muted/50",
                        !notification.isRead && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="flex flex-1 min-w-0 items-start gap-3 p-3.5 pr-11 text-left cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                      >
                        {/* Event Type Icon */}
                        {getNotificationIcon(notification.type)}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {notification.title}
                            </span>
                            {!notification.isRead && (
                              <span
                                aria-label="Unread"
                                className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                            <Clock className="size-3" aria-hidden="true" />
                            <span>{formattedTime}</span>
                            {notification.actor?.name && (
                              <>
                                <span aria-hidden="true">•</span>
                                <span>{notification.actor.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Delete Action on Hover / Focus */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="absolute top-3 right-2.5 flex size-6 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive-text hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer"
                        aria-label={`Delete notification: ${notification.title}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

