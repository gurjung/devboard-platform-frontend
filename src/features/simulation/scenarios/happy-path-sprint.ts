import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { addDemoTask, updateDemoTask } from "../mock-demo-data";
import type { InfiniteData } from "@tanstack/react-query";
import type { TasksResponse, Task } from "@/features/tasks/types";

export const happyPathSprintScenario: SimulationScenario = {
  id: "happy-path-sprint",
  title: "Watch a Sprint Happen (Happy Path)",
  description:
    "Follows a real task from creation to completion: creates a task in TODO, moves it to In Progress as work starts, and completes it in Done.",
  category: "happy_path",
  estimatedDuration: "~10s",
  badge: "Sprint Lifecycle",
  steps: [
    {
      id: "step-1-init",
      title: "1. Open Sprint Board",
      description: "Opens the project Kanban board to prepare for the sprint simulation.",
      expectedOutcome: "Kanban board is loaded with active columns.",
      delayMs: 1500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "info",
          "Initializing Sprint Simulation",
          "Navigating to Kanban Board (/dashboard/devboard-engineering/projects/platform-core?view=kanban)"
        );

        ctx.setStoryBanner({
          title: "1. Preparing Sprint Board",
          explanation: "Navigating to the project Kanban board to demonstrate how deliverables move across stages.",
          type: "info",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
        }
        await ctx.sleep(1200);

        ctx.log(
          "action",
          "Sprint Board Ready",
          "Board initialized. Ready for sprint deliverable ingestion."
        );
      },
    },
    {
      id: "step-2-create-task",
      title: "2. New Task Added to TODO",
      description: "A new feature deliverable is assigned and placed into the TODO column.",
      expectedOutcome: "The new task card renders with a glowing highlight in the TODO column.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "2. New Task Added to Sprint (TODO)",
          explanation: "The team logs a high-priority feature: 'Enterprise SSO & SAML Integration'. Watch it appear in the TODO column below.",
          type: "info",
          resilienceDetail: "Zero-Latency: React Query updates local state immediately while persisting in the background.",
        });

        ctx.log(
          "action",
          "Creating Task: 'Enterprise SSO & SAML Integration'",
          "Dispatching deliverable with Status: TODO, Priority: HIGH"
        );

        toast.info("Task created: 'Enterprise SSO & SAML Integration'");

        const newTask = addDemoTask({
          id: "task-sprint-sim",
          title: "Enterprise SSO & SAML Integration",
          description: "Configured Okta & Azure AD SAML 2.0 endpoints for multi-tenant federation.",
          status: "TODO",
          priority: "HIGH",
        });

        // Visually insert into all active TanStack Query task caches
        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page, idx) =>
                idx === 0
                  ? {
                      ...page,
                      tasks: [newTask, ...page.tasks.filter((t) => t.id !== newTask.id)],
                      totalCount: (page.totalCount || 0) + 1,
                    }
                  : page
              ),
            };
          }
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-sprint-sim", "New Task Added to TODO");
        await ctx.sleep(2000);
      },
    },
    {
      id: "step-3-move-in-progress",
      title: "3. Developer Starts Work (In Progress)",
      description: "An engineer picks up the task and moves it to the In Progress column.",
      expectedOutcome: "Card visibly transitions from TODO to the IN_PROGRESS column.",
      delayMs: 2800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "3. Work in Progress (Moved to IN PROGRESS)",
          explanation: "A developer picks up the task. The card physically moves from TODO to In Progress with an active spotlight.",
          type: "info",
          resilienceDetail: "Fluid Transitions: CSS transformations animate the card seamlessly between columns.",
        });

        ctx.log(
          "action",
          "Kanban Transition: TODO ➔ IN_PROGRESS",
          "Staff engineer picked up deliverable. Card transitioning."
        );

        updateDemoTask("task-sprint-sim", { status: "IN_PROGRESS" });

        // Visually update the status in all active task caches
        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                tasks: page.tasks.map((t) =>
                  t.id === "task-sprint-sim" ? { ...t, status: "IN_PROGRESS" as const } : t
                ),
              })),
            };
          }
        );

        ctx.queryClient.setQueriesData<Task>(
          { queryKey: ["task"] },
          (old) => (old && old.id === "task-sprint-sim" ? { ...old, status: "IN_PROGRESS" } : old)
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-sprint-sim", "Moved to In Progress ➔");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-4-move-done",
      title: "4. Code Review Passed (Moved to Done)",
      description: "The feature is reviewed, tested, and shipped to the DONE column.",
      expectedOutcome: "Card visibly moves to the DONE column and project metrics refresh.",
      delayMs: 2800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "4. Feature Shipped (Moved to DONE)",
          explanation: "Testing and code review passed! The card moves to Done with completed strikethrough styling.",
          type: "success",
          resilienceDetail: "Real-time Metrics: Project completion counters and charts automatically update.",
        });

        ctx.log(
          "action",
          "Kanban Transition: IN_PROGRESS ➔ DONE",
          "All acceptance criteria verified. Moving to completed."
        );

        updateDemoTask("task-sprint-sim", { status: "DONE" });

        // Visually update to DONE in active task caches
        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                tasks: page.tasks.map((t) =>
                  t.id === "task-sprint-sim" ? { ...t, status: "DONE" as const } : t
                ),
              })),
            };
          }
        );

        ctx.queryClient.setQueriesData<Task>(
          { queryKey: ["task"] },
          (old) => (old && old.id === "task-sprint-sim" ? { ...old, status: "DONE" } : old)
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        await ctx.queryClient.invalidateQueries({ queryKey: ["workspace-stats"] });
        ctx.setSpotlight("task-sprint-sim", "Completed & Moved to Done! ✓");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-5-summary",
      title: "5. Sprint Simulation Complete",
      description: "Sprint cycle finished with all deliverables synced across the interface.",
      expectedOutcome: "All board states and metrics are completely synchronized.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "Sprint Lifecycle Finished Successfully",
          explanation: "You just watched an entire sprint workflow: Backlog creation ➔ Active Work ➔ Verification ➔ Shipped to Done.",
          type: "success",
          resilienceDetail: "State Consistency: The local UI and remote server are in 100% synchronization.",
        });

        ctx.setSpotlight(null);
        ctx.log(
          "info",
          "Sprint Simulation Concluded Successfully",
          "100% of operations completed with live UI state synchronization."
        );
        toast.success("Sprint simulation complete!");
        await ctx.sleep(1500);
      },
    },
  ],
};
