"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useInvite } from "@/features/invites/hooks/use-invite";
import { useAcceptInvite } from "@/features/invites/hooks/use-accept-invite";
import { AcceptInviteCard } from "@/features/invites/components/accept-invite-card";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";
import { TourSpotlightWrapper } from "@/features/simulation/components/tour-spotlight-wrapper";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  const {
    data: invite,
    isLoading: isInviteLoading,
    isError,
    error,
  } = useInvite(token);

  const acceptInviteMutation = useAcceptInvite(token);

  const handleAccept = () => {
    acceptInviteMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(en.workspace.invite.accept.toastSuccess);
        const slug = res.workspace?.slug;
        if (slug) {
          router.push(`/dashboard/${slug}`);
        } else {
          router.push("/dashboard");
        }
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : en.workspace.invite.accept.toastErrorGeneric;
        toast.error(msg);
      },
    });
  };

  const handleSignOutAndSwitch = async () => {
    try {
      await logout();
      router.push(`/sign-in?callbackUrl=/invite/${token}`);
    } catch {
      router.push(`/sign-in?callbackUrl=/invite/${token}`);
    }
  };

  const isLoading = isInviteLoading || isAuthLoading;

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Subtle Linear ambient radial hairline glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.56_0.195_268_/_0.09),transparent_60%)]"
      />

      <div className="w-full max-w-md relative z-10">
        {isLoading ? (
          <div className="w-full rounded-xl border border-border/50 bg-card p-8 shadow-xl flex flex-col items-center justify-center min-h-[360px] gap-4">
            <Loader2 className="size-7 animate-spin text-brand-text" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Verifying workspace invitation...
            </p>
          </div>
        ) : isError || !invite ? (
          <div className="w-full rounded-xl border border-border/50 bg-card p-7 shadow-xl text-center flex flex-col items-center gap-4">
            <div className="size-12 rounded-xl bg-destructive/10 text-destructive-text flex items-center justify-center border border-destructive/20">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {en.workspace.invite.errors.NOT_FOUND.title}
              </h1>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {error instanceof Error
                  ? error.message
                  : en.workspace.invite.errors.NOT_FOUND.description}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-8 rounded-lg text-xs font-medium cursor-pointer gap-2"
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/")}
            >
              <ArrowLeft className="size-3.5" />
              <span>
                {isAuthenticated
                  ? en.workspace.invite.errors.returnToDashboard
                  : "Return to Home"}
              </span>
            </Button>
          </div>
        ) : (
          <TourSpotlightWrapper id="accept-invite-card">
            <AcceptInviteCard
              invite={invite}
              token={token}
              user={user}
              isAuthenticated={isAuthenticated}
              isAccepting={acceptInviteMutation.isPending}
              onAccept={handleAccept}
              onSignOutAndSwitch={handleSignOutAndSwitch}
            />
          </TourSpotlightWrapper>
        )}
      </div>
    </main>
  );
}
