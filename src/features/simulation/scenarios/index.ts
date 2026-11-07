import type { SimulationScenario } from "../types";
import { happyPathSprintScenario } from "./happy-path-sprint";
import { faultOptimisticRollbackScenario } from "./fault-optimistic-rollback";
import { faultTokenExpiryScenario } from "./fault-token-expiry";
import { faultRateLimitingScenario } from "./fault-rate-limiting";
import { faultNetworkOfflineScenario } from "./fault-network-offline";
import {
  authInstantDemoScenario,
  authFault500CrashScenario,
  authFault429RateLimitScenario,
} from "./auth-scenarios";

export const AUTH_SCENARIOS: SimulationScenario[] = [
  authInstantDemoScenario,
  authFault500CrashScenario,
  authFault429RateLimitScenario,
];

export const DASHBOARD_SCENARIOS: SimulationScenario[] = [
  happyPathSprintScenario,
  faultOptimisticRollbackScenario,
  faultTokenExpiryScenario,
  faultRateLimitingScenario,
  faultNetworkOfflineScenario,
];

export const AVAILABLE_SCENARIOS: SimulationScenario[] = [
  ...AUTH_SCENARIOS,
  ...DASHBOARD_SCENARIOS,
];

export {
  authInstantDemoScenario,
  authFault500CrashScenario,
  authFault429RateLimitScenario,
  happyPathSprintScenario,
  faultOptimisticRollbackScenario,
  faultTokenExpiryScenario,
  faultRateLimitingScenario,
  faultNetworkOfflineScenario,
};
