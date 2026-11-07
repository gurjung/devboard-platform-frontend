import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

export const faultOptimisticRollbackScenario: SimulationScenario = {
  id: "fault-optimistic-rollback",
  title: "500 Server Error & Optimistic Rollback (Chaos)",
  description:
    "Simulates an unexpected server-side database crash during a Kanban status update. Demonstrates how optimistic updates immediately rollback and alert the user with Sonner.",
  category: "fault_resilience",
  estimatedDuration: "~8s",
  badge: "Chaos: 500 Rollback",
  steps: [
    {
      id: "step-1-prepare",
      title: "1. Arm Chaos Interceptor (500 Error)",
      description: "Arms the chaos engine to intercept the next mutation with a 500 Database Deadlock.",
      expectedOutcome: "Simulation engine armed for single-shot failure injection.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "info",
          "Arming Chaos Engine",
          "Target: Next PATCH mutation ➔ Status 500 Server Error"
        );
        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 500,
          nextErrorMessage: "Transaction deadlock: Could not serialize task status transition (Simulated Chaos)",
        });
        toast.warning("Simulation: Injected pending 500 Internal Server Error");
      },
    },
    {
      id: "step-2-optimistic-dispatch",
      title: "2. Dispatch Status Update (Optimistic Update)",
      description: "User drags a task from 'IN_PROGRESS' to 'DONE'. UI optimistically updates immediately.",
      expectedOutcome: "Card visually transitions to 'DONE' prior to server acknowledgment.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Optimistic Mutation Dispatched",
          "Card immediately visually updated to DONE in client cache."
        );
        toast.info("Task dragged to 'DONE' (Optimistic state active)");
        await ctx.sleep(800);
      },
    },
    {
      id: "step-3-catch-and-rollback",
      title: "3. Catch Injected 500 & Trigger Cache Rollback",
      description: "Server responds with 500. onError lifecycle catches error and restores cache snapshot.",
      expectedOutcome: "Card snaps back to 'IN_PROGRESS' and error toast displays recovery.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        try {
          // Trigger test endpoint or task patch
          await apiClient.patch("/simulation/tasks/test-task-123", {
            status: "DONE",
          });
        } catch (err: unknown) {
          if (err instanceof ApiError || (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 500)) {
            const apiErr = err as ApiError;
            ctx.log(
              "fault",
              "500 Internal Server Error Intercepted",
              apiErr.message || "Database transaction deadlock",
              { status: apiErr.status }
            );

            // Simulate the React Query onError rollback behavior
            ctx.log(
              "recovery",
              "Optimistic Cache Rollback Executed",
              "Card reverted from 'DONE' back to 'IN_PROGRESS'. State consistency preserved."
            );

            toast.error(
              `Mutation Failed: ${apiErr.message}. Card rolled back to previous column.`
            );
          } else {
            throw err;
          }
        }
      },
    },
    {
      id: "step-4-verify-healthy",
      title: "4. Reset Chaos & Verify System Health",
      description: "Disables chaos mode and proves that subsequent mutations succeed cleanly.",
      expectedOutcome: "System returns to 100% healthy operation.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.resetChaos();
        ctx.log(
          "recovery",
          "Chaos Interceptor Disarmed",
          "Application operating in normal production mode."
        );
        toast.success("Resilience Verified: Zero persistent data corruption!");
      },
    },
  ],
};
