"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProjectAvatarProps {
  name: string;
  image?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export function ProjectAvatar({
  name,
  image,
  className,
  fallbackClassName,
}: ProjectAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "P";

  return (
    <Avatar className={cn("size-6 rounded-md", className)}>
      <AvatarImage src={image || undefined} alt={name} className="object-cover" />
      <AvatarFallback
        className={cn(
          "rounded-md bg-primary/10 text-primary font-semibold text-xs",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
