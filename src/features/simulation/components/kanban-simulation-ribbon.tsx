"use client";

import React from "react";
import {
  Play,
  Flame,
  WifiOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from "../context/simulation-context";

export function KanbanSimulationRibbon() {
  const { isDemo, status, runScenario } = useSimulation();

  if (!isDemo) {
    return null;
  }

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isActive = isRunning || isPaused;

  // When a tour is actively running, hide ribbon so Kanban board remains clean and unobstructed
  if (isActive) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-col gap-2">
      {/* ─── Mode: Inactive Showcase Toolbar ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/80 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-brand-text border border-primary/20 shrink-0">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-tight text-foreground">
                DevBoard Product Walkthrough Lab
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4.5 font-medium rounded-md border-primary/30 bg-primary/10 text-brand-text"
              >
                Interactive Tour
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Run the automated walkthrough to experience all flagship features side by side:
            </p>
          </div>
        </div>

        {/* Action Buttons: Full Tour + Individual Quick Demos */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={() => runScenario("hiring-manager-showcase")}
            className="h-8 px-3 cursor-pointer gap-1.5 text-xs font-medium rounded-lg shadow-2xs"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Start Full Product Walkthrough
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => runScenario("happy-path-sprint")}
            className="h-8 px-2.5 cursor-pointer gap-1.5 text-xs font-medium rounded-lg bg-background/60 dark:bg-card border-input hover:bg-accent"
          >
            <Play className="size-3.5 fill-current text-brand-text" aria-hidden="true" />
            Sprint Lifecycle
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => runScenario("fault-optimistic-rollback")}
            className="h-8 px-2.5 cursor-pointer gap-1.5 text-xs font-medium rounded-lg bg-background/60 dark:bg-card border-input hover:bg-destructive/10 hover:border-destructive/35 hover:text-destructive-text"
          >
            <Flame className="size-3.5 text-destructive-text" aria-hidden="true" />
            Server Crash Rollback
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => runScenario("fault-network-offline")}
            className="h-8 px-2.5 cursor-pointer gap-1.5 text-xs font-medium rounded-lg bg-background/60 dark:bg-card border-input hover:bg-accent"
          >
            <WifiOff className="size-3.5 text-muted-foreground" aria-hidden="true" />
            Offline Resilience
          </Button>
        </div>
      </div>
    </div>
  );
}

