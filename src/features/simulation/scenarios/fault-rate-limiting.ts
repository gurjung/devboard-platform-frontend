import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

export const faultRateLimitingScenario: SimulationScenario = {
  id: "fault-rate-limiting",
  title: "429 Rate Limiting & Exponential Backoff (Chaos)",
  description:
    "Simulates an aggressive user triggering rapid mutations, causing API gateway rate-limiting (429). Demonstrates automatic backoff and client retry.",
  category: "fault_resilience",
  estimatedDuration: "~8s",
  badge: "Rate Limiting",
  steps: [
    {
      id: "step-1-arm-rate-limit",
      title: "1. Arm Chaos Engine with 429 Rate Limit",
      description: "Instructs chaos interceptor to respond with 429 Too Many Requests and Retry-After: 3s.",
      expectedOutcome: "Simulation engine armed for rate limit injection.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "info",
          "Arming 429 Rate Limit",
          "Triggering rate limiter quota threshold (100 req/min exceeded)."
        );
        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 429,
          rateLimitRetryAfterSec: 2,
          nextErrorMessage: "Too Many Requests: Rate limit of 60 req/min exceeded. Retry-After: 2s (Simulated)",
        });
        toast.warning("Simulation: Injected 429 Rate Limiter Spike");
      },
    },
    {
      id: "step-2-trigger-rate-limit",
      title: "2. Burst Request Encountering 429",
      description: "Dispatches burst request against the API and captures the 429 response.",
      expectedOutcome: "429 caught with Retry-After header respected.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        try {
          await apiClient.post("/simulation/burst-test", { ping: true });
        } catch (err: unknown) {
          if (err instanceof ApiError && err.status === 429) {
            ctx.log(
              "fault",
              "HTTP 429 Rate Limit Intercepted",
              err.message,
              { retryAfterSec: 2 }
            );
            toast.error("429 Too Many Requests: Backing off for 2 seconds...");
          }
        }
      },
    },
    {
      id: "step-3-backoff-and-retry",
      title: "3. Exponential Backoff & Retry Execution",
      description: "Pauses requests during cooldown window, then automatically replays.",
      expectedOutcome: "Subsequent request succeeds after backoff period.",
      delayMs: 3000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log("action", "Initiating Backoff Delay", "Sleeping for 2000ms cooldown...");
        await ctx.sleep(2000);

        ctx.resetChaos();
        ctx.log(
          "recovery",
          "Backoff Window Expired: Retrying Request",
          "Dispatching replayed request. Gateway cleared."
        );
        toast.success("Rate Limit Cleared: Retried operation completed successfully!");
      },
    },
  ],
};
