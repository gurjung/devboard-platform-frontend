"use client";

import React from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { chaosController } from "@/features/simulation/chaos-controller";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NetworkStatusBanner() {
  const { isOnline, isSimulatedOffline, showRestored } = useNetworkStatus();

  const handleReconnect = () => {
    if (isSimulatedOffline) {
      chaosController.updateConfig({ forceOffline: false });
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between px-4 py-2 text-xs font-medium transition-all duration-300 shadow-xs",
        !isOnline
          ? "bg-destructive text-destructive-foreground"
          : "bg-emerald-700 text-white"
      )}
    >
      <div className="flex items-center gap-2 mx-auto sm:mx-0">
        {!isOnline ? (
          <>
            <WifiOff className="size-4 animate-pulse" />
            <span>
              <strong>{isSimulatedOffline ? "Simulated Offline Mode" : "No Internet Connection"}</strong>:
              {" "}Mutations are paused. Reconnecting automatically when available.
            </span>
          </>
        ) : (
          <>
            <Wifi className="size-4" />
            <span>
              <strong>Back Online</strong>: Connection restored. Queries and mutations are resyncing.
            </span>
          </>
        )}
      </div>

      {!isOnline && (
        <Button
          variant="outline"
          size="xs"
          onClick={handleReconnect}
          className="cursor-pointer bg-destructive-foreground/10 text-white border-white/20 hover:bg-destructive-foreground/20 text-[11px] gap-1"
        >
          <RefreshCw className="size-3" />
          {isSimulatedOffline ? "Restore Connection" : "Retry"}
        </Button>
      )}
    </div>
  );
}
