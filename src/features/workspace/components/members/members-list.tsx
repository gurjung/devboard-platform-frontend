"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { en } from "@/locales/en";
import {
  WORKSPACE_ROLES,
  type WorkspaceRoleType,
} from "@/features/workspace/constants";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MembersListSkeleton } from "./members-list-skeleton";
import { MembersListError } from "./members-list-error";
import { MemberCard } from "./member-card";
import { useWorkspaceMembers } from "../../hooks/use-workspace-members";
import { useUpdateMemberRole } from "../../hooks/use-update-member-role";
import { useRemoveMember } from "../../hooks/use-remove-member";
import type { WorkspaceMember, WorkspaceRole } from "../../types";

interface MembersListProps {
  workspaceId: string;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}

export function MembersList({
  workspaceId,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const {
    data: members,
    isLoading,
    isError,
    error,
  } = useWorkspaceMembers(workspaceId);
  const updateRoleMutation = useUpdateMemberRole(workspaceId);
  const removeMemberMutation = useRemoveMember(workspaceId);

  const [memberToRemove, setMemberToRemove] =
    useState<WorkspaceMember | null>(null);
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    member: WorkspaceMember;
    newRole: WorkspaceRole;
  } | null>(null);

  if (isLoading) {
    return <MembersListSkeleton />;
  }

  if (isError) {
    return (
      <MembersListError
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }

  const handleRoleChange = (member: WorkspaceMember, value: string) => {
    const newRole = value as WorkspaceRole;
    if (newRole === member.role) return;

    if (newRole === WORKSPACE_ROLES.OWNER) {
      setRoleChangeRequest({ member, newRole });
      return;
    }

    executeRoleChange(member.id, newRole);
  };

  const executeRoleChange = (memberId: string, role: WorkspaceRole) => {
    updateRoleMutation.mutate(
      { memberId, role },
      {
        onSuccess: () => {
          toast.success(en.workspace.members.toastRoleSuccess);
          setRoleChangeRequest(null);
        },
        onError: (err: any) => {
          toast.error(err.message || en.workspace.members.toastRoleError);
        },
      }
    );
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeRequest) return;
    executeRoleChange(roleChangeRequest.member.id, roleChangeRequest.newRole);
  };

  const handleRemoveMember = (member: WorkspaceMember) => {
    setMemberToRemove(member);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(memberToRemove.id, {
      onSuccess: () => {
        toast.success(
          `${memberToRemove.user?.name || en.workspace.members.toastRemoveSuccessFallback} ${en.workspace.members.toastRemoveSuccess}`
        );
        setMemberToRemove(null);
      },
      onError: (err: any) => {
        toast.error(err.message || en.workspace.members.toastRemoveError);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members?.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onRoleChange={handleRoleChange}
            onRemove={handleRemoveMember}
            disabled={
              updateRoleMutation.isPending || removeMemberMutation.isPending
            }
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title={en.workspace.members.removeConfirm.title}
        description={`Are you sure you want to remove ${
          memberToRemove?.user?.name ||
          memberToRemove?.user?.email ||
          "this member"
        } from the workspace? All their project access will be revoked.`}
        confirmLabel={en.workspace.members.removeConfirm.confirmButton}
        confirmLoadingLabel={
          en.workspace.members.removeConfirm.confirmLoadingButton
        }
        onConfirm={handleConfirmRemove}
        isLoading={removeMemberMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!roleChangeRequest}
        onOpenChange={(open) => !open && setRoleChangeRequest(null)}
        title={en.workspace.members.transferConfirm.title}
        description={`Are you sure you want to transfer ownership of the workspace to ${
          roleChangeRequest?.member.user?.name ||
          roleChangeRequest?.member.user?.email ||
          "this member"
        }? You will be demoted to Admin and will no longer have full owner-level access.`}
        confirmLabel={en.workspace.members.transferConfirm.confirmButton}
        confirmLoadingLabel={
          en.workspace.members.transferConfirm.confirmLoadingButton
        }
        onConfirm={handleConfirmRoleChange}
        isLoading={updateRoleMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
