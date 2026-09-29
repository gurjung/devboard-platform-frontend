"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertCircle, ArrowLeft, Building2 } from "lucide-react";
import { useInvite } from "@/features/invites/hooks/use-invite";
import { useAcceptInvite } from "@/features/invites/hooks/use-accept-invite";
import { AcceptInviteCard } from "@/features/invites/components/accept-invite-card";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";

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
      onError: (err: any) => {
        const msg = err?.message || en.workspace.invite.accept.toastErrorGeneric;
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
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {isLoading ? (
          <div className="w-full rounded-2xl border border-border/80 bg-card/80 p-8 shadow-xl flex flex-col items-center justify-center min-h-[380px] gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Verifying workspace invitation...
            </p>
          </div>
        ) : isError || !invite ? (
          <div className="w-full rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-8 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="size-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
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
              className="mt-2 text-xs font-semibold cursor-pointer gap-2"
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
          <AcceptInviteCard
            invite={invite}
            token={token}
            user={user}
            isAuthenticated={isAuthenticated}
            isAccepting={acceptInviteMutation.isPending}
            onAccept={handleAccept}
            onSignOutAndSwitch={handleSignOutAndSwitch}
          />
        )}
      </div>
    </div>
  );
}
