"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Building2,
  Shield,
  UserCheck,
  Sparkles,
  Loader2,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";
import type { InvitePreview } from "../types";
import type { User } from "@/features/auth/types";

interface AcceptInviteCardProps {
  invite: InvitePreview;
  token: string;
  user: User | null;
  isAuthenticated: boolean;
  isAccepting: boolean;
  onAccept: () => void;
  onSignOutAndSwitch: () => void;
}

export function AcceptInviteCard({
  invite,
  token,
  user,
  isAuthenticated,
  isAccepting,
  onAccept,
  onSignOutAndSwitch,
}: AcceptInviteCardProps) {
  const router = useRouter();

  const isExpired =
    invite.isExpired ||
    invite.status === "EXPIRED" ||
    new Date(invite.expiresAt) < new Date();
  const isRevoked = invite.status === "REVOKED";
  const isAlreadyAccepted = invite.status === "ACCEPTED";

  // Check email mismatch
  const emailMismatch =
    isAuthenticated &&
    user?.email &&
    invite.email &&
    user.email.toLowerCase() !== invite.email.toLowerCase();

  const workspaceInitials = invite.workspace?.name
    ? invite.workspace.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "WS";

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Decorative gradient header backdrop */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

      <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Workspace Avatar */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/40 to-primary/10 blur-sm group-hover:blur transition-all" />
          <Avatar className="relative size-20 rounded-2xl border-2 border-background shadow-lg">
            <AvatarImage
              src={invite.workspace?.logo || undefined}
              alt={invite.workspace?.name || "Workspace"}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
              {workspaceInitials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Workspace Name & Invitation Banner */}
        <div className="space-y-1.5 mb-6">
          <Badge
            variant="secondary"
            className="mb-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide gap-1.5"
          >
            <Sparkles className="size-3 text-primary" />
            Workspace Invitation
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Join {invite.workspace?.name}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {invite.invitedBy?.name ? (
              <>
                <strong className="text-foreground">{invite.invitedBy.name}</strong>{" "}
                has invited you to collaborate as a{" "}
                <strong className="text-foreground capitalize">{invite.role.toLowerCase()}</strong>.
              </>
            ) : (
              <>
                You have been invited to collaborate as a{" "}
                <strong className="text-foreground capitalize">{invite.role.toLowerCase()}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Workspace Metadata Box */}
        <div className="w-full rounded-xl border border-border/60 bg-muted/20 p-3.5 mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              Role Assigned
            </span>
            <Badge
              variant={invite.role === "ADMIN" ? "default" : "outline"}
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              {invite.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-primary" />
              Invited Email
            </span>
            <span className="font-mono text-xs text-foreground font-medium truncate max-w-[190px]">
              {invite.email}
            </span>
          </div>
        </div>

        {/* ── State 1: Already Accepted ── */}
        {isAlreadyAccepted && (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-left">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>This invitation has already been accepted.</span>
            </div>
            <Button
              className="w-full h-10 text-xs font-semibold cursor-pointer gap-2"
              onClick={() => router.push(`/dashboard/${invite.workspace?.slug}`)}
            >
              <span>Go to Workspace</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* ── State 2: Expired ── */}
        {!isAlreadyAccepted && isExpired && (
          <div className="w-full space-y-4">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-left">
              <Clock className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Invitation Expired</p>
                <p className="text-[11px] text-destructive/90 mt-0.5">
                  This invitation has expired. Please request a new invite link from the workspace administrator.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full h-10 text-xs font-semibold cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </div>
        )}

        {/* ── State 3: Revoked ── */}
        {!isAlreadyAccepted && !isExpired && isRevoked && (
          <div className="w-full space-y-4">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-left">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Invitation Revoked</p>
                <p className="text-[11px] text-destructive/90 mt-0.5">
                  This invitation was cancelled by the workspace owner.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full h-10 text-xs font-semibold cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </div>
        )}

        {/* ── State 4: Unauthenticated (Logged out) ── */}
        {!isAlreadyAccepted && !isExpired && !isRevoked && !isAuthenticated && (
          <div className="w-full space-y-3">
            <p className="text-xs text-muted-foreground mb-4">
              Please sign in with <strong className="text-foreground">{invite.email}</strong> to accept this invitation.
            </p>
            <Button
              className="w-full h-10 text-xs font-semibold cursor-pointer gap-2 shadow-sm"
              onClick={() =>
                router.push(`/sign-in?callbackUrl=/invite/${token}`)
              }
            >
              <span>{en.workspace.invite.unauthenticated.signInButton}</span>
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 text-xs font-semibold cursor-pointer"
              onClick={() =>
                router.push(
                  `/sign-up?callbackUrl=/invite/${token}&email=${encodeURIComponent(
                    invite.email
                  )}`
                )
              }
            >
              {en.workspace.invite.unauthenticated.createAccountButton}
            </Button>
          </div>
        )}

        {/* ── State 5: Account Mismatch (Logged in as someone else) ── */}
        {!isAlreadyAccepted &&
          !isExpired &&
          !isRevoked &&
          isAuthenticated &&
          emailMismatch && (
            <div className="w-full space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs text-left">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Account Mismatch</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    You are signed in as{" "}
                    <strong className="text-foreground">{user?.email}</strong>, but
                    this invitation was specifically issued to{" "}
                    <strong className="text-foreground">{invite.email}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full h-10 text-xs font-semibold cursor-pointer gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onSignOutAndSwitch}
                >
                  <LogOut className="size-4" />
                  <span>Sign out and switch account</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs text-muted-foreground cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  Continue to my Dashboard
                </Button>
              </div>
            </div>
          )}

        {/* ── State 6: Authenticated & Email Matches (Ready to Accept!) ── */}
        {!isAlreadyAccepted &&
          !isExpired &&
          !isRevoked &&
          isAuthenticated &&
          !emailMismatch && (
            <div className="w-full space-y-4">
              <Button
                size="lg"
                className="w-full h-11 text-xs font-semibold cursor-pointer gap-2 shadow-md hover:shadow-lg transition-all"
                disabled={isAccepting}
                onClick={onAccept}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{en.workspace.invite.accept.acceptingButton}</span>
                  </>
                ) : (
                  <>
                    <span>{en.workspace.invite.accept.acceptButton}</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {en.workspace.invite.accept.footer}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
