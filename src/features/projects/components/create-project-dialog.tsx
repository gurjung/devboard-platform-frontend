"use client";

import * as React from "react";
import { useId, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon, Plus } from "lucide-react";
import { en } from "@/locales/en";
import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { createProjectSchema, type CreateProjectSchemaInput } from "../schema";
import { useCreateProject } from "../hooks/use-create-project";
import { uploadWorkspaceLogo } from "@/lib/supabase";

interface CreateProjectDialogProps {
  workspaceId: string;
  workspaceSlug: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateProjectDialog({
  workspaceId,
  workspaceSlug,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const nameErrorId = useId();
  const logoTriggerId = useId();
  const logoHintId = useId();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateProjectSchemaInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      logo: "",
    },
  });

  const createProjectMutation = useCreateProject(workspaceId);
  const isSubmitting =
    isCompressing || isUploading || createProjectMutation.isPending;

  const handleReset = () => {
    form.reset({ name: "", logo: "" });
    setIsCompressing(false);
    setIsUploading(false);
    setLogoFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

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

      if (previewUrl) {
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setLogoFile(null);
    form.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CreateProjectSchemaInput) => {
    let finalLogoUrl: string | null = null;
    if (logoFile) {
      try {
        setIsUploading(true);
        finalLogoUrl = await uploadWorkspaceLogo(logoFile);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload project logo.";
        toast.error(msg);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    createProjectMutation.mutate(
      { name: data.name, logo: finalLogoUrl },
      {
        onSuccess: (newProject) => {
          toast.success(en.project.createDialog.toastSuccess);
          handleClose();
          router.push(`/dashboard/${workspaceSlug}/projects/${newProject.slug}`);
        },
        onError: (error) => {
          toast.error(error.message || en.project.createDialog.toastError);
        },
      }
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleReset();
        setOpen(nextOpen);
      }}
      title={en.project.createDialog.title}
      trigger={
        children || (
          <Button
            type="button"
            size="sm"
            className="flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Plus className="size-3.5" />
            <span>{en.project.createDialog.createButton}</span>
          </Button>
        )
      }
    >
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e);
        }}
        noValidate
        className="space-y-4 py-2"
      >
        <FieldGroup className="space-y-4">
          <Field invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor={nameId} className="text-xs font-semibold">
              {en.project.createDialog.nameLabel}
            </FieldLabel>
            <Input
              id={nameId}
              placeholder={en.project.createDialog.namePlaceholder}
              disabled={isSubmitting}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? nameErrorId : undefined}
              autoFocus
              {...form.register("name")}
            />
            <FieldError id={nameErrorId}>
              {form.formState.errors.name?.message}
            </FieldError>
          </Field>

          {/* Optional Project Logo */}
          <Field>
            <FieldLabel htmlFor={logoTriggerId} className="text-xs font-semibold">
              {en.project.createDialog.logoLabel}{" "}
              <span className="font-normal text-muted-foreground">
                {en.project.createDialog.logoOptional}
              </span>
            </FieldLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            <div className="flex items-center gap-3.5 p-3 rounded-lg border border-dashed border-border bg-muted/20">
              <Avatar className="size-12 rounded-lg border border-border/80 shrink-0">
                <AvatarImage src={previewUrl || undefined} alt="" className="object-cover" />
                <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                  {isCompressing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Button
                    id={logoTriggerId}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-3 rounded-lg cursor-pointer"
                    disabled={isSubmitting}
                    aria-describedby={logoHintId}
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
                      className="h-8 text-xs text-destructive-text hover:bg-destructive/10 hover:text-destructive-text rounded-lg cursor-pointer"
                      disabled={isSubmitting}
                      onClick={handleRemoveLogo}
                    >
                      <X className="size-3.5 mr-1" />
                      {en.project.logoUploader.remove}
                    </Button>
                  )}
                </div>
                <span id={logoHintId} className="text-[11px] text-muted-foreground">
                  {en.project.createDialog.logoHint}
                </span>
              </div>
            </div>
          </Field>
        </FieldGroup>

        <DialogActions
          completeLabel={en.project.createDialog.createButton}
          completeLoadingLabel={
            isUploading
              ? en.project.createDialog.uploadingButton
              : en.project.createDialog.creatingButton
          }
          isCompleteLoading={isSubmitting}
          onCancel={handleClose}
        />
      </form>
    </FormDialog>
  );
}
