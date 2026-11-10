"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log exception to observability / simulation telemetry
    console.error("Dashboard Boundary Caught Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive-text border border-destructive/20 mb-4">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>

      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Something went wrong in this workspace
      </h1>

      <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground">
        An unexpected runtime exception was caught by the resilience boundary.
        Your session and data remain safe.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="sm"
          className="cursor-pointer gap-2 font-semibold shadow-xs"
        >
          <RotateCcw className="size-4" />
          Try Again
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            router.push("/dashboard");
          }}
          className="cursor-pointer gap-2 font-semibold"
        >
          <Home className="size-4" />
          Dashboard Home
        </Button>
      </div>

      {/* Developer / Simulation Error Details Accordion */}
      <div className="mt-8 max-w-lg w-full text-left">
        <button
          type="button"
          aria-expanded={showDetails}
          onClick={() => setShowDetails(!showDetails)}
          className="mx-auto flex items-center gap-1.5 min-h-6 px-2 rounded text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <span>{showDetails ? "Hide technical diagnostic" : "View technical diagnostic"}</span>
          {showDetails ? <ChevronUp className="size-3.5" aria-hidden="true" /> : <ChevronDown className="size-3.5" aria-hidden="true" />}
        </button>

        {showDetails && (
          <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs font-mono text-destructive-text">
            <p className="font-bold mb-1">Error Message:</p>
            <p className="break-all">{error.message || "Unknown client runtime exception"}</p>
            {error.digest && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Digest Code: <span className="font-semibold text-foreground">{error.digest}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
