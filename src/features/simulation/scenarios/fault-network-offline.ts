import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

export const faultNetworkOfflineScenario: SimulationScenario = {
  id: "fault-network-offline",
  title: "Complete Network Dropout & Auto-Reconnection",
  description:
    "Simulates an abrupt network disconnect. Demonstrates how TanStack Query halts background calls, displays the top NetworkStatusBanner, and resyncs automatically on reconnection.",
  category: "fault_resilience",
  estimatedDuration: "~8s",
  badge: "Offline Handling",
  steps: [
    {
      id: "step-1-drop-network",
      title: "1. Simulate Complete Network Dropout",
      description: "Cuts network connectivity and switches TanStack Query into offline pause mode.",
      expectedOutcome: "Top NetworkStatusBanner appears in destructive red.",
      delayMs: 2000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.log(
          "fault",
          "Network Disconnect Injected",
          "Simulating loss of client connectivity (navigator.onLine = false)"
        );
        ctx.setChaos({
          enabled: true,
          forceOffline: true,
        });
        toast.warning("Simulation: Network disconnected! Check the top status banner.");
      },
    },
    {
      id: "step-2-attempt-offline-mutation",
      title: "2. Attempt Mutation While Disconnected",
      description: "User attempts to fetch or update while connection is severed.",
      expectedOutcome: "Request fails cleanly with ApiError(0) without crashing the runtime.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        try {
          await apiClient.get("/workspaces");
        } catch (err: unknown) {
          if (err instanceof ApiError && err.status === 0) {
            ctx.log(
              "fault",
              "Offline Fetch Intercepted",
              err.message,
              { status: 0 }
            );
            toast.error("Offline Error: Network unavailable. Action queued.");
          }
        }
      },
    },
    {
      id: "step-3-restore-connectivity",
      title: "3. Restore Network Connectivity",
      description: "Re-establishes network connection and triggers cache revalidation.",
      expectedOutcome: "Banner turns green ('Back Online') and stale queries refetch.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setChaos({
          forceOffline: false,
        });
        ctx.log(
          "recovery",
          "Connection Restored",
          "OnlineManager resumed. Background refetches dispatched."
        );
        toast.success("Simulation: Network connection restored!");
        await ctx.sleep(1500);
        ctx.resetChaos();
      },
    },
  ],
};

