"use client";

import { useState, useEffect } from "react";
import { onlineManager } from "@tanstack/react-query";
import { chaosController } from "@/features/simulation/chaos-controller";

export interface NetworkStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  showRestored: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const initialChaos = chaosController.getConfig().forceOffline;
    return typeof navigator !== "undefined" ? navigator.onLine && !initialChaos : true;
  });
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return chaosController.getConfig().forceOffline;
  });

  useEffect(() => {
    let restoreTimer: NodeJS.Timeout | null = null;
    let hasGoneOffline = false;

    const onOnline = () => {
      setIsOnline(true);
      if (hasGoneOffline) {
        setShowRestored(true);
        if (restoreTimer) clearTimeout(restoreTimer);
        restoreTimer = setTimeout(() => {
          setShowRestored(false);
          hasGoneOffline = false;
        }, 3500);
      }
    };

    const onOffline = () => {
      hasGoneOffline = true;
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const unsubChaos = chaosController.subscribeConfig((config) => {
      setIsSimulatedOffline(config.forceOffline);
      if (config.forceOffline) {
        onOffline();
      } else if (typeof navigator !== "undefined" && navigator.onLine) {
        onOnline();
      }
    });

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (restoreTimer) clearTimeout(restoreTimer);
      unsubChaos();
    };
  }, []);

  // Sync with TanStack Query's online manager
  useEffect(() => {
    onlineManager.setOnline(isOnline);
  }, [isOnline]);

  return {
    isOnline,
    isSimulatedOffline,
    showRestored,
  };
}
