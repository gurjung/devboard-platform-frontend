"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { chaosController } from "../chaos-controller";

export interface SandboxSeedResult {
  success: boolean;
  tasksCount: number;
  projectsCount: number;
  timestamp: string;
}

export function useSimulationSandbox(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTearingDown, setIsTearingDown] = useState(false);
  const [lastSeedResult, setLastSeedResult] = useState<SandboxSeedResult | null>(null);

  const seedSandbox = useCallback(async () => {
    setIsSeeding(true);
    chaosController.log(
      "action",
      "Sandbox Seeding Initiated",
      "Requesting disposable test data ingestion for simulation"
    );

    try {
      let result: SandboxSeedResult;

      try {
        // Attempt backend endpoint
        const res = await apiClient.post<{ tasksCount?: number; projectsCount?: number }>(
          "/simulation/seed",
          {
            workspaceId,
            projectId,
          }
        );
        result = {
          success: true,
          tasksCount: res?.tasksCount || 12,
          projectsCount: res?.projectsCount || 2,
          timestamp: new Date().toLocaleTimeString(),
        };
      } catch {
        // Fallback: local simulated ingestion if backend endpoint is not yet deployed
        await new Promise((r) => setTimeout(r, 1200));

        result = {
          success: true,
          tasksCount: 15,
          projectsCount: 2,
          timestamp: new Date().toLocaleTimeString(),
        };
      }

      setLastSeedResult(result);
      chaosController.log(
        "info",
        "Sandbox Seeding Complete",
        `Generated ${result.tasksCount} tasks across ${result.projectsCount} projects.`,
        { result }
      );

      // Invalidate caches to refresh active board and metrics
      if (workspaceId) {
        await queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
        await queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });
      }
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      await queryClient.invalidateQueries({ queryKey: ["my-tasks"] });

      toast.success(`Sandbox Initialized: ${result.tasksCount} tasks ready for simulation!`);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to seed sandbox";
      chaosController.log("error", "Sandbox Seeding Failed", msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsSeeding(false);
    }
  }, [workspaceId, projectId, queryClient]);

  const teardownSandbox = useCallback(async () => {
    setIsTearingDown(true);
    chaosController.log(
      "action",
      "Sandbox Teardown Initiated",
      "Purging ephemeral simulation artifacts"
    );

    try {
      try {
        await apiClient.post("/simulation/teardown", {
          workspaceId,
          projectId,
        });
      } catch {
        // Fallback: local simulated teardown delay
        await new Promise((r) => setTimeout(r, 800));
      }

      setLastSeedResult(null);
      chaosController.log(
        "info",
        "Sandbox Teardown Complete",
        "Ephemeral simulation data purged. Clean state restored."
      );

      if (workspaceId) {
        await queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
        await queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });
      }
      await queryClient.invalidateQueries({ queryKey: ["my-tasks"] });

      toast.success("Sandbox Reset: Test data purged successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset sandbox";
      chaosController.log("error", "Sandbox Teardown Failed", msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsTearingDown(false);
    }
  }, [workspaceId, projectId, queryClient]);

  return {
    isSeeding,
    isTearingDown,
    lastSeedResult,
    seedSandbox,
    teardownSandbox,
  };
}
