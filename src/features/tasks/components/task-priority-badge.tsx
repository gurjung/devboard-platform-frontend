"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  TASK_PRIORITY_CONFIG,
  TASK_PRIORITIES,
  type PriorityConfig,
} from "../constants";
import type { TaskPriority } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  onPriorityChange?: (newPriority: TaskPriority) => void;
  className?: string;
  size?: "sm" | "default";
  interactive?: boolean;
}

export function TaskPriorityBadge({
  priority,
  onPriorityChange,
  className,
  size = "default",
  interactive = false,
}: TaskPriorityBadgeProps) {
  const config: PriorityConfig =
    TASK_PRIORITY_CONFIG[priority] || TASK_PRIORITY_CONFIG.MEDIUM;
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
      {interactive && onPriorityChange && (
        <ChevronDown className="size-3 opacity-60 ml-0.5" />
      )}
    </div>
  );

  if (!interactive || !onPriorityChange) {
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
      <DropdownMenuContent align="start" className="min-w-32 p-1">
        {TASK_PRIORITIES.map((pr) => {
          const itemConfig = TASK_PRIORITY_CONFIG[pr];
          const ItemIcon = itemConfig.icon;
          const isSelected = pr === priority;
          return (
            <DropdownMenuItem
              key={pr}
              onClick={(e) => {
                e.stopPropagation();
                if (pr !== priority) {
                  onPriorityChange(pr);
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
