"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { AUTH_ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace(AUTH_ROUTES.dashboard);
      } else {
        router.replace(AUTH_ROUTES.signIn);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-y-4">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading DevBoard...
      </p>
    </div>
  );
}
