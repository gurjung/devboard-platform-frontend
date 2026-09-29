"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload project logo.");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FieldGroup className="space-y-4">
          <Field invalid={!!form.formState.errors.name}>
            <FieldLabel className="text-xs font-semibold">
              {en.project.createDialog.nameLabel}
            </FieldLabel>
            <Input
              placeholder={en.project.createDialog.namePlaceholder}
              disabled={isSubmitting}
              autoFocus
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          {/* Optional Project Logo */}
          <Field>
            <FieldLabel className="text-xs font-semibold">
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
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            <div className="flex items-center gap-4 mt-1">
              <Avatar className="size-14 rounded-xl border border-border/80">
                <AvatarImage src={previewUrl || undefined} className="object-cover" />
                <AvatarFallback className="rounded-xl bg-muted text-muted-foreground">
                  {isCompressing ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </AvatarFallback>
              </Avatar>

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
