"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon, Save } from "lucide-react";
import { en } from "@/locales/en";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(project.logo || null);
  const [isCompressing, setIsCompressing] = useState(false);
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
    isCompressing || isUploading || updateProjectMutation.isPending;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error(en.project.createDialog.toastImageError);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }

    try {
      setIsCompressing(true);
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      setLogoFile(compressedFile);

      if (previewUrl && previewUrl !== project.logo) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error("Error compressing image:", err);
      toast.error(en.project.createDialog.toastProcessError);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveLogo = () => {
    if (previewUrl && previewUrl !== project.logo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setLogoFile(null);
    form.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: UpdateProjectSchemaInput) => {
    if (!canEdit) return;

    let finalLogoUrl: string | null = previewUrl ? project.logo || null : null;
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
          router.push(`/dashboard/${workspaceSlug}/projects/${updated.slug}`);
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

  const watchedName = form.watch("name");
  const hasChanges =
    (watchedName || "").trim() !== project.name.trim() ||
    logoFile !== null ||
    (previewUrl !== (project.logo || null));

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup className="space-y-5">
          <Field invalid={!!form.formState.errors.name}>
            <FieldLabel className="text-xs font-semibold">
              {en.project.form.nameLabel}
            </FieldLabel>
            <Input
              disabled={isSubmitting || !canEdit}
              placeholder={en.project.form.namePlaceholder}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          {/* Project Logo Field */}
          <Field>
            <FieldLabel className="text-xs font-semibold">
              {en.project.logoUploader.label}{" "}
              <span className="font-normal text-muted-foreground">
                {en.project.logoUploader.optional}
              </span>
            </FieldLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting || !canEdit}
            />

            <div className="flex items-center gap-4 mt-1.5">
              <Avatar className="size-16 rounded-xl border border-border/80">
                <AvatarImage src={previewUrl || undefined} className="object-cover" />
                <AvatarFallback className="rounded-xl bg-muted text-muted-foreground text-base font-bold">
                  {isCompressing ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    project.name.slice(0, 2).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>

              {canEdit && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs cursor-pointer"
                      disabled={isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-3.5 mr-1.5" />
                      {previewUrl
                        ? en.project.logoUploader.changeLogo
                        : en.project.logoUploader.selectImage}
                    </Button>

                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                        disabled={isSubmitting}
                        onClick={handleRemoveLogo}
                      >
                        <X className="size-3.5 mr-1" />
                        {en.project.logoUploader.remove}
                      </Button>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {en.project.logoUploader.hint}
                  </span>
                </div>
              )}
            </div>
          </Field>
        </FieldGroup>

        {canEdit && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
              disabled={isSubmitting}
              onClick={() =>
                router.push(`/dashboard/${workspaceSlug}/projects/${project.slug}`)
              }
            >
              {en.project.form.cancelButton}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !hasChanges}
              className="text-xs font-semibold cursor-pointer gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>
                    {isUploading
                      ? en.project.form.uploadingButton
                      : en.project.form.savingButton}
                  </span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>{en.project.form.saveButton}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Danger Zone for Owners and Admins */}
      {canEdit && (
        <ProjectDangerZone
          projectName={project.name}
          onDelete={handleDelete}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
}
