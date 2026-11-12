"use client";

import React, { useId, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const scenarioSelectId = useId();

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

  const isRunning = status === "running";
  const isPaused = status === "paused";

  const effectiveScenarioId =
    (isRunning || isPaused) && activeScenario
      ? activeScenario.id
      : scenarios.some((s) => s.id === selectedScenarioId)
        ? selectedScenarioId
        : scenarios[0]?.id || "";

  const selectedScenario = scenarios.find((s) => s.id === effectiveScenarioId);

  const activeChapter = React.useMemo(
    () =>
      chapters
        .slice()
        .reverse()
        .find((c) => currentStepIndex >= c.stepIndex) ?? chapters[0],
    [chapters, currentStepIndex]
  );

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
      className="fixed bottom-5 right-5 z-[45] flex flex-col items-end gap-2 max-w-[calc(100vw-2.5rem)] select-none font-sans"
    >
      {/* Expanded Control Studio */}
      {isExpanded && (
        <div className="w-[390px] sm:w-[440px] max-w-full rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl transition-all duration-150 ease-out animate-in fade-in-50 slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-brand-text border border-primary/20">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xs font-semibold tracking-tight text-foreground">
                  DevBoard Simulation Studio
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Interactive workflows &amp; chaos fault injection
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsExpanded(false)}
              aria-label="Collapse Simulation Studio"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          {/* Unauthenticated Demo Sandbox Hero Banner */}
          {!isAuthenticated && (
            <div className="my-3 p-3 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-brand-text font-semibold text-xs">
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span>Instant Demo Sandbox Access</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bypass login and jump straight into an active DevBoard engineering workspace with pre-populated Kanban boards and project metrics.
              </p>
              <Button
                size="sm"
                onClick={launchInstantDemo}
                className="w-full h-8 rounded-lg cursor-pointer gap-1.5 text-xs font-medium shadow-xs"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span>Enter Demo Workspace Now</span>
              </Button>
            </div>
          )}

          {/* Scenario Selector & Runner */}
          <div className="py-3 flex flex-col gap-2.5">
            <label
              htmlFor={scenarioSelectId}
              className="text-[11px] font-medium text-muted-foreground"
            >
              {isAuthenticated ? "Select Workspace Playbook" : "Select Auth Screen Playbook"}
            </label>
            <div className="flex flex-col gap-2">
              <Select
                value={effectiveScenarioId}
                onValueChange={(val) => {
                  if (val) setSelectedScenarioId(val);
                }}
                disabled={isRunning || isPaused}
              >
                <SelectTrigger
                  id={scenarioSelectId}
                  className="w-full h-8 bg-card border-input text-xs font-medium rounded-lg cursor-pointer"
                >
                  <SelectValue placeholder="Select a playbook">
                    {selectedScenario ? (
                      <span className="flex items-center justify-between gap-2 w-full min-w-0">
                        <span className="truncate font-medium text-foreground">
                          {selectedScenario.title}
                        </span>
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                          {selectedScenario.badge}
                        </span>
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center justify-between gap-2 w-full">
                        <span className="truncate">{s.title}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {s.badge}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  {!isRunning && !isPaused && (
                    <Button
                      size="sm"
                      onClick={() => runScenario(effectiveScenarioId)}
                      className="h-8 rounded-lg cursor-pointer gap-1.5 text-xs font-medium px-3 shadow-xs"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Run Playbook</span>
                    </Button>
                  )}

                  {isRunning && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pause}
                      className="h-8 rounded-lg cursor-pointer gap-1.5 text-xs font-medium"
                    >
                      <Pause className="size-3.5" />
                      <span>Pause</span>
                    </Button>
                  )}

                  {isPaused && (
                    <Button
                      size="sm"
                      onClick={resume}
                      className="h-8 rounded-lg cursor-pointer gap-1.5 text-xs font-medium"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Resume</span>
                    </Button>
                  )}

                  {(isRunning || isPaused) && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={stepBackward}
                        disabled={currentStepIndex === 0}
                        aria-label="Previous Step"
                        className="cursor-pointer size-8 p-0 rounded-lg"
                      >
                        <Rewind className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={stepForward}
                        aria-label="Skip to Next Step"
                        className="cursor-pointer size-8 p-0 rounded-lg"
                      >
                        <FastForward className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stop}
                        aria-label="Stop Scenario"
                        className="cursor-pointer size-8 p-0 rounded-lg"
                      >
                        <Square className="size-3.5 fill-current" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Speed Multiplier */}
                <div
                  role="group"
                  aria-label="Playback speed"
                  className="flex items-center rounded-lg border border-input bg-muted/40 p-0.5 text-xs"
                >
                  {([1, 2, 5] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      aria-pressed={playbackSpeed === spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={cn(
                        "min-h-6 min-w-7 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer tabular-nums",
                        playbackSpeed === spd
                          ? "bg-card text-foreground shadow-2xs border border-border/60"
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
              <div className="rounded-xl border border-border/70 bg-muted/25 p-3 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between font-medium text-brand-text">
                  <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                    <Activity className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="tabular-nums">
                      {storyBanner?.chapter || currentStep?.chapter
                        ? `${storyBanner?.chapter || currentStep?.chapter} · `
                        : ""}
                      Step {currentStepIndex + 1} of {activeScenario.steps.length}
                    </span>
                  </span>
                  <Badge
                    variant={isPaused ? "secondary" : "default"}
                    className="text-[10px] uppercase font-mono px-1.5 py-0"
                  >
                    {status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-xs leading-snug">
                    {storyBanner?.title || currentStep?.title || "Processing..."}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {storyBanner?.explanation || currentStep?.description}
                  </p>
                </div>

                {/* Feature Highlights */}
                {effectiveHighlights && effectiveHighlights.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-card border border-border/60 text-[11px]">
                    <div className="font-medium text-brand-text mb-1 flex items-center gap-1.5">
                      <Sparkles className="size-3 text-brand-text" aria-hidden="true" />
                      <span>Feature highlights</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-foreground/90 leading-relaxed">
                      {effectiveHighlights.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resilience Detail */}
                {storyBanner?.resilienceDetail && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-card/70 border border-border/50 text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-brand-text shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="leading-snug">{storyBanner.resilienceDetail}</p>
                  </div>
                )}

                {/* Quick Chapter Jump */}
                {chapters.length > 1 && (
                  <div className="flex items-center gap-2 pt-1.5 border-t border-border/50">
                    <Layers className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                      Chapter:
                    </span>
                    <Select
                      value={String(activeChapter?.stepIndex ?? 0)}
                      onValueChange={(val) => {
                        if (val !== null && val !== undefined) {
                          jumpToStep(Number(val));
                        }
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label="Jump to Chapter"
                        className="flex-1 h-7 bg-card border-input text-[11px] font-medium rounded-md cursor-pointer"
                      >
                        <SelectValue placeholder="Select chapter">
                          <span className="truncate">
                            {activeChapter?.label ?? "Chapter"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((ch) => (
                          <SelectItem key={ch.stepIndex} value={String(ch.stepIndex)}>
                            {ch.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Chaos Fault Injection Panel */}
          <div className="pt-2.5 pb-1 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Flame className="size-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                <span>Chaos Fault Injections</span>
              </span>
              {isChaosActive && (
                <button
                  type="button"
                  onClick={resetChaos}
                  className="text-[11px] min-h-6 px-1 text-destructive-text hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset Chaos</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant={chaosConfig.nextErrorStatus === 500 ? "destructive" : "outline"}
                size="sm"
                aria-pressed={chaosConfig.nextErrorStatus === 500}
                onClick={() => triggerChaosPreset("500_rollback")}
                className="cursor-pointer text-[11px] h-8 rounded-lg justify-start px-2.5 font-medium"
              >
                <Flame
                  className={cn(
                    "size-3.5 mr-1.5 shrink-0",
                    chaosConfig.nextErrorStatus === 500 ? "text-current" : "text-destructive-text"
                  )}
                />
                <span>Arm 500 Rollback</span>
              </Button>

              <Button
                variant={chaosConfig.nextErrorStatus === 401 ? "destructive" : "outline"}
                size="sm"
                aria-pressed={chaosConfig.nextErrorStatus === 401}
                onClick={() => triggerChaosPreset("401_refresh")}
                className="cursor-pointer text-[11px] h-8 rounded-lg justify-start px-2.5 font-medium"
              >
                <ShieldCheck
                  className={cn(
                    "size-3.5 mr-1.5 shrink-0",
                    chaosConfig.nextErrorStatus === 401 ? "text-current" : "text-blue-600 dark:text-blue-400"
                  )}
                />
                <span>Arm 401 JWT Expiry</span>
              </Button>

              <Button
                variant={chaosConfig.nextErrorStatus === 429 ? "destructive" : "outline"}
                size="sm"
                aria-pressed={chaosConfig.nextErrorStatus === 429}
                onClick={() => triggerChaosPreset("429_rate_limit")}
                className="cursor-pointer text-[11px] h-8 rounded-lg justify-start px-2.5 font-medium"
              >
                <Clock
                  className={cn(
                    "size-3.5 mr-1.5 shrink-0",
                    chaosConfig.nextErrorStatus === 429 ? "text-current" : "text-amber-700 dark:text-amber-400"
                  )}
                />
                <span>Arm 429 Rate Limit</span>
              </Button>

              <Button
                variant={chaosConfig.forceOffline ? "destructive" : "outline"}
                size="sm"
                aria-pressed={chaosConfig.forceOffline}
                onClick={() => triggerChaosPreset("offline")}
                className="cursor-pointer text-[11px] h-8 rounded-lg justify-start px-2.5 font-medium"
              >
                <WifiOff
                  className={cn(
                    "size-3.5 mr-1.5 shrink-0",
                    chaosConfig.forceOffline ? "text-current" : "text-red-600 dark:text-red-400"
                  )}
                />
                <span>{chaosConfig.forceOffline ? "Restore Network" : "Cut Offline"}</span>
              </Button>
            </div>
          </div>

          {/* Telemetry Log Viewer Toggle */}
          <div className="pt-3 mt-2 border-t border-border/60">
            <button
              type="button"
              aria-expanded={showLogs}
              onClick={() => setShowLogs(!showLogs)}
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="size-3.5 text-brand-text" aria-hidden="true" />
                <span>Simulation Telemetry Logs ({logs.length})</span>
              </span>
              <span className="text-[11px] text-brand-text hover:underline">
                {showLogs ? "Hide Console" : "View Console"}
              </span>
            </button>

            {showLogs && (
              <div className="mt-2 rounded-xl bg-card border border-border/70 p-2.5 text-[11px] max-h-48 overflow-y-auto font-mono flex flex-col gap-1.5">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5 mb-0.5">
                  <span className="text-muted-foreground text-[10px]">Real-Time Event Stream</span>
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                {logs.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-4">No events logged yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0">
                      <Badge
                        variant={
                          log.level === "fault" || log.level === "error"
                            ? "destructive"
                            : log.level === "recovery"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[9px] px-1.5 py-0 h-4 uppercase shrink-0 font-semibold"
                      >
                        {log.level}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{log.title}</p>
                        {log.description && (
                          <p className="text-[10px] text-muted-foreground break-words">{log.description}</p>
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
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 rounded-full px-3.5 h-9 shadow-lg transition-colors duration-150 cursor-pointer border",
          isRunning
            ? "bg-primary text-primary-foreground border-primary"
            : isPaused
            ? "bg-amber-600 text-white border-amber-500"
            : isChaosActive
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-popover text-popover-foreground border-border hover:border-primary/40 hover:bg-card"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full shrink-0",
            isRunning
              ? "bg-primary-foreground"
              : isPaused
              ? "bg-white"
              : isChaosActive
              ? "bg-amber-300"
              : "bg-emerald-500"
          )}
        />
        <span className="text-xs font-medium tracking-tight tabular-nums">
          {isRunning
            ? `Tour: Step ${currentStepIndex + 1}/${activeScenario?.steps.length || 0}`
            : isPaused
            ? `Tour Paused (${currentStepIndex + 1}/${activeScenario?.steps.length || 0})`
            : isChaosActive
            ? "Chaos Mode Armed"
            : "Simulation Studio"}
        </span>
        {isExpanded ? (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </aside>
  );
}
