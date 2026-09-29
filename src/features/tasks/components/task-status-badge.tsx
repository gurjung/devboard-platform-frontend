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
  const config: StatusConfig = TASK_STATUS_CONFIG[status] || TASK_STATUS_CONFIG.BACKLOG;
  const Icon = config.icon;

  const badgeContent = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-medium transition-colors select-none",
        config.badgeClass,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        interactive && "cursor-pointer hover:opacity-85",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "size-3" : "size-3.5", config.color)} />
      <span>{config.label}</span>
      {interactive && onStatusChange && (
        <ChevronDown className="size-3 opacity-60 ml-0.5" />
      )}
    </div>
  );

  if (!interactive || !onStatusChange) {
    return badgeContent;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {badgeContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36 p-1">
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
                "flex items-center gap-2 cursor-pointer text-xs rounded-lg px-2.5 py-1.5",
                isSelected && "font-semibold bg-accent"
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
