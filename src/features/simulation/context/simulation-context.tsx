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
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  SimulationScenario,
  SimulationStep,
  SimulationStatus,
  SimulationLog,
  ChaosConfig,
  LogLevel,
  StoryBanner,
} from "../types";
import { chaosController } from "../chaos-controller";
import {
  AVAILABLE_SCENARIOS,
  AUTH_SCENARIOS,
  DASHBOARD_SCENARIOS,
} from "../scenarios";
import { isDemoMode, setDemoMode, subscribeDemoMode } from "../mock-demo-data";

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
  isAuthenticated: boolean;
  isDemo: boolean;
  highlightedTaskId: string | null;
  highlightedElementId: string | null;
  spotlightMessage: string | null;
  storyBanner: StoryBanner | null;
  setSpotlight: (taskId: string | null, message?: string | null) => void;
  setStoryBanner: (banner: StoryBanner | null) => void;
  setIsFloatingOpen: (open: boolean) => void;
  runScenario: (scenarioId: string) => Promise<void>;
  launchInstantDemo: () => Promise<void>;
  exitDemo: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStep: (stepIndex: number) => void;
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
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loginAsDemoUser, logout } = useAuth();
  const isDemo = React.useSyncExternalStore(
    subscribeDemoMode,
    isDemoMode,
    () => false
  );

  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;

  const scenarios = isAuthenticated ? DASHBOARD_SCENARIOS : AUTH_SCENARIOS;

  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState<1 | 2 | 5>(1);
  const [chaosConfig, setChaosConfig] = useState<ChaosConfig>(chaosController.getConfig());
  const [logs, setLogs] = useState<SimulationLog[]>(chaosController.getLogs());
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [spotlightMessage, setSpotlightMessage] = useState<string | null>(null);
  const [storyBanner, setStoryBanner] = useState<StoryBanner | null>(null);

  const setSpotlight = useCallback((taskId: string | null, message?: string | null) => {
    setHighlightedTaskId(taskId);
    setSpotlightMessage(message || null);
  }, []);

  // Execution flow control refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const stepAdvanceTriggerRef = useRef<(() => void) | null>(null);
  const speedRef = useRef<1 | 2 | 5>(1);
  const jumpTargetRef = useRef<number | null>(null);
  const prevIsDemoRef = useRef(isDemo);

  useEffect(() => {
    const prevIsDemo = prevIsDemoRef.current;
    if (prevIsDemo === isDemo) return;
    prevIsDemoRef.current = isDemo;

    if (isDemo) {
      chaosController.resetConfig();
      queryClient.clear();
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isPausedRef.current = false;
      stepAdvanceTriggerRef.current = null;
      chaosController.resetConfig();
      queryClient.clear();
    }
  }, [isDemo, queryClient]);

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
    setHighlightedTaskId(null);
    setSpotlightMessage(null);
    setStoryBanner(null);
    addLog("info", "Simulation Stopped", "Scenario terminated and engine reset to idle.");
  }, [resetChaos, addLog]);

  const jumpToStep = useCallback(
    (targetIndex: number) => {
      if (!activeScenario) return;
      const clamped = Math.max(0, Math.min(targetIndex, activeScenario.steps.length - 1));
      jumpTargetRef.current = clamped;
      if (isPausedRef.current) {
        isPausedRef.current = false;
        setStatus("running");
      }
      if (stepAdvanceTriggerRef.current) {
        stepAdvanceTriggerRef.current();
      }
    },
    [activeScenario]
  );

  const stepBackward = useCallback(() => {
    jumpToStep(currentStepIndex - 1);
  }, [currentStepIndex, jumpToStep]);

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
      jumpTargetRef.current = null;

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
        let i = 0;
        while (i < targetScenario.steps.length) {
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
            navigate: (url: string) => router.push(url),
            setSpotlight,
            setStoryBanner,
            log: addLog,
            sleep: (ms) => cancellableSleep(ms, controller.signal),
            setChaos: updateChaosConfig,
            resetChaos,
          });

          // Wait step transition delay
          if (step.delayMs && !controller.signal.aborted) {
            await cancellableSleep(step.delayMs, controller.signal);
          }

          if (jumpTargetRef.current !== null) {
            i = jumpTargetRef.current;
            jumpTargetRef.current = null;
          } else {
            i++;
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
        setSpotlight(null);
      }
    },
    [queryClient, router, workspaceSlug, projectSlug, addLog, cancellableSleep, updateChaosConfig, resetChaos, setSpotlight]
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

  const launchInstantDemo = useCallback(async () => {
    try {
      chaosController.resetConfig();
      setHighlightedTaskId(null);
      setSpotlightMessage(null);
      setStoryBanner(null);
      addLog("action", "Instant Demo Triggered", "Initializing sandbox session for Alex Rivera");
      prevIsDemoRef.current = true;
      await loginAsDemoUser();
      queryClient.clear();
      toast.success("Demo Mode Active: Welcome to DevBoard Engineering Workspace!");
      router.push("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
    } catch {
      toast.error("Failed to start demo session.");
    }
  }, [loginAsDemoUser, addLog, queryClient, router]);

  const exitDemo = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isPausedRef.current = false;
      stepAdvanceTriggerRef.current = null;
      setStatus("idle");
      setCurrentStepIndex(0);
      setActiveScenario(null);
      setIsFloatingOpen(false);
      chaosController.resetConfig();
      setHighlightedTaskId(null);
      setSpotlightMessage(null);
      setStoryBanner(null);
      prevIsDemoRef.current = false;
      await logout();
      queryClient.clear();
      toast.info("Exited demo sandbox.");
      router.replace("/sign-in");
    } catch {
      setDemoMode(false);
      router.replace("/sign-in");
    }
  }, [logout, queryClient, router]);

  const currentStep =
    activeScenario && currentStepIndex < activeScenario.steps.length
      ? activeScenario.steps[currentStepIndex]
      : null;

  return (
    <SimulationContext.Provider
      value={{
        scenarios,
        activeScenario,
        status,
        currentStepIndex,
        currentStep,
        playbackSpeed,
        chaosConfig,
        logs,
        isFloatingOpen,
        isAuthenticated,
        isDemo,
        highlightedTaskId,
        highlightedElementId: highlightedTaskId,
        spotlightMessage,
        storyBanner,
        setSpotlight,
        setStoryBanner,
        setIsFloatingOpen,
        runScenario,
        launchInstantDemo,
        exitDemo,
        pause,
        resume,
        stop,
        stepForward,
        stepBackward,
        jumpToStep,
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
