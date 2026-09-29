"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { TASK_VIEWS } from "../constants";
import type { TaskView } from "../types";

interface ViewSelectorProps {
  currentView: TaskView;
  onViewChange: (view: TaskView) => void;
  className?: string;
}

export function ViewSelector({
  currentView,
  onViewChange,
  className,
}: ViewSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelectView = (view: TaskView) => {
    onViewChange(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 shadow-2xs gap-1",
        className
      )}
      role="tablist"
      aria-label="Task Views"
    >
      {TASK_VIEWS.map((v) => {
        const Icon = v.icon;
        const isActive = currentView === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelectView(v.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none",
              isActive
                ? "bg-background text-foreground shadow-2xs font-semibold ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <Icon className={cn("size-3.5", isActive ? "text-primary" : "opacity-70")} />
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
