"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  Play,
  Pause,
  Square,
  FastForward,
  Flame,
  WifiOff,
  Wifi,
  RotateCcw,
  Activity,
  Terminal,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSimulation, type SimulationScenario, type LogLevel } from "@/features/simulation";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";

export default function SimulationStudioPage() {
  const {
    scenarios,
    activeScenario,
    status,
    currentStepIndex,
    playbackSpeed,
    chaosConfig,
    logs,
    runScenario,
    pause,
    resume,
    stop,
    stepForward,
    setPlaybackSpeed,
    triggerChaosPreset,
    updateChaosConfig,
    resetChaos,
    clearLogs,
  } = useSimulation();

  const { isOnline } = useNetworkStatus();
  const [logFilter, setLogFilter] = useState<LogLevel | "all">("all");
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(
    activeScenario || scenarios[0]
  );

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isChaosActive =
    chaosConfig.enabled ||
    chaosConfig.nextErrorStatus !== null ||
    chaosConfig.forceOffline ||
    chaosConfig.latencyMs > 0;

  const currentDisplayScenario = activeScenario || selectedScenario;

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    return log.level === logFilter;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <FlaskConical className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Simulation & Chaos Studio
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2">
                Enterprise Lab
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Execute automated workflows, test optimistic rollbacks, inject chaos faults, and inspect live telemetry.
            </p>
          </div>
        </div>

        {/* Global Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={isRunning ? "default" : isPaused ? "secondary" : "outline"}
            className={cn("px-2.5 py-1 text-xs gap-1.5 font-bold uppercase", isRunning && "animate-pulse")}
          >
            <Activity className="size-3.5" />
            Engine: {status}
          </Badge>

          <Badge
            variant={isChaosActive ? "destructive" : "outline"}
            className="px-2.5 py-1 text-xs gap-1.5 font-bold uppercase"
          >
            <Flame className="size-3.5" />
            {isChaosActive ? "Chaos Armed" : "Chaos Disarmed"}
          </Badge>

          <Badge
            variant={isOnline ? "secondary" : "destructive"}
            className="px-2.5 py-1 text-xs gap-1.5 font-bold uppercase"
          >
            {isOnline ? <Wifi className="size-3.5 text-emerald-500" /> : <WifiOff className="size-3.5" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Scenario Runner & Stepper (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Runner Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">
                      {currentDisplayScenario.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {currentDisplayScenario.badge}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {currentDisplayScenario.description}
                  </CardDescription>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs shrink-0 self-start sm:self-center">
                  <span className="text-[10px] text-muted-foreground mr-1.5 font-medium px-1">Speed:</span>
                  {([1, 2, 5] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer",
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
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-4">
              {/* Playback Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl border border-border/60">
                <div className="flex items-center gap-2">
                  {!isRunning && !isPaused && (
                    <Button
                      onClick={() => runScenario(currentDisplayScenario.id)}
                      className="cursor-pointer gap-2 font-semibold text-xs shadow-xs"
                    >
                      <Play className="size-3.5 fill-current" />
                      Run Scenario
                    </Button>
                  )}

                  {isRunning && (
                    <Button
                      variant="outline"
                      onClick={pause}
                      className="cursor-pointer gap-2 font-semibold text-xs"
                    >
                      <Pause className="size-3.5" />
                      Pause
                    </Button>
                  )}

                  {isPaused && (
                    <Button
                      onClick={resume}
                      className="cursor-pointer gap-2 font-semibold text-xs"
                    >
                      <Play className="size-3.5 fill-current" />
                      Resume
                    </Button>
                  )}

                  {(isRunning || isPaused) && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={stepForward}
                        title="Step Forward"
                        className="cursor-pointer size-8"
                      >
                        <FastForward className="size-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={stop}
                        title="Stop Scenario"
                        className="cursor-pointer size-8"
                      >
                        <Square className="size-3.5 fill-current" />
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground font-mono">
                  {isRunning || isPaused ? (
                    <span className="text-primary font-semibold">
                      Step {currentStepIndex + 1} of {currentDisplayScenario.steps.length}
                    </span>
                  ) : (
                    <span>Est. Duration: {currentDisplayScenario.estimatedDuration}</span>
                  )}
                </div>
              </div>

              {/* Step Progression Stepper */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Scenario Execution Pipeline
                </span>

                <div className="flex flex-col gap-2">
                  {currentDisplayScenario.steps.map((step, idx) => {
                    const isStepRunning = (isRunning || isPaused) && currentStepIndex === idx;
                    const isStepCompleted = (isRunning || isPaused) && currentStepIndex > idx;
                    const isFinished = status === "completed";

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border text-xs transition-all",
                          isStepRunning
                            ? "border-primary bg-primary/5 shadow-xs"
                            : isStepCompleted || isFinished
                            ? "border-border/60 bg-card text-foreground"
                            : "border-border/40 bg-muted/10 opacity-70 text-muted-foreground"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isStepCompleted || isFinished ? (
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          ) : isStepRunning ? (
                            <Activity className="size-4 text-primary animate-pulse" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground/50" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-foreground text-xs">{step.title}</p>
                            {step.delayMs && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ~{step.delayMs}ms
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {step.description}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-primary/80 font-mono">
                            <span className="font-semibold uppercase tracking-wider">Expected:</span>
                            <span>{step.expectedOutcome}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Catalog */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold">Scenario Playbook Catalog</CardTitle>
              <CardDescription className="text-xs">
                Select a playbook to load it into the execution pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scenarios.map((sc) => {
                  const isSelected = currentDisplayScenario.id === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => {
                        if (!isRunning && !isPaused) {
                          setSelectedScenario(sc);
                        }
                      }}
                      className={cn(
                        "flex flex-col justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/70 hover:border-border hover:bg-card/60"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <Badge
                            variant={sc.category === "happy_path" ? "secondary" : "outline"}
                            className="text-[10px] px-1.5 py-0 font-semibold"
                          >
                            {sc.badge}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {sc.estimatedDuration}
                          </span>
                        </div>
                        <h4 className="font-bold text-foreground text-xs">{sc.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {sc.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {sc.steps.length} steps
                        </span>
                        <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                          {isSelected ? "Active" : "Select"}
                          <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chaos Deck & Observability Telemetry (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Chaos Fault Injector Deck */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-500">
                    <Flame className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Chaos & Fault Injector</CardTitle>
                    <CardDescription className="text-xs">
                      Inject production anomalies into live network requests.
                    </CardDescription>
                  </div>
                </div>

                {isChaosActive && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={resetChaos}
                    className="cursor-pointer text-destructive text-[11px] gap-1 hover:bg-destructive/10"
                  >
                    <RotateCcw className="size-3" />
                    Reset Chaos
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-4 text-xs">
              {/* Presets */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Single-Click Chaos Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={chaosConfig.nextErrorStatus === 500 ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => triggerChaosPreset("500_rollback")}
                    className="cursor-pointer justify-start text-[11px] h-8 font-medium"
                  >
                    <Flame className="size-3.5 mr-1 text-destructive shrink-0" />
                    500 Server Error
                  </Button>

                  <Button
                    variant={chaosConfig.nextErrorStatus === 401 ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => triggerChaosPreset("401_refresh")}
                    className="cursor-pointer justify-start text-[11px] h-8 font-medium"
                  >
                    <ShieldCheck className="size-3.5 mr-1 text-blue-500 shrink-0" />
                    401 JWT Expiry
                  </Button>

                  <Button
                    variant={chaosConfig.nextErrorStatus === 429 ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => triggerChaosPreset("429_rate_limit")}
                    className="cursor-pointer justify-start text-[11px] h-8 font-medium"
                  >
                    <Clock className="size-3.5 mr-1 text-amber-500 shrink-0" />
                    429 Rate Limit
                  </Button>

                  <Button
                    variant={chaosConfig.forceOffline ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => triggerChaosPreset("offline")}
                    className="cursor-pointer justify-start text-[11px] h-8 font-medium"
                  >
                    <WifiOff className="size-3.5 mr-1 text-red-500 shrink-0" />
                    {chaosConfig.forceOffline ? "Restore Online" : "Simulate Offline"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Latency Throttle Control */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Simulated Network Latency
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {chaosConfig.latencyMs}ms
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {([0, 500, 1500, 2500] as const).map((lat) => (
                    <Button
                      key={lat}
                      variant={chaosConfig.latencyMs === lat ? "default" : "outline"}
                      size="xs"
                      onClick={() =>
                        updateChaosConfig({
                          enabled: lat > 0 || chaosConfig.enabled,
                          latencyMs: lat,
                        })
                      }
                      className="cursor-pointer text-[10px] font-mono"
                    >
                      {lat === 0 ? "Normal" : `${lat}ms`}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-Time Observability & Telemetry Console */}
          <Card className="border-border/80 shadow-xs flex-1 flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="size-4 text-primary" />
                  <CardTitle className="text-base font-bold">
                    Telemetry Stream ({logs.length})
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={clearLogs}
                  className="cursor-pointer text-muted-foreground text-[11px] gap-1 hover:text-foreground"
                >
                  <Trash2 className="size-3" />
                  Clear
                </Button>
              </div>

              {/* Log Level Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 pt-2">
                {(["all", "action", "fault", "recovery", "network", "info"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setLogFilter(filter)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer",
                      logFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="pt-3 flex-1 flex flex-col">
              <div className="rounded-xl border border-border/70 bg-card p-3 font-mono text-[11px] max-h-[380px] overflow-y-auto flex flex-col gap-2">
                {filteredLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 italic">
                    No telemetry events matching filter. Run a scenario to stream traces.
                  </p>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-0.5 border-b border-border/30 pb-1.5 last:border-b-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            log.level === "fault" || log.level === "error"
                              ? "destructive"
                              : log.level === "recovery"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[9px] px-1 py-0 h-4 font-bold uppercase"
                        >
                          {log.level}
                        </Badge>
                        <span className="font-semibold text-foreground truncate">{log.title}</span>
                        <span className="ml-auto text-[9px] text-muted-foreground font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-[10px] text-muted-foreground pl-1 break-all">
                          {log.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
