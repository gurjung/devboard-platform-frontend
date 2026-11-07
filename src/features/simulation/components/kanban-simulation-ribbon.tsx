"use client";

import React from "react";
import {
  Play,
  Pause,
  Square,
  FastForward,
  Flame,
  WifiOff,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Activity,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from "../context/simulation-context";
import { cn } from "@/lib/utils";

export function KanbanSimulationRibbon() {
  const {
    isDemo,
    activeScenario,
    status,
    currentStepIndex,
    currentStep,
    storyBanner,
    runScenario,
    pause,
    resume,
    stop,
    stepForward,
    setStoryBanner,
  } = useSimulation();

  if (!isDemo) {
    return null;
  }

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isActive = isRunning || isPaused;

  return (
    <div className="mb-4 flex flex-col gap-2 transition-all duration-300">
      {/* ─── Mode 1: Active Guided Story Card ──────────────────────────────── */}
      {isActive && activeScenario ? (
        <div
          role="region"
          aria-label="Active Simulation Story"
          className={cn(
            "rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2",
            storyBanner?.type === "error" || storyBanner?.type === "warning"
              ? "border-destructive/40 bg-destructive/10 text-foreground"
              : storyBanner?.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
              : "border-primary/40 bg-primary/5 text-foreground"
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Live Story Narrative */}
            <div className="flex items-start gap-3 flex-1">
              <div
                className={cn(
                  "p-2 rounded-xl shrink-0 mt-0.5",
                  storyBanner?.type === "error" || storyBanner?.type === "warning"
                    ? "bg-destructive/20 text-destructive"
                    : storyBanner?.type === "success"
                    ? "bg-emerald-500/20 text-emerald-600"
                    : "bg-primary/20 text-primary"
                )}
              >
                {storyBanner?.type === "error" || storyBanner?.type === "warning" ? (
                  <AlertTriangle className="size-5 animate-bounce" />
                ) : storyBanner?.type === "success" ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <Activity className="size-5 animate-pulse" />
                )}
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Live Demo: {activeScenario.title}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                    Step {currentStepIndex + 1} of {activeScenario.steps.length}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-foreground">
                  {storyBanner?.title || currentStep?.title || "Processing scenario..."}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {storyBanner?.explanation || currentStep?.description}
                </p>

                {/* Self-Healing Architecture Explanation */}
                {storyBanner?.resilienceDetail && (
                  <div className="mt-1.5 p-2 rounded-lg bg-background/80 border border-border/60 text-xs font-medium text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                    <span>{storyBanner.resilienceDetail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Step Progress & Controls */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              {isRunning ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={pause}
                  className="cursor-pointer gap-1.5 text-xs font-semibold"
                >
                  <Pause className="size-3.5" />
                  Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={resume}
                  className="cursor-pointer gap-1.5 bg-primary text-primary-foreground text-xs font-semibold"
                >
                  <Play className="size-3.5 fill-current" />
                  Resume
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={stepForward}
                title="Next Step"
                className="cursor-pointer size-8 p-0"
              >
                <FastForward className="size-4" />
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={stop}
                title="Stop Demo"
                className="cursor-pointer size-8 p-0"
              >
                <Square className="size-3.5 fill-current" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  stop();
                  setStoryBanner(null);
                }}
                className="cursor-pointer size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Mode 2: Inactive Friendly Ribbon Toolbar ─────────────────────── */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-card shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Interactive Demo Lab
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium text-primary">
                  1-Click Scenarios
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click a scenario below to watch cards transition and test resilience live:
              </p>
            </div>
          </div>

          {/* 3 Plain-English Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => runScenario("happy-path-sprint")}
              className="cursor-pointer gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <Play className="size-3.5 fill-current" />
              Watch a Sprint Happen
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => runScenario("fault-optimistic-rollback")}
              className="cursor-pointer gap-1.5 text-xs font-semibold border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <Flame className="size-3.5 text-destructive" />
              What if server crashes?
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => runScenario("fault-network-offline")}
              className="cursor-pointer gap-1.5 text-xs font-semibold border-border hover:bg-accent"
            >
              <WifiOff className="size-3.5 text-muted-foreground" />
              What if internet cuts out?
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

