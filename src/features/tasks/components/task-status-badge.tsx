"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_CONFIG,
  TASK_STATUSES,
  type StatusConfig,
} from "../constants";
import type { TaskStatus } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  onStatusChange?: (newStatus: TaskStatus) => void;
  className?: string;
  size?: "sm" | "default";
  interactive?: boolean;
}

export function TaskStatusBadge({
  status,
  onStatusChange,
  className,
  size = "default",
  interactive = false,
}: TaskStatusBadgeProps) {
  const config: StatusConfig =
    TASK_STATUS_CONFIG[status] || TASK_STATUS_CONFIG.BACKLOG;
  const Icon = config.icon;

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors select-none shrink-0",
        config.badgeClass,
        size === "sm"
          ? "min-w-[92px] px-2 py-0.5 text-[11px]"
          : "min-w-[104px] px-2.5 py-1 text-xs",
        interactive && "min-h-6 cursor-pointer hover:brightness-95 dark:hover:brightness-110",
        className
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "size-3" : "size-3.5",
          config.color,
          "shrink-0"
        )}
      />
      <span className="truncate">{config.label}</span>
      {interactive && onStatusChange && (
        <ChevronDown className="size-3 ml-0.5 shrink-0" />
      )}
    </span>
  );

  if (!interactive || !onStatusChange) {
    return badgeContent;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Status: ${config.label}. Change status`}
      >
        {badgeContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36 p-1 rounded-xl">
        {TASK_STATUSES.map((st) => {
          const itemConfig = TASK_STATUS_CONFIG[st];
          const ItemIcon = itemConfig.icon;
          const isSelected = st === status;
          return (
            <DropdownMenuItem
              key={st}
              onClick={(e) => {
                e.stopPropagation();
                if (st !== status) {
                  onStatusChange(st);
                }
              }}
              className={cn(
                "flex items-center gap-2 cursor-pointer text-xs rounded-md px-2 py-1.5",
                isSelected && "font-semibold bg-accent text-accent-foreground"
              )}
            >
              <ItemIcon className={cn("size-3.5", itemConfig.color)} />
              <span>{itemConfig.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
