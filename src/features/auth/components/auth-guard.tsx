"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !pathname.startsWith("/sign-in") &&
      !pathname.startsWith("/sign-up")
    ) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/sign-in?callbackUrl=${callbackUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-y-4">
        <Loader2 className="size-8 animate-spin text-brand-text" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading DevBoard...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
