import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { setDemoMode } from "../mock-demo-data";
import { setAccessToken, apiClient, ApiError } from "@/lib/api-client";

export const authInstantDemoScenario: SimulationScenario = {
  id: "auth-instant-demo",
  title: "Instant Demo Sandbox Access",
  description:
    "Bypasses login, seeds an in-memory engineering workspace with active projects and Kanban boards, and navigates straight to the live dashboard.",
  category: "happy_path",
  estimatedDuration: "~3s",
  badge: "Instant Access",
  steps: [
    {
      id: "step-1-init-persona",
      title: "1. Mount Demo Engineering Persona",
      description: "Prepares credentials for Alex Rivera (Staff Architect) and seeds memory.",
      expectedOutcome: "Demo identity configured with zero remote database dependencies.",
      delayMs: 800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Initializing Demo Persona",
          "Configuring user: Alex Rivera (alex.rivera@devboard.io)"
        );
        setDemoMode(true);
        setAccessToken("demo-mock-jwt-token");
        toast.info("Simulation: Demo persona mounted. Initializing workspace...");
      },
    },
    {
      id: "step-2-seed-workspace",
      title: "2. Seed Workspace & Active Kanban Projects",
      description: "Generates 'DevBoard Core Engineering' with Platform Core & Mobile projects.",
      expectedOutcome: "Workspace cache and 7 multi-stage tasks ready for interaction.",
      delayMs: 1200,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Workspace & Project Cache Ingestion",
          "Pre-loading 7 tasks across Backlog, Todo, In Progress, In Review, and Done."
        );
        await ctx.queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Simulation: Workspace and Kanban board seeded!");
      },
    },
    {
      id: "step-3-navigate-dashboard",
      title: "3. Navigate to Live Workspace Dashboard",
      description: "Redirects the browser into the dynamic dashboard shell.",
      expectedOutcome: "Full interactive workspace rendered on screen.",
      delayMs: 600,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "recovery",
          "Navigating to Kanban Board",
          "Transferring viewport to /dashboard/devboard-engineering/projects/platform-core?view=kanban"
        );
        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
        }
      },
    },
  ],
};

export const authFault500CrashScenario: SimulationScenario = {
  id: "auth-fault-500",
  title: "Auth Flow: 500 Server Crash on Submission",
  description:
    "Simulates an unexpected database error while submitting login credentials. Shows how form state is safely preserved without wiping inputs.",
  category: "fault_resilience",
  estimatedDuration: "~5s",
  badge: "Auth Chaos",
  steps: [
    {
      id: "step-1-arm-500",
      title: "1. Arm 500 Error on Auth Endpoint",
      description: "Arms chaos interceptor to return 500 Internal Server Error on next /auth/login request.",
      expectedOutcome: "Simulation engine armed for auth rejection.",
      delayMs: 1200,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 500,
          nextErrorMessage: "Database connection refused: Auth cluster unavailable (Simulated 500)",
        });
        ctx.log("fault", "500 Error Armed for Login", "Next authentication attempt will fail.");
        toast.warning("Simulation: 500 Server Crash armed for login form.");
      },
    },
    {
      id: "step-2-trigger-login",
      title: "2. Dispatch Simulated Login Request",
      description: "Submits test credentials and captures the 500 error response.",
      expectedOutcome: "500 error caught with Sonner alert and zero form resets.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        try {
          await apiClient.post("/auth/login", {
            email: "test.engineer@devboard.io",
            password: "Password123!",
          });
        } catch (err: unknown) {
          if (err instanceof ApiError && err.status === 500) {
            ctx.log("fault", "HTTP 500 Caught by Auth Guard", err.message, { status: 500 });
            toast.error(`Login Failed: ${err.message}. Inputs preserved.`);
          }
        }
      },
    },
    {
      id: "step-3-reset",
      title: "3. Disarm Chaos & Restore Form State",
      description: "Resets the chaos interceptor so subsequent real logins work normally.",
      expectedOutcome: "Form returns to ready state.",
      delayMs: 1000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.resetChaos();
        ctx.log("recovery", "Auth Chaos Disarmed", "Normal login operation restored.");
        toast.success("Resilience Test Passed: Error handled without crash.");
      },
    },
  ],
};

export const authFault429RateLimitScenario: SimulationScenario = {
  id: "auth-fault-429",
  title: "Auth Flow: 429 Brute-Force Rate Limiting",
  description:
    "Simulates an aggressive brute-force attempt triggering API Gateway rate limiting (429) on the login screen.",
  category: "fault_resilience",
  estimatedDuration: "~6s",
  badge: "Rate Limiting",
  steps: [
    {
      id: "step-1-arm-429",
      title: "1. Arm 429 Rate Limiter on /auth/login",
      description: "Forces a 429 Too Many Requests response with 3s backoff.",
      expectedOutcome: "Gateway rate limit rule armed.",
      delayMs: 1200,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 429,
          rateLimitRetryAfterSec: 3,
          nextErrorMessage: "Too Many Requests: Brute-force threshold exceeded (Simulated 429)",
        });
        ctx.log("fault", "Rate Limiter Armed", "Simulating 5 consecutive failed attempts.");
        toast.warning("Simulation: 429 Rate Limiter armed on auth endpoint.");
      },
    },
    {
      id: "step-2-trigger-rate-limit",
      title: "2. Trigger Login Burst & Capture 429",
      description: "Submits request and captures rate limit exception.",
      expectedOutcome: "429 caught with Retry-After backoff notification.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        try {
          await apiClient.post("/auth/login", {
            email: "attacker@malicious.com",
            password: "wrong-password",
          });
        } catch (err: unknown) {
          if (err instanceof ApiError && err.status === 429) {
            ctx.log("fault", "HTTP 429 Rate Limit Intercepted", err.message, { retryAfterSec: 3 });
            toast.error("429 Too Many Requests: Account locked for 3 seconds.");
          }
        }
      },
    },
    {
      id: "step-3-reset",
      title: "3. Expire Backoff & Clear Lockout",
      description: "Simulates cooldown window expiring.",
      expectedOutcome: "Rate limit lifted.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.resetChaos();
        ctx.log("recovery", "Rate Limit Window Expired", "Authentication endpoint unlocked.");
        toast.success("Rate Limit Lifted: Login endpoint accessible again.");
      },
    },
  ],
};
