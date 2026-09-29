"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MembersList } from "@/features/workspace/components/members/members-list";
import { InviteMemberDialog } from "@/features/invites/components/invite-member-dialog";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useAuth } from "@/features/auth/context/auth-context";
import { en } from "@/locales/en";
import type { WorkspaceRole } from "@/features/workspace/types";

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const { data: workspaces, isLoading } = useWorkspaces();
  const { user } = useAuth();

  const workspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold text-foreground">
          Workspace not found
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          The requested workspace could not be found.
        </p>
      </div>
    );
  }

  const role = (workspace.role || "MEMBER").toUpperCase() as WorkspaceRole;
  const canInvite = role === "OWNER" || role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {en.workspace.members.pageTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {en.workspace.members.pageDescription}
          </p>
        </div>

        {canInvite && (
          <div className="shrink-0">
            <InviteMemberDialog
              workspaceId={workspace.id}
              workspaceName={workspace.name}
            />
          </div>
        )}
      </div>

      <MembersList
        workspaceId={workspace.id}
        currentUserId={user?.id || ""}
        currentUserRole={role}
      />
    </div>
  );
}
