import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";
import { updateDemoTask } from "../mock-demo-data";

export const faultOptimisticRollbackScenario: SimulationScenario = {
  id: "fault-optimistic-rollback",
  title: "What If Server Crashes? (Auto-Rollback)",
  description:
    "Simulates an unexpected server error when moving a card. Shows how DevBoard instantly rolls the card back to its safe position to prevent data loss.",
  category: "fault_resilience",
  estimatedDuration: "~10s",
  badge: "Self-Healing Rollback",
  steps: [
    {
      id: "step-1-prepare",
      title: "1. Arm Server Fault Simulator",
      description: "Prepares a simulated server failure on the next task update.",
      expectedOutcome: "Simulation engine armed and board positioned on screen.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "1. Arming Server Crash Simulator",
          explanation: "We're setting up a simulated server crash (HTTP 500) to test how DevBoard handles unexpected backend downtime.",
          type: "warning",
          resilienceDetail: "Resilience Testing: Verifies that a broken database never leaves phantom data on your screen.",
        });

        ctx.log(
          "info",
          "Arming Chaos Engine",
          "Navigating to Kanban Board and arming Status 500 on next PATCH"
        );
        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
        }
        await ctx.sleep(1200);

        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 500,
          nextErrorMessage: "Database connection lost during update (Simulated Server Crash)",
        });
        toast.warning("Server crash simulation armed!");
      },
    },
    {
      id: "step-2-optimistic-dispatch",
      title: "2. Move Card to DONE (Optimistic Update)",
      description: "You drag 'Migrate to Tailwind CSS v4' from In Progress into Done.",
      expectedOutcome: "Card visually appears in DONE immediately without waiting for server response.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "2. Moving Card to DONE (Optimistic Update)",
          explanation: "The user drops the card into DONE. The card moves instantly without waiting for network confirmation.",
          type: "info",
          resilienceDetail: "Optimistic UI: Gives you a super-fast experience by updating immediately before the server responds.",
        });

        ctx.log(
          "action",
          "Optimistic Mutation Dispatched",
          "Card immediately visually updated to DONE in client cache."
        );
        toast.info("Task dragged to 'DONE' (Saving in background...)");

        // Visually move task-demo-3 to DONE
        updateDemoTask("task-demo-3", { status: "DONE" });
        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-demo-3", "Optimistically Moved to Done ➔");

        await ctx.sleep(2200);
      },
    },
    {
      id: "step-3-catch-and-rollback",
      title: "3. Server Fails! Card Snaps Back Safely",
      description: "The server rejects the save. DevBoard catches the crash and snaps the card back to In Progress.",
      expectedOutcome: "Card snaps back to 'IN_PROGRESS' and displays a clear explanation toast.",
      delayMs: 3000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "3. Server Crashed! Auto-Rolling Back Card",
          explanation: "The server failed with a 500 error! DevBoard's self-healing engine catches the error and snaps the card back to In Progress.",
          type: "error",
          resilienceDetail: "Self-Healing Architecture: Automatic rollback prevents ghost cards and corrupt state when servers crash.",
        });

        try {
          // Trigger test mutation to hit chaos interceptor
          await apiClient.patch("/simulation/tasks/test-task-123", {
            status: "DONE",
          });
        } catch (err: unknown) {
          if (
            err instanceof ApiError ||
            (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 500)
          ) {
            const apiErr = err as ApiError;
            ctx.log(
              "fault",
              "500 Internal Server Error Intercepted",
              apiErr.message || "Database transaction deadlock",
              { status: apiErr.status }
            );

            // Roll back task-demo-3 back to IN_PROGRESS
            updateDemoTask("task-demo-3", { status: "IN_PROGRESS" });
            await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
            ctx.setSpotlight("task-demo-3", "Snapped back to In Progress (Safe) ↺");

            ctx.log(
              "recovery",
              "Optimistic Cache Rollback Executed",
              "Card reverted from 'DONE' back to 'IN_PROGRESS'. State consistency preserved."
            );

            toast.error(
              "Server Error: Update failed! Card safely rolled back to In Progress."
            );
            await ctx.sleep(2500);
          } else {
            throw err;
          }
        }
      },
    },
    {
      id: "step-4-verify-healthy",
      title: "4. System Healed & Safe",
      description: "Chaos simulator disarmed. Zero data was lost or corrupted.",
      expectedOutcome: "System returns to 100% normal operation.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.resetChaos();
        ctx.setSpotlight(null);

        ctx.setStoryBanner({
          title: "Self-Healing Rollback Complete",
          explanation: "The system protected your project from corrupted data. The board remains fully interactive and safe.",
          type: "success",
          resilienceDetail: "Zero Data Corruption: DevBoard keeps your frontend and backend states strictly aligned.",
        });

        ctx.log(
          "recovery",
          "Chaos Interceptor Disarmed",
          "Application operating in normal production mode."
        );
        toast.success("Self-healing complete: No work or data was lost!");
        await ctx.sleep(1500);
      },
    },
  ],
};
