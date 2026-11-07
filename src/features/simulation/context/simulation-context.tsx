"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  SimulationScenario,
  SimulationStep,
  SimulationStatus,
  SimulationLog,
  ChaosConfig,
  LogLevel,
} from "../types";
import { chaosController } from "../chaos-controller";
import { AVAILABLE_SCENARIOS } from "../scenarios";

interface SimulationContextType {
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario | null;
  status: SimulationStatus;
  currentStepIndex: number;
  currentStep: SimulationStep | null;
  playbackSpeed: 1 | 2 | 5;
  chaosConfig: ChaosConfig;
  logs: SimulationLog[];
  isFloatingOpen: boolean;
  setIsFloatingOpen: (open: boolean) => void;
  runScenario: (scenarioId: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  stepForward: () => void;
  setPlaybackSpeed: (speed: 1 | 2 | 5) => void;
  updateChaosConfig: (partial: Partial<ChaosConfig>) => void;
  resetChaos: () => void;
  clearLogs: () => void;
  triggerChaosPreset: (
    preset: "500_rollback" | "401_refresh" | "429_rate_limit" | "offline" | "slow_3g"
  ) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const params = useParams();

  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;

  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState<1 | 2 | 5>(1);
  const [chaosConfig, setChaosConfig] = useState<ChaosConfig>(chaosController.getConfig());
  const [logs, setLogs] = useState<SimulationLog[]>(chaosController.getLogs());
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  // Execution flow control refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const stepAdvanceTriggerRef = useRef<(() => void) | null>(null);
  const speedRef = useRef<1 | 2 | 5>(1);

  // Sync state with ChaosController
  useEffect(() => {
    const unsubConfig = chaosController.subscribeConfig((newConfig) => {
      setChaosConfig(newConfig);
    });

    const unsubLogs = chaosController.subscribeLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 199)]);
    });

    return () => {
      unsubConfig();
      unsubLogs();
    };
  }, []);

  const setPlaybackSpeed = useCallback((speed: 1 | 2 | 5) => {
    speedRef.current = speed;
    setPlaybackSpeedState(speed);
  }, []);

  const updateChaosConfig = useCallback((partial: Partial<ChaosConfig>) => {
    chaosController.updateConfig(partial);
  }, []);

  const resetChaos = useCallback(() => {
    chaosController.resetConfig();
  }, []);

  const clearLogs = useCallback(() => {
    chaosController.clearLogs();
    setLogs([]);
  }, []);

  const addLog = useCallback(
    (level: LogLevel, title: string, description?: string, meta?: Record<string, unknown>) => {
      return chaosController.log(level, title, description, meta);
    },
    []
  );

  const cancellableSleep = useCallback(
    (ms: number, signal?: AbortSignal): Promise<void> => {
      const adjustedMs = ms / speedRef.current;
      return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
          return reject(new Error("Simulation aborted"));
        }

        let timeoutId: NodeJS.Timeout | null = null;

        const onAbort = () => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(new Error("Simulation aborted"));
        };

        signal?.addEventListener("abort", onAbort, { once: true });

        // Setup manual step advance trigger
        stepAdvanceTriggerRef.current = () => {
          if (timeoutId) clearTimeout(timeoutId);
          signal?.removeEventListener("abort", onAbort);
          resolve();
        };

        timeoutId = setTimeout(() => {
          signal?.removeEventListener("abort", onAbort);
          stepAdvanceTriggerRef.current = null;
          resolve();
        }, adjustedMs);
      });
    },
    []
  );

  const pause = useCallback(() => {
    if (status === "running") {
      isPausedRef.current = true;
      setStatus("paused");
      addLog("info", "Simulation Paused", "Execution state frozen. Press resume or step forward to continue.");
    }
  }, [status, addLog]);

  const resume = useCallback(() => {
    if (status === "paused") {
      isPausedRef.current = false;
      setStatus("running");
      addLog("info", "Simulation Resumed", "Continuing playbook execution.");
      if (stepAdvanceTriggerRef.current) {
        stepAdvanceTriggerRef.current();
      }
    }
  }, [status, addLog]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isPausedRef.current = false;
    stepAdvanceTriggerRef.current = null;
    setStatus("idle");
    setCurrentStepIndex(0);
    resetChaos();
    addLog("info", "Simulation Stopped", "Scenario terminated and engine reset to idle.");
  }, [resetChaos, addLog]);

  const stepForward = useCallback(() => {
    if (stepAdvanceTriggerRef.current) {
      stepAdvanceTriggerRef.current();
    }
  }, []);

  const runScenario = useCallback(
    async (scenarioId: string) => {
      const targetScenario = AVAILABLE_SCENARIOS.find((s) => s.id === scenarioId);
      if (!targetScenario) {
        toast.error(`Scenario '${scenarioId}' not found.`);
        return;
      }

      // Abort any existing execution
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isPausedRef.current = false;

      setActiveScenario(targetScenario);
      setStatus("running");
      setCurrentStepIndex(0);

      addLog(
        "info",
        `Scenario Started: ${targetScenario.title}`,
        targetScenario.description,
        { scenarioId, stepsCount: targetScenario.steps.length }
      );

      try {
        for (let i = 0; i < targetScenario.steps.length; i++) {
          if (controller.signal.aborted) break;

          while (isPausedRef.current) {
            if (controller.signal.aborted) break;
            await new Promise((r) => setTimeout(r, 200));
          }

          setCurrentStepIndex(i);
          const step = targetScenario.steps[i];

          addLog(
            "action",
            `Executing Step ${i + 1}/${targetScenario.steps.length}: ${step.title}`,
            step.description,
            { stepId: step.id, expectedOutcome: step.expectedOutcome }
          );

          // Execute step
          await step.execute({
            queryClient,
            workspaceSlug,
            projectSlug,
            log: addLog,
            sleep: (ms) => cancellableSleep(ms, controller.signal),
            setChaos: updateChaosConfig,
            resetChaos,
          });

          // Wait step transition delay
          if (step.delayMs && !controller.signal.aborted) {
            await cancellableSleep(step.delayMs, controller.signal);
          }
        }

        if (!controller.signal.aborted) {
          setStatus("completed");
          addLog(
            "info",
            `Scenario Completed: ${targetScenario.title}`,
            "All scenario steps executed successfully."
          );
          toast.success(`Simulation completed: ${targetScenario.title}`);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          // Normal abort, no error toast
          return;
        }
        setStatus("failed");
        const errorMessage = err instanceof Error ? err.message : "Unexpected exception during simulation execution";
        addLog(
          "error",
          `Scenario Failed: ${targetScenario.title}`,
          errorMessage,
          { error: String(err) }
        );
        toast.error(`Simulation failed: ${errorMessage}`);
      } finally {
        resetChaos();
      }
    },
    [queryClient, workspaceSlug, projectSlug, addLog, cancellableSleep, updateChaosConfig, resetChaos]
  );

  const triggerChaosPreset = useCallback(
    (preset: "500_rollback" | "401_refresh" | "429_rate_limit" | "offline" | "slow_3g") => {
      switch (preset) {
        case "500_rollback":
          chaosController.updateConfig({
            enabled: true,
            nextErrorStatus: 500,
            nextErrorMessage: "Database deadlock on task mutation (Simulated 500)",
          });
          toast.warning("Chaos Armed: Next mutation will trigger 500 Server Error to test rollback");
          break;
        case "401_refresh":
          chaosController.updateConfig({
            enabled: true,
            nextErrorStatus: 401,
            nextErrorMessage: "jwt expired: Access token expired (Simulated 401)",
          });
          toast.warning("Chaos Armed: Next request will trigger 401 to test silent refresh queue");
          break;
        case "429_rate_limit":
          chaosController.updateConfig({
            enabled: true,
            nextErrorStatus: 429,
            rateLimitRetryAfterSec: 3,
            nextErrorMessage: "Too Many Requests: Rate limit exceeded (Simulated 429)",
          });
          toast.warning("Chaos Armed: Next request will trigger 429 Rate Limiter backoff");
          break;
        case "offline":
          const currentOffline = chaosController.getConfig().forceOffline;
          chaosController.updateConfig({
            enabled: !currentOffline,
            forceOffline: !currentOffline,
          });
          toast.warning(
            !currentOffline
              ? "Chaos Active: Simulating Complete Network Dropout"
              : "Chaos Cleared: Network connectivity restored"
          );
          break;
        case "slow_3g":
          const currentLatency = chaosController.getConfig().latencyMs;
          const newLatency = currentLatency > 0 ? 0 : 2500;
          chaosController.updateConfig({
            enabled: newLatency > 0,
            latencyMs: newLatency,
          });
          toast.warning(
            newLatency > 0
              ? "Chaos Active: Simulating Slow 3G Network (2500ms latency)"
              : "Chaos Cleared: Network latency returned to normal"
          );
          break;
      }
    },
    []
  );

  const currentStep =
    activeScenario && currentStepIndex < activeScenario.steps.length
      ? activeScenario.steps[currentStepIndex]
      : null;

  return (
    <SimulationContext.Provider
      value={{
        scenarios: AVAILABLE_SCENARIOS,
        activeScenario,
        status,
        currentStepIndex,
        currentStep,
        playbackSpeed,
        chaosConfig,
        logs,
        isFloatingOpen,
        setIsFloatingOpen,
        runScenario,
        pause,
        resume,
        stop,
        stepForward,
        setPlaybackSpeed,
        updateChaosConfig,
        resetChaos,
        clearLogs,
        triggerChaosPreset,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextType {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
