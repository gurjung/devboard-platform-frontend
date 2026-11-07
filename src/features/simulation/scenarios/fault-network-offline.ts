import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";

export const faultNetworkOfflineScenario: SimulationScenario = {
  id: "fault-network-offline",
  title: "What If Internet Cuts Out? (Offline Handling)",
  description:
    "Simulates an abrupt network disconnection. Demonstrates how DevBoard pauses network calls, shows a clear offline alert, and auto-syncs upon reconnection.",
  category: "fault_resilience",
  estimatedDuration: "~8s",
  badge: "Offline Handling",
  steps: [
    {
      id: "step-1-drop-network",
      title: "1. Disconnect Network Connection",
      description: "Cuts network connectivity and switches into offline pause mode.",
      expectedOutcome: "Top NetworkStatusBanner appears in destructive red.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "1. Internet Disconnected (Offline Mode)",
          explanation: "Simulating a lost Wi-Fi connection. Notice the red alert banner that appeared at the very top of your screen.",
          type: "warning",
          resilienceDetail: "Zero-Data-Loss: DevBoard pauses network calls to prevent unhandled app crashes.",
        });

        ctx.log(
          "fault",
          "Network Disconnect Injected",
          "Simulating loss of client connectivity (navigator.onLine = false)"
        );
        ctx.setChaos({
          enabled: true,
          forceOffline: true,
        });
        toast.warning("Internet disconnected! Check the top status banner.");
        await ctx.sleep(2000);
      },
    },
    {
      id: "step-2-attempt-offline-mutation",
      title: "2. Handle Offline User Actions",
      description: "Demonstrates that offline actions are queued safely without throwing uncaught runtime errors.",
      expectedOutcome: "Request fails cleanly with ApiError(0) without crashing the runtime.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          title: "2. Preventing White Screen of Death",
          explanation: "If you try to perform actions while offline, DevBoard catches the network error and prevents broken app states.",
          type: "warning",
          resilienceDetail: "TanStack OnlineManager: Holds pending requests in a safe queue until connection returns.",
        });

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
        await ctx.sleep(2000);
      },
    },
    {
      id: "step-3-restore-connectivity",
      title: "3. Reconnecting & Auto-Syncing",
      description: "Re-establishes internet connectivity and triggers automated cache revalidation.",
      expectedOutcome: "Banner turns green ('Back Online') and stale queries refetch.",
      delayMs: 2500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setChaos({
          forceOffline: false,
        });

        ctx.setStoryBanner({
          title: "3. Back Online! Auto-Sync Resumed",
          explanation: "Connection restored! The top alert turns green, and DevBoard automatically pulls fresh data from the server.",
          type: "success",
          resilienceDetail: "Auto-Reconciliation: Cached queries invalidate and refetch without requiring a manual page refresh.",
        });

        ctx.log(
          "recovery",
          "Connection Restored",
          "OnlineManager resumed. Background refetches dispatched."
        );
        toast.success("Network connection restored!");
        await ctx.sleep(2000);
        ctx.resetChaos();
      },
    },
  ],
};

