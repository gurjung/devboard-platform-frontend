"use client";

import React, { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UserPlus,
  Copy,
  Check,
  Clock,
} from "lucide-react";
import { en } from "@/locales/en";
import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { inviteMemberSchema, type InviteMemberInput } from "../schema";
import { useCreateInvite } from "../hooks/use-create-invite";

interface InviteMemberDialogProps {
  workspaceId: string;
  workspaceName?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  workspaceName,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InviteMemberDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLinkId = useId();
  const emailId = useId();
  const emailErrorId = useId();
  const roleLabelId = useId();
  const roleTriggerId = useId();
  const roleErrorId = useId();

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const createInviteMutation = useCreateInvite(workspaceId);

  const handleReset = () => {
    form.reset({
      email: "",
      role: "MEMBER",
    });
    setGeneratedLink(null);
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success(en.workspace.invite.generatedView.toastCopied);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const onSubmit = async (data: InviteMemberInput) => {
    createInviteMutation.mutate(data, {
      onSuccess: (result) => {
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";
        const fullUrl = `${origin}/invite/${result.token}`;
        setGeneratedLink(fullUrl);
        toast.success(en.workspace.invite.dialog.toastSuccess);
      },
      onError: (err: unknown) => {
        const errorObj = err as { status?: number; response?: { status?: number }; message?: string };
        const status = errorObj?.status || errorObj?.response?.status;
        const msg = errorObj?.message || "";
        if (status === 409 || msg.includes("already a member")) {
          toast.error(en.workspace.invite.dialog.toastErrorMember);
        } else if (status === 403) {
          toast.error(en.workspace.invite.dialog.toastErrorPermission);
        } else {
          toast.error(msg || en.workspace.invite.dialog.toastErrorDefault);
        }
      },
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleReset();
        setOpen(nextOpen);
      }}
      title={
        generatedLink
          ? en.workspace.invite.generatedView.title
          : en.workspace.invite.dialog.title
      }
      trigger={
        children || (
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="size-3.5" />
            <span>{en.workspace.collaboration.inviteButton}</span>
          </Button>
        )
      }
    >
      <p className="text-xs text-muted-foreground text-left -mt-1 mb-3">
        {generatedLink
          ? en.workspace.invite.generatedView.description
          : workspaceName
            ? `Invite a teammate to collaborate in ${workspaceName}.`
            : "Generate an invite link to collaborate in this workspace."}
      </p>

      {generatedLink ? (
        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={inviteLinkId}
              className="text-xs font-medium text-foreground"
            >
              Shareable Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                id={inviteLinkId}
                readOnly
                value={generatedLink}
                onFocus={(e) => e.target.select()}
                className="font-mono text-xs h-8 rounded-lg bg-muted/30 select-all cursor-text"
              />
              <Button
                type="button"
                size="sm"
                variant={copied ? "default" : "outline"}
                onClick={handleCopyLink}
                className="shrink-0 h-8 rounded-lg text-xs flex items-center gap-1.5 min-w-[96px] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-current" />
                    <span>{en.workspace.invite.generatedView.copiedButton}</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>{en.workspace.invite.generatedView.copyButton}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
            <Clock className="size-4 text-brand-text shrink-0" />
            <span>
              This link is single-use and will automatically expire in{" "}
              <strong className="text-foreground">7 days</strong>.
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-3.5 mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 rounded-lg text-xs cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Invite Another Member
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleClose}
              className="h-8 rounded-lg text-xs cursor-pointer"
            >
              {en.workspace.invite.generatedView.doneButton}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4 py-1">
          <FieldGroup className="space-y-3.5">
            <Field invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor={emailId} className="text-xs font-medium">
                {en.workspace.invite.dialog.emailLabel}
              </FieldLabel>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                placeholder={en.workspace.invite.dialog.emailPlaceholder}
                className="h-9 rounded-lg text-xs"
                disabled={createInviteMutation.isPending}
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={form.formState.errors.email ? emailErrorId : undefined}
                {...form.register("email")}
              />
              <FieldError id={emailErrorId}>
                {form.formState.errors.email?.message}
              </FieldError>
            </Field>

            <Field invalid={!!form.formState.errors.role}>
              <FieldLabel
                id={roleLabelId}
                htmlFor={roleTriggerId}
                className="text-xs font-medium"
              >
                {en.workspace.invite.dialog.roleLabel}
              </FieldLabel>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val);
                    }}
                    disabled={createInviteMutation.isPending}
                  >
                    <SelectTrigger
                      id={roleTriggerId}
                      aria-labelledby={roleLabelId}
                      aria-invalid={!!form.formState.errors.role}
                      aria-describedby={form.formState.errors.role ? roleErrorId : undefined}
                      className="w-full h-9 rounded-lg text-xs"
                    >
                      <SelectValue placeholder={en.workspace.invite.dialog.rolePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MEMBER">
                        <div className="flex flex-col text-left py-0.5">
                          <span className="font-medium text-xs">
                            {en.workspace.invite.dialog.roleMember}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Can view projects, tasks, and collaborate
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex flex-col text-left py-0.5">
                          <span className="font-medium text-xs">
                            {en.workspace.invite.dialog.roleAdmin}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Can create projects, invite members, and edit settings
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError id={roleErrorId}>
                {form.formState.errors.role?.message}
              </FieldError>
            </Field>
          </FieldGroup>

          <DialogActions
            completeLabel={en.workspace.invite.dialog.generateButton}
            completeLoadingLabel={en.workspace.invite.dialog.generatingButton}
            isCompleteLoading={createInviteMutation.isPending}
            onCancel={handleClose}
          />
        </form>
      )}
    </FormDialog>
  );
}
