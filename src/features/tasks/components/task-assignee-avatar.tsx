"use client";

import * as React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { TaskUserSummary } from "../types";

interface TaskAssigneeAvatarProps {
  assignee?: TaskUserSummary | null;
  size?: "sm" | "default" | "xs";
  showName?: boolean;
  className?: string;
}

export function TaskAssigneeAvatar({
  assignee,
  size = "default",
  showName = false,
  className,
}: TaskAssigneeAvatarProps) {
  if (!assignee) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-muted-foreground",
          className
        )}
      >
        <div
          className={cn(
            "rounded-full border border-dashed border-border flex items-center justify-center bg-muted/40",
            size === "xs" && "size-5",
            size === "sm" && "size-6",
            size === "default" && "size-7"
          )}
        >
          <User className={cn(size === "xs" ? "size-3" : "size-3.5", "opacity-60")} />
        </div>
        {showName && (
          <span className="text-xs text-muted-foreground italic">Unassigned</span>
        )}
      </div>
    );
  }

  const displayName = assignee.name || assignee.email.split("@")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSizeProp = size === "xs" || size === "sm" ? "sm" : "default";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        className
      )}
      title={`${displayName} (${assignee.email})`}
    >
      <Avatar
        size={avatarSizeProp}
        className={cn(
          "ring-1 ring-border/50",
          size === "xs" && "size-5 text-[9px]",
          size === "sm" && "size-6 text-[10px]",
          size === "default" && "size-7 text-xs"
        )}
      >
        {assignee.image && (
          <AvatarImage src={assignee.image} alt={displayName} />
        )}
        <AvatarFallback className="font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-xs font-medium text-foreground truncate max-w-32">
          {displayName}
        </span>
      )}
    </div>
  );
}
