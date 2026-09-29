"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { updateProjectSchema, type UpdateProjectSchemaInput } from "../schema";
import { useUpdateProject } from "../hooks/use-update-project";
import { useDeleteProject } from "../hooks/use-delete-project";
import { uploadWorkspaceLogo } from "@/lib/supabase";
import { ProjectLogoUploader } from "./project-logo-uploader";
import { ProjectDangerZone } from "./project-danger-zone";
import type { Project } from "../types";
import type { WorkspaceRole } from "@/features/workspace/types";

interface ProjectFormProps {
  workspaceId: string;
  workspaceSlug: string;
  project: Project;
  currentUserRole?: WorkspaceRole;
}

export function ProjectForm({
  workspaceId,
  workspaceSlug,
  project,
  currentUserRole,
}: ProjectFormProps) {
  const router = useRouter();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    project.logo || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const canEdit =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const form = useForm<UpdateProjectSchemaInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      logo: project.logo || "",
    },
  });

  const updateProjectMutation = useUpdateProject(workspaceId, project.id);
  const deleteProjectMutation = useDeleteProject(workspaceId, project.id);

  const isSubmitting =
    isUploading || updateProjectMutation.isPending || deleteProjectMutation.isPending;

  const watchedName = form.watch("name");
  const watchedLogo = form.watch("logo");
  const hasNameChanged =
    (watchedName || "").trim() !== project.name.trim();
  const hasLogoChanged =
    logoFile !== null || (watchedLogo || null) !== (project.logo || null);
  const hasChanges = hasNameChanged || hasLogoChanged;

  const handleReset = () => {
    form.reset({
      name: project.name,
      logo: project.logo || "",
    });
    setLogoFile(null);
    if (previewUrl && previewUrl !== project.logo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(project.logo || null);
  };

  const onSubmit = async (data: UpdateProjectSchemaInput) => {
    if (!canEdit) return;

    let finalLogoUrl: string | null = data.logo || null;
    if (logoFile) {
      try {
        setIsUploading(true);
        finalLogoUrl = await uploadWorkspaceLogo(logoFile);
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload project logo.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    updateProjectMutation.mutate(
      { name: data.name, logo: finalLogoUrl },
      {
        onSuccess: (updated) => {
          toast.success(en.project.form.toastUpdateSuccess);
          if (updated?.slug && updated.slug !== project.slug) {
            router.push(`/dashboard/${workspaceSlug}/projects/${updated.slug}/settings`);
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || en.project.form.toastUpdateError);
        },
      }
    );
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    try {
      await deleteProjectMutation.mutateAsync();
      toast.success(en.project.form.toastDeleteSuccess);
      router.push(`/dashboard/${workspaceSlug}`);
    } catch (err: any) {
      toast.error(err?.message || en.project.form.toastDeleteError);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <Card className="w-full rounded-2xl border border-border/80 shadow-md bg-card">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field invalid={!!fieldState.error}>
                    <FieldLabel className="text-xs font-semibold">
                      {en.project.form.nameLabel}
                    </FieldLabel>
                    <Input
                      type="text"
                      placeholder={en.project.form.namePlaceholder}
                      className="w-full h-10 text-sm rounded-xl"
                      aria-invalid={!!fieldState.error}
                      disabled={isSubmitting || !canEdit}
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
                  <ProjectLogoUploader
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    initialLogoUrl={project.logo}
                    disabled={isSubmitting || !canEdit}
                    setFormValue={(val) => form.setValue("logo", val, { shouldDirty: true })}
                    error={fieldState.error?.message}
                    projectName={project.name}
                  />
                )}
              />

              <div className="flex items-center justify-between pt-3 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!hasChanges || isSubmitting}
                  className="cursor-pointer h-9 px-4 rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {en.project.form.cancelButton}
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !hasChanges || !canEdit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading
                        ? en.project.form.uploadingButton
                        : en.project.form.savingButton}
                    </>
                  ) : (
                    en.project.form.saveButton
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {canEdit && (
        <ProjectDangerZone
          projectName={project.name}
          onDelete={handleDelete}
          isLoading={deleteProjectMutation.isPending}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
}
