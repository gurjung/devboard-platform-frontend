"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  Square,
  FastForward,
  Rewind,
  Flame,
  WifiOff,
  RotateCcw,
  Activity,
  ChevronDown,
  ChevronUp,
  Terminal,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from "../context/simulation-context";
import { cn } from "@/lib/utils";

export function SimulationFloatingDock() {
  const {
    isDemo,
    scenarios,
    activeScenario,
    status,
    currentStepIndex,
    currentStep,
    storyBanner,
    playbackSpeed,
    chaosConfig,
    logs,
    isAuthenticated,
    launchInstantDemo,
    runScenario,
    pause,
    resume,
    stop,
    stepForward,
    stepBackward,
    jumpToStep,
    setPlaybackSpeed,
    triggerChaosPreset,
    resetChaos,
    clearLogs,
  } = useSimulation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");

  const chapters = React.useMemo(() => {
    if (!activeScenario) return [];
    const chs: { label: string; stepIndex: number }[] = [];
    activeScenario.steps.forEach((step, idx) => {
      if (step.chapter && (!chs.length || chs[chs.length - 1].label !== step.chapter)) {
        chs.push({ label: step.chapter, stepIndex: idx });
      }
    });
    return chs;
  }, [activeScenario]);

  const effectiveHighlights =
    storyBanner?.highlights ||
    currentStep?.highlights ||
    storyBanner?.talkingPoints ||
    currentStep?.talkingPoints;

  const effectiveScenarioId =
    scenarios.some((s) => s.id === selectedScenarioId)
      ? selectedScenarioId
      : scenarios[0]?.id || "";

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isChaosActive =
    chaosConfig.enabled ||
    chaosConfig.nextErrorStatus !== null ||
    chaosConfig.forceOffline ||
    chaosConfig.latencyMs > 0;

  if (!isDemo) {
    return null;
  }

  return (
    <aside
      aria-label="Simulation Studio Dock"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 max-w-[calc(100vw-2.5rem)] select-none font-sans"
    >
      {/* Expanded Control Studio */}
      {isExpanded && (
        <div className="w-[390px] sm:w-[440px] max-w-full rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-200 ease-out animate-in fade-in-50 slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  DevBoard Simulation Studio
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Interactive workflows & chaos fault injection
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          {/* Unauthenticated Demo Sandbox Hero Banner */}
          {!isAuthenticated && (
            <div className="my-2.5 p-3 rounded-xl border border-primary/30 bg-primary/5 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                <Sparkles className="size-4 animate-spin" />
                <span>Instant Demo Sandbox Access</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bypass login and jump straight into an active DevBoard engineering workspace with pre-populated Kanban boards and project metrics.
              </p>
              <Button
                size="sm"
                onClick={launchInstantDemo}
                className="w-full cursor-pointer gap-2 bg-primary text-primary-foreground font-bold text-xs shadow-xs"
              >
                <Sparkles className="size-3.5 fill-current" />
                Enter Demo Workspace Now
              </Button>
            </div>
          )}

          {/* Scenario Selector & Runner */}
          <div className="py-2.5 flex flex-col gap-2.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isAuthenticated ? "Select Workspace Playbook" : "Select Auth Screen Playbook"}
            </label>
            <div className="flex flex-col gap-2">
              <select
                value={effectiveScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                disabled={isRunning || isPaused}
                className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 font-medium text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.badge})
                  </option>
                ))}
              </select>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  {!isRunning && !isPaused && (
                    <Button
                      size="sm"
                      onClick={() => runScenario(effectiveScenarioId)}
                      className="cursor-pointer gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 shadow-sm"
                    >
                      <Play className="size-3.5 fill-current" />
                      Run Playbook
                    </Button>
                  )}

                  {isRunning && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pause}
                      className="cursor-pointer gap-1.5 text-xs font-semibold"
                    >
                      <Pause className="size-3.5" />
                      Pause
                    </Button>
                  )}

                  {isPaused && (
                    <Button
                      size="sm"
                      onClick={resume}
                      className="cursor-pointer gap-1.5 bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      <Play className="size-3.5 fill-current" />
                      Resume
                    </Button>
                  )}

                  {(isRunning || isPaused) && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={stepBackward}
                        disabled={currentStepIndex === 0}
                        title="Previous Step"
                        className="cursor-pointer size-8 p-0"
                      >
                        <Rewind className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={stepForward}
                        title="Skip to Next Step"
                        className="cursor-pointer size-8 p-0"
                      >
                        <FastForward className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stop}
                        title="Stop Scenario"
                        className="cursor-pointer size-8 p-0"
                      >
                        <Square className="size-3.5 fill-current" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Speed Multiplier */}
                <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs">
                  {([1, 2, 5] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                        playbackSpeed === spd
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Step Progress */}
            {activeScenario && (isRunning || isPaused) && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between font-semibold text-primary">
                  <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                    <Activity className="size-3.5 animate-pulse shrink-0" />
                    <span>
                      {storyBanner?.chapter || currentStep?.chapter ? `${storyBanner?.chapter || currentStep?.chapter} • ` : ""}Step {currentStepIndex + 1} of {activeScenario.steps.length}
                    </span>
                  </span>
                  <Badge variant={isPaused ? "secondary" : "default"} className="text-[10px] uppercase font-mono px-1.5 py-0">
                    {status}
                  </Badge>
                </div>

                <div>
                  <h5 className="font-bold text-foreground text-[12px] leading-snug">
                    {storyBanner?.title || currentStep?.title || "Processing..."}
                  </h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {storyBanner?.explanation || currentStep?.description}
                  </p>
                </div>

                {/* Feature Highlights */}
                {effectiveHighlights && effectiveHighlights.length > 0 && (
                  <div className="p-2 rounded-lg bg-background/80 border border-primary/20 text-[11px]">
                    <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
                      <Sparkles className="size-3 text-primary" />
                      <span>Feature Highlights:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-foreground/90 font-medium leading-relaxed">
                      {effectiveHighlights.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resilience Detail */}
                {storyBanner?.resilienceDetail && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40 text-[10px] text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="leading-snug">{storyBanner.resilienceDetail}</p>
                  </div>
                )}

                {/* Quick Chapter Jump */}
                {chapters.length > 1 && (
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/40">
                    <Layers className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-semibold text-muted-foreground shrink-0">Chapter:</span>
                    <select
                      aria-label="Jump to Chapter"
                      value={
                        chapters.slice().reverse().find((c) => currentStepIndex >= c.stepIndex)?.stepIndex ?? 0
                      }
                      onChange={(e) => jumpToStep(Number(e.target.value))}
                      className="text-[10px] font-semibold rounded-md border border-input bg-card px-2 py-0.5 text-foreground shadow-xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary flex-1 truncate"
                    >
                      {chapters.map((ch) => (
                        <option key={ch.stepIndex} value={ch.stepIndex}>
                          {ch.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Chaos Fault Injection Panel */}
          <div className="pt-2 pb-1 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="size-3.5 text-orange-500" />
                Chaos Fault Injections
              </span>
              {isChaosActive && (
                <button
                  type="button"
                  onClick={resetChaos}
                  className="text-[11px] text-destructive hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  Reset Chaos
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant={chaosConfig.nextErrorStatus === 500 ? "destructive" : "outline"}
                size="sm"
                onClick={() => triggerChaosPreset("500_rollback")}
                className="cursor-pointer text-[11px] h-8 justify-start px-2 font-medium"
              >
                <Flame className="size-3.5 mr-1 text-destructive shrink-0" />
                Arm 500 Rollback
              </Button>

              <Button
                variant={chaosConfig.nextErrorStatus === 401 ? "destructive" : "outline"}
                size="sm"
                onClick={() => triggerChaosPreset("401_refresh")}
                className="cursor-pointer text-[11px] h-8 justify-start px-2 font-medium"
              >
                <ShieldCheck className="size-3.5 mr-1 text-blue-500 shrink-0" />
                Arm 401 JWT Expiry
              </Button>

              <Button
                variant={chaosConfig.nextErrorStatus === 429 ? "destructive" : "outline"}
                size="sm"
                onClick={() => triggerChaosPreset("429_rate_limit")}
                className="cursor-pointer text-[11px] h-8 justify-start px-2 font-medium"
              >
                <Clock className="size-3.5 mr-1 text-amber-500 shrink-0" />
                Arm 429 Rate Limit
              </Button>

              <Button
                variant={chaosConfig.forceOffline ? "destructive" : "outline"}
                size="sm"
                onClick={() => triggerChaosPreset("offline")}
                className="cursor-pointer text-[11px] h-8 justify-start px-2 font-medium"
              >
                <WifiOff className="size-3.5 mr-1 text-red-500 shrink-0" />
                {chaosConfig.forceOffline ? "Restore Network" : "Cut Offline"}
              </Button>
            </div>
          </div>

          {/* Telemetry Log Viewer Toggle */}
          <div className="pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="size-3.5 text-primary" />
                Simulation Telemetry Logs ({logs.length})
              </span>
              <span className="text-[11px] text-primary hover:underline">
                {showLogs ? "Hide Console" : "View Console"}
              </span>
            </button>

            {showLogs && (
              <div className="mt-2 rounded-xl bg-card border border-border/80 p-2 text-[11px] max-h-48 overflow-y-auto font-mono flex flex-col gap-1.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-1 mb-1">
                  <span className="text-muted-foreground text-[10px]">Real-Time Event Stream</span>
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
                {logs.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-4">No events logged yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-1.5 border-b border-border/30 pb-1">
                      <Badge
                        variant={
                          log.level === "fault" || log.level === "error"
                            ? "destructive"
                            : log.level === "recovery"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[9px] px-1 py-0 h-4 uppercase shrink-0 font-bold"
                      >
                        {log.level}
                      </Badge>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-foreground truncate">{log.title}</p>
                        {log.description && (
                          <p className="text-[10px] text-muted-foreground break-all">{log.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2.5 rounded-full px-4 py-2.5 shadow-xl transition-all duration-200 cursor-pointer border backdrop-blur-md",
          isRunning
            ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
            : isPaused
            ? "bg-amber-600 text-white border-amber-500 shadow-amber-500/20"
            : isChaosActive
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-background/95 text-foreground border-border hover:border-primary/50 hover:bg-card"
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full",
            isRunning
              ? "bg-primary-foreground animate-ping"
              : isPaused
              ? "bg-white"
              : isChaosActive
              ? "bg-yellow-300 animate-pulse"
              : "bg-emerald-500"
          )}
        />
        <span className="text-xs font-bold tracking-tight">
          {isRunning
            ? `Tour: Step ${currentStepIndex + 1}/${activeScenario?.steps.length || 0}`
            : isPaused
            ? `Tour Paused (${currentStepIndex + 1}/${activeScenario?.steps.length || 0})`
            : isChaosActive
            ? "Chaos Mode Armed"
            : "Simulation Studio"}
        </span>
        {isExpanded ? (
          <ChevronDown className="size-3.5 opacity-70" />
        ) : (
          <ChevronUp className="size-3.5 opacity-70" />
        )}
      </button>
    </aside>
  );
}

