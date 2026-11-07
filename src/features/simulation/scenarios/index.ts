import type { SimulationScenario } from "../types";
import { happyPathSprintScenario } from "./happy-path-sprint";
import { faultOptimisticRollbackScenario } from "./fault-optimistic-rollback";
import { faultTokenExpiryScenario } from "./fault-token-expiry";
import { faultRateLimitingScenario } from "./fault-rate-limiting";
import { faultNetworkOfflineScenario } from "./fault-network-offline";

export const AVAILABLE_SCENARIOS: SimulationScenario[] = [
  happyPathSprintScenario,
  faultOptimisticRollbackScenario,
  faultTokenExpiryScenario,
  faultRateLimitingScenario,
  faultNetworkOfflineScenario,
];

export {
  happyPathSprintScenario,
  faultOptimisticRollbackScenario,
  faultTokenExpiryScenario,
  faultRateLimitingScenario,
  faultNetworkOfflineScenario,
};

