"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";
import { useAuth } from "@/features/auth/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { uploadWorkspaceLogo } from "@/lib/supabase";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "../../schema";
import { useCreateWorkspace } from "../../hooks/use-create-workspace";
import { useUpdateWorkspace } from "../../hooks/use-update-workspace";
import { useDeleteWorkspace } from "../../hooks/use-delete-workspace";
import { WorkspaceLogoUploader } from "./workspace-logo-uploader";
import { WorkspaceDangerZone } from "./workspace-danger-zone";

interface WorkspaceFormProps {
  initialValues?: {
    id?: string;
    name?: string;
    logo?: string | null;
  };
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSuccess?: (workspace: any) => void;
  onDelete?: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function WorkspaceForm({
  initialValues,
  mode = "create",
  onCancel,
  onSuccess,
  onDelete,
  isDeleting = false,
}: WorkspaceFormProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues?.logo || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: initialValues?.name || "",
      logo: initialValues?.logo || "",
    },
  });

  const workspaceId = initialValues?.id || "";
  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace(workspaceId);
  const deleteWorkspaceMutation = useDeleteWorkspace(workspaceId);

  const isDeletingState = isDeleting || deleteWorkspaceMutation.isPending;
  const isSubmitting =
    isUploading ||
    createWorkspaceMutation.isPending ||
    updateWorkspaceMutation.isPending;

  const watchedName = form.watch("name");
  const watchedLogo = form.watch("logo");
  const hasNameChanged =
    (watchedName || "").trim() !== (initialValues?.name || "").trim();
  const hasLogoChanged =
    logoFile !== null || (watchedLogo || null) !== (initialValues?.logo || null);
  const hasChanges = mode === "edit" ? hasNameChanged || hasLogoChanged : true;

  const handleReset = () => {
    form.reset({
      name: initialValues?.name || "",
      logo: initialValues?.logo || "",
    });
    setLogoFile(null);
    if (previewUrl && previewUrl !== initialValues?.logo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(initialValues?.logo || null);
  };

  const onSubmit = async (data: CreateWorkspaceInput) => {
    let finalLogoUrl = data.logo;
    if (logoFile) {
      try {
        setIsUploading(true);
        finalLogoUrl = await uploadWorkspaceLogo(logoFile);
      } catch (err: any) {
        console.warn("Supabase upload skipped or failed, using fallback:", err?.message);
      } finally {
        setIsUploading(false);
      }
    }

    if (mode === "create") {
      createWorkspaceMutation.mutate(
        { name: data.name },
        {
          onSuccess: async (newWorkspace) => {
            if (finalLogoUrl && newWorkspace?.id) {
              try {
                await apiClient.patch(`/workspaces/${newWorkspace.id}`, {
                  logo: finalLogoUrl,
                });
              } catch (err) {
                console.error("Failed to save logo:", err);
              }
            }
            toast.success(en.workspace.form.toastCreateSuccess);
            handleReset();
            if (onSuccess) {
              onSuccess(newWorkspace);
            } else {
              router.push(`/dashboard/${newWorkspace.slug}`);
            }
          },
          onError: (error) => {
            toast.error(error.message || en.workspace.form.toastCreateError);
          },
        }
      );
    } else if (workspaceId) {
      updateWorkspaceMutation.mutate(
        {
          name: data.name,
          logo: finalLogoUrl || null,
        },
        {
          onSuccess: (updated) => {
            toast.success(en.workspace.form.toastUpdateSuccess);
            if (onSuccess) {
              onSuccess(updated);
            }
          },
          onError: (error) => {
            toast.error(error.message || en.workspace.form.toastUpdateError);
          },
        }
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete();
    } else if (workspaceId) {
      deleteWorkspaceMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(en.workspace.form.toastDeleteSuccess);
          router.push("/dashboard");
        },
        onError: (error) => {
          toast.error(error.message || en.workspace.form.toastDeleteError);
        },
      });
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/sign-in");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <Card className="w-full rounded-2xl border border-border/80 shadow-md bg-card">
        {mode === "create" && (
          <>
            <CardHeader className="flex flex-col items-center justify-center text-center p-6 pb-4">
              <CardTitle className="text-xl font-bold text-foreground">
                {en.workspace.form.createTitle}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1 text-center">
                {en.workspace.form.createDescription}
              </CardDescription>
            </CardHeader>
            <div className="px-6">
              <Separator />
            </div>
          </>
        )}

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field invalid={!!fieldState.error}>
                    <FieldLabel className="text-xs font-semibold">
                      {en.workspace.form.nameLabel}
                    </FieldLabel>
                    <Input
                      type="text"
                      placeholder={en.workspace.form.namePlaceholder}
                      className="w-full h-10 text-sm rounded-xl"
                      aria-invalid={!!fieldState.error}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="logo"
                render={({ fieldState }) => (
                  <WorkspaceLogoUploader
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    initialLogoUrl={initialValues?.logo}
                    disabled={isSubmitting}
                    setFormValue={(val) => form.setValue("logo", val, { shouldDirty: true })}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <div className="flex items-center justify-between pt-3 border-t border-border/80">
                {onCancel ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="cursor-pointer h-9 px-4 rounded-xl text-xs"
                  >
                    {en.workspace.form.cancelButton}
                  </Button>
                ) : mode === "edit" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!hasChanges || isSubmitting}
                    className="cursor-pointer h-9 px-4 rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {en.workspace.form.cancelButton}
                  </Button>
                ) : mode === "create" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground cursor-pointer text-xs h-9"
                  >
                    {en.workspace.form.signOutButton}
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || (mode === "edit" && !hasChanges)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "create"
                        ? en.workspace.form.creatingButton
                        : en.workspace.form.savingButton}
                    </>
                  ) : mode === "create" ? (
                    en.workspace.form.createButton
                  ) : (
                    en.workspace.form.saveButton
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {mode === "edit" && (onDelete || initialValues?.id) && (
        <WorkspaceDangerZone
          onDelete={handleConfirmDelete}
          isLoading={isDeletingState}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
}
