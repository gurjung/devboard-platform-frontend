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
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors select-none shrink-0",
        config.badgeClass,
        size === "sm"
          ? "min-w-[78px] px-2 py-0.5 text-[11px]"
          : "min-w-[86px] px-2.5 py-1 text-xs",
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
      {interactive && onPriorityChange && (
        <ChevronDown className="size-3 ml-0.5 shrink-0" />
      )}
    </span>
  );

  if (!interactive || !onPriorityChange) {
    return badgeContent;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Priority: ${config.label}. Change priority`}
      >
        {badgeContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-32 p-1 rounded-xl">
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
