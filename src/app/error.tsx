"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Root Application Error Caught:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive-text border border-destructive/20 mb-4">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Application Error
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unhandled exception occurred in the client application.
        The resilience boundary isolated the failure.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="cursor-pointer gap-2 font-semibold shadow-xs"
        >
          <RotateCcw className="size-4" />
          Recover & Reload
        </Button>
      </div>
    </main>
  );
}

