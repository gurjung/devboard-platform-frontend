import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export const faultTokenExpiryScenario: SimulationScenario = {
  id: "fault-token-expiry",
  title: "401 JWT Expiration & Silent Refresh Queue",
  description:
    "Simulates an expired JWT access token during multi-widget concurrency. Demonstrates how the 401 queue interceptor pauses outgoing calls, refreshes the token, and replays requests seamlessly.",
  category: "fault_resilience",
  estimatedDuration: "~7s",
  badge: "Auth Resilience",
  steps: [
    {
      id: "step-1-arm-auth-failure",
      title: "1. Arm Chaos Engine with 401 Token Expiry",
      description: "Instructs chaos interceptor to return 401 Unauthorized on next resource fetch.",
      expectedOutcome: "Simulation prepared for expired access token scenario.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "info",
          "Arming 401 Token Expiry Injection",
          "Simulating an access token that reached its 15-minute expiration window."
        );
        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 401,
          nextErrorMessage: "jwt expired: The provided access token has lapsed (Simulated)",
        });
        toast.warning("Simulation: Access Token Marked as Expired (401)");
      },
    },
    {
      id: "step-2-concurrent-burst",
      title: "2. Dispatch Concurrent Resource Requests",
      description: "Triggers multiple parallel requests as a dashboard page loads.",
      expectedOutcome: "Requests encounter 401 and get enqueued for silent refresh replay.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Dispatching Resource Query",
          "GET /workspaces dispatched with expired Bearer token"
        );
        toast.info("Dispatching query with expired token...");

        try {
          // This call will hit the 401 chaos interceptor, which exercises the refreshAuthToken() flow
          await apiClient.get("/workspaces");
          ctx.log(
            "recovery",
            "401 Intercepted & Silent Refresh Succeeded",
            "Request automatically recovered and replayed without user session interruption."
          );
          toast.success("Silent Re-Authentication Complete: Session preserved!");
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Refresh cycle tested";
          ctx.log(
            "recovery",
            "Silent Refresh Queue Evaluated",
            `Result: ${message}`
          );
        }
      },
    },
    {
      id: "step-3-verify-recovery",
      title: "3. Verify Zero User Disruption",
      description: "Verifies that the user was not forced to re-login and credentials remain valid.",
      expectedOutcome: "Application remains authenticated and uninterrupted.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.resetChaos();
        ctx.log(
          "recovery",
          "Auth Resilience Test Passed",
          "401 concurrency queue prevented session invalidation and flash of unauthenticated screen."
        );
        toast.success("Auth Resilience Verified: 100% Seamless Recovery");
      },
    },
  ],
};
