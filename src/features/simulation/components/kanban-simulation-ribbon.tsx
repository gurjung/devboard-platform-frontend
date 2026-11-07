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
    <div className="mb-4 flex flex-col gap-2 transition-all duration-300">
      {/* ─── Mode: Inactive Showcase Toolbar ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                DevBoard Product Walkthrough Lab
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold border-primary text-primary">
                Interactive Tour
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Run the automated walkthrough to experience all flagship features side by side:
            </p>
          </div>
        </div>

        {/* Action Buttons: Full Tour + Individual Quick Demos */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => runScenario("hiring-manager-showcase")}
            className="cursor-pointer gap-2 text-xs font-bold bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-md hover:opacity-95 ring-2 ring-primary/20"
          >
            <Sparkles className="size-3.5 fill-current animate-pulse" />
            Start Full Product Walkthrough
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => runScenario("happy-path-sprint")}
            className="cursor-pointer gap-1.5 text-xs font-semibold border-border hover:bg-accent"
          >
            <Play className="size-3.5 fill-current text-primary" />
            Sprint Lifecycle
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => runScenario("fault-optimistic-rollback")}
            className="cursor-pointer gap-1.5 text-xs font-semibold border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <Flame className="size-3.5 text-destructive" />
            Server Crash Rollback
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => runScenario("fault-network-offline")}
            className="cursor-pointer gap-1.5 text-xs font-semibold border-border hover:bg-accent"
          >
            <WifiOff className="size-3.5 text-muted-foreground" />
            Offline Resilience
          </Button>
        </div>
      </div>
    </div>
  );
}

