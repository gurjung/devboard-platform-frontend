"use client";

import React from "react";
import { Trash2, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WORKSPACE_ROLES,
} from "@/features/workspace/constants";
import type { WorkspaceMember, WorkspaceRole } from "../../types";
import { en } from "@/locales/en";

interface MemberCardProps {
  member: WorkspaceMember;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
  onRoleChange: (member: WorkspaceMember, value: string) => void;
  onRemove: (member: WorkspaceMember) => void;
  disabled?: boolean;
}

export function MemberCard({
  member,
  currentUserId,
  currentUserRole,
  onRoleChange,
  onRemove,
  disabled = false,
}: MemberCardProps) {
  const memberUserId = member.userId || member.user?.id;
  const isCurrentUser = memberUserId === currentUserId;
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;
  const isAdmin = member.role === WORKSPACE_ROLES.ADMIN;

  let canChangeRole = false;
  let selectOptions: WorkspaceRole[] = [];

  if (!isCurrentUser) {
    if (currentUserRole === WORKSPACE_ROLES.OWNER) {
      canChangeRole = true;
      selectOptions = [
        WORKSPACE_ROLES.MEMBER,
        WORKSPACE_ROLES.ADMIN,
        WORKSPACE_ROLES.OWNER,
      ];
    } else if (currentUserRole === WORKSPACE_ROLES.ADMIN && !isOwner) {
      canChangeRole = true;
      selectOptions = [WORKSPACE_ROLES.MEMBER, WORKSPACE_ROLES.ADMIN];
    }
  }

  const canRemove = currentUserRole === WORKSPACE_ROLES.OWNER && !isCurrentUser;

  return (
    <Card className="rounded-xl border border-border/75 bg-card hover:border-border transition-colors duration-150">
      <CardContent className="p-4 flex flex-col gap-3.5 justify-between h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                src={member.user?.image || undefined}
                alt={member.user?.name || ""}
              />
              <AvatarFallback className="bg-primary/10 text-brand-text font-semibold text-xs">
                {member.user?.name
                  ? member.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : en.workspace.members.avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                {member.user?.name || en.workspace.members.anonymousUser}
                {isCurrentUser && (
                  <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-[9px] font-semibold">
                    {en.workspace.members.youBadge}
                  </span>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                {member.user?.email}
              </span>
            </div>
          </div>

          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(member)}
              disabled={disabled}
              className="shrink-0 text-muted-foreground hover:text-destructive-text hover:bg-destructive/10 cursor-pointer rounded-md"
              aria-label={`Remove ${member.user?.name || member.user?.email || "member"}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3 gap-4">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {en.workspace.members.roleLabel}
          </span>

          {canChangeRole ? (
            <Select
              value={member.role}
              onValueChange={(val) => {
                if (val) onRoleChange(member, val);
              }}
              disabled={disabled}
            >
              <SelectTrigger
                aria-label={`Role for ${member.user?.name || member.user?.email || "member"}`}
                className="w-28 h-8 px-2.5 bg-background border-input rounded-lg text-xs font-medium hover:border-border"
              >
                <SelectValue>
                  <span className="text-xs font-medium text-foreground">
                    {member.role === WORKSPACE_ROLES.OWNER
                      ? en.workspace.members.roles.owner
                      : member.role === WORKSPACE_ROLES.ADMIN
                        ? en.workspace.members.roles.admin
                        : en.workspace.members.roles.member}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-36 p-1 rounded-xl border border-border/80">
                {selectOptions.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt === WORKSPACE_ROLES.OWNER
                      ? en.workspace.members.roles.ownerTransfer
                      : opt === WORKSPACE_ROLES.ADMIN
                        ? en.workspace.members.roles.admin
                        : en.workspace.members.roles.member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-foreground">
              {isOwner ? (
                <>
                  <Shield className="size-3.5 text-amber-700 dark:text-amber-400 fill-amber-500/20" />
                  {en.workspace.members.roles.owner}
                </>
              ) : isAdmin ? (
                <>
                  <Shield className="size-3.5 text-blue-700 dark:text-blue-400 fill-blue-500/20" />
                  {en.workspace.members.roles.admin}
                </>
              ) : (
                <>
                  <User className="size-3.5 text-muted-foreground" />
                  {en.workspace.members.roles.member}
                </>
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
