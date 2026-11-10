"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";
import { DevBoardLogo } from "@/components/shared/devboard-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthToggleButton({ isSignIn }: { isSignIn: boolean }) {
  const searchParams = useSearchParams();
  const callback = searchParams.get("callbackUrl");
  const baseTarget = isSignIn ? "/sign-up" : "/sign-in";
  const toggleUrl = callback
    ? `${baseTarget}?callbackUrl=${encodeURIComponent(callback)}`
    : baseTarget;

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link href={toggleUrl} />}
      className="h-8 rounded-lg text-xs font-medium"
    >
      {isSignIn ? en.auth.layout.signUpToggle : en.auth.layout.loginToggle}
    </Button>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";
  const fallbackHref = isSignIn ? "/sign-up" : "/sign-in";

  return (
    <main className="relative bg-background min-h-screen text-foreground overflow-hidden">
      {/* Subtle Linear dark-studio top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.56_0.195_268_/_0.09),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto max-w-screen-2xl p-4 sm:px-6">
        <nav aria-label="Authentication navigation" className="flex justify-between items-center py-1">
          <Link href="/" className="focus-visible:outline-2 focus-visible:outline-ring rounded-md">
            <DevBoardLogo size="default" />
          </Link>
          <Suspense
            fallback={
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={fallbackHref} />}
                className="h-8 rounded-lg text-xs font-medium"
              >
                {isSignIn ? en.auth.layout.signUpToggle : en.auth.layout.loginToggle}
              </Button>
            }
          >
            <AuthToggleButton isSignIn={isSignIn} />
          </Suspense>
        </nav>

        <div className="flex flex-col items-center justify-center pt-6 md:pt-14 pb-10">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-7 w-7 animate-spin text-brand-text" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
