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
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const handleSelectView = (view: TaskView) => {
    onViewChange(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let targetIndex: number | null = null;

    if (e.key === "ArrowRight") {
      targetIndex = (index + 1) % TASK_VIEWS.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (index - 1 + TASK_VIEWS.length) % TASK_VIEWS.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = TASK_VIEWS.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      const targetView = TASK_VIEWS[targetIndex];
      tabRefs.current[targetView.id]?.focus();
      handleSelectView(targetView.id);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center h-8 p-0.5 rounded-lg bg-muted/60 border border-input gap-0.5",
        className
      )}
      role="tablist"
      aria-label="Task Views"
    >
      {TASK_VIEWS.map((v, index) => {
        const Icon = v.icon;
        const isActive = currentView === v.id;
        return (
          <button
            key={v.id}
            ref={(el) => {
              tabRefs.current[v.id] = el;
            }}
            id={`view-tab-${v.id}`}
            type="button"
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={`view-panel-${v.id}`}
            onClick={() => handleSelectView(v.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring",
              isActive
                ? "bg-background text-foreground shadow-2xs ring-1 ring-border/70"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-3.5 shrink-0",
                isActive ? "text-brand-text" : "text-muted-foreground"
              )}
            />
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
