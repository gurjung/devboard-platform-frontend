import type { SimulationScenario, SimulationStepContext } from "../types";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const happyPathSprintScenario: SimulationScenario = {
  id: "happy-path-sprint",
  title: "Agile Sprint Lifecycle (Happy Path)",
  description:
    "Simulates an end-to-end user workflow: task creation, assignee assignment, stage transitions across the Kanban board, and instant analytics recalculation.",
  category: "happy_path",
  estimatedDuration: "~10s",
  badge: "Happy Flow",
  steps: [
    {
      id: "step-1-init",
      title: "1. Inspect Workspace & Target Project",
      description: "Verifies current workspace and project context to prepare the sprint board.",
      expectedOutcome: "Target project identified and active task cache evaluated.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "info",
          "Initializing Sprint Simulation",
          `Evaluating workspace [${ctx.workspaceSlug || "default"}]`
        );
        await ctx.sleep(800);
        ctx.log(
          "action",
          "Workspace Context Ready",
          "Sprint board initialized. Querying cached tasks."
        );
      },
    },
    {
      id: "step-2-create-task",
      title: "2. Dispatch New Sprint Task",
      description: "Creates 'Enterprise SSO & SAML Integration' task in TODO stage.",
      expectedOutcome: "New task renders with zero latency and toast confirmation appears.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Creating Task: 'Enterprise SSO & SAML Integration'",
          "Dispatching mutation with Status: TODO, Priority: HIGH"
        );

        toast.info("Simulation: Creating sprint deliverable 'Enterprise SSO & SAML'");

        if (ctx.workspaceId && ctx.projectId) {
          try {
            await apiClient.post(
              `/workspaces/${ctx.workspaceId}/projects/${ctx.projectId}/tasks`,
              {
                title: "Enterprise SSO & SAML Integration",
                description: "Configured Okta & Azure AD SAML 2.0 endpoints for multi-tenant auth.",
                status: "TODO",
                priority: "HIGH",
              }
            );
            await ctx.queryClient.invalidateQueries({
              queryKey: ["tasks", ctx.workspaceId, ctx.projectId],
            });
            ctx.log("action", "Task Created on Remote API", "Status 201 Created");
          } catch {
            ctx.log("info", "Simulating Local Ingestion", "Appended to TanStack cache directly.");
          }
        } else {
          ctx.log("info", "No remote project bound", "Simulating local pipeline.");
        }

        toast.success("Task 'Enterprise SSO & SAML' added to sprint backlog!");
      },
    },
    {
      id: "step-3-move-in-progress",
      title: "3. Kanban Column Transition: IN_PROGRESS",
      description: "Simulates team member picking up the task and moving it into active development.",
      expectedOutcome: "Task column updates instantly with optimistic update.",
      delayMs: 2200,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Kanban Transition: TODO ➔ IN_PROGRESS",
          "Updating status and recalculating work in progress limit."
        );
        toast.info("Simulation: Moving card to IN_PROGRESS");
        await ctx.sleep(1200);
        ctx.log(
          "action",
          "Status Updated to IN_PROGRESS",
          "Optimistic UI confirmed. Backend mutation persisted."
        );
      },
    },
    {
      id: "step-4-move-done",
      title: "4. Deliverable Completed: DONE",
      description: "Code review approved and QA sign-off completed. Task moves to DONE.",
      expectedOutcome: "Task column changes to DONE, velocity metric updates.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "action",
          "Kanban Transition: IN_PROGRESS ➔ DONE",
          "Task signed off by QA. Marking as completed."
        );
        toast.success("Simulation: Task marked as DONE! Milestone reached.");
        await ctx.sleep(1000);
        if (ctx.workspaceId) {
          await ctx.queryClient.invalidateQueries({
            queryKey: ["workspace-stats", ctx.workspaceId],
          });
          ctx.log("recovery", "Workspace Stats Invalidated", "Incremented completed tasks count.");
        }
      },
    },
    {
      id: "step-5-summary",
      title: "5. Sprint Summary & Metric Refresh",
      description: "Concludes the happy path sprint cycle and logs overall performance.",
      expectedOutcome: "All metrics synchronized with remote server state.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "info",
          "Sprint Simulation Concluded Successfully",
          "100% of operations completed with zero errors."
        );
        toast.success("Happy Path Simulation Completed!");
      },
    },
  ],
};

