import type { QueryClient } from "@tanstack/react-query";

export type SimulationStatus = "idle" | "running" | "paused" | "completed" | "failed";

export type SimulationCategory = "happy_path" | "fault_resilience" | "performance";

export type LogLevel = "info" | "action" | "fault" | "recovery" | "error" | "network";

export interface SimulationLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  title: string;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface ChaosConfig {
  enabled: boolean;
  latencyMs: number;
  forceOffline: boolean;
  nextErrorStatus: number | null; // e.g. 500, 429, 401, 403
  nextErrorMessage?: string | null;
  errorRate: number; // 0 to 1 (0 = never, 1 = 100% of matching requests)
  targetEndpoints?: string[]; // e.g. ["/tasks"] or empty for all
  rateLimitRetryAfterSec?: number;
}

export interface SimulationStepContext {
  queryClient: QueryClient;
  workspaceId?: string;
  workspaceSlug?: string;
  projectId?: string;
  projectSlug?: string;
  log: (
    level: LogLevel,
    title: string,
    description?: string,
    meta?: Record<string, unknown>
  ) => void;
  sleep: (ms: number) => Promise<void>;
  setChaos: (config: Partial<ChaosConfig>) => void;
  resetChaos: () => void;
}

export interface SimulationStep {
  id: string;
  title: string;
  description: string;
  expectedOutcome: string;
  delayMs?: number;
  execute: (context: SimulationStepContext) => Promise<void>;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  category: SimulationCategory;
  estimatedDuration: string;
  badge: string;
  steps: SimulationStep[];
}
