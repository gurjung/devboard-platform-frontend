"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { en } from "@/locales/en";

interface ProjectDangerZoneProps {
  projectName: string;
  onDelete: () => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ProjectDangerZone({
  projectName,
  onDelete,
  isLoading = false,
  disabled = false,
}: ProjectDangerZoneProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isDeletingState = isLoading || internalLoading;

  const handleConfirmDelete = async () => {
    try {
      setInternalLoading(true);
      await onDelete();
    } finally {
      setInternalLoading(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Card className="w-full rounded-xl border border-destructive/25 bg-destructive/[0.04]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-xs font-semibold text-destructive-text uppercase tracking-wider text-left">
            {en.project.dangerZone.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 text-left">
            {en.project.dangerZone.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex justify-start">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={isDeletingState || disabled}
            className="cursor-pointer h-8 px-3.5 rounded-lg text-xs font-medium"
          >
            {isDeletingState ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                {en.project.dangerZone.deletingButton}
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 size-3.5" />
                {en.project.dangerZone.deleteButton}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`${en.project.dangerZone.confirmTitle}: "${projectName}"`}
        description={en.project.dangerZone.confirmDescription}
        confirmLabel={en.project.dangerZone.confirmButton}
        confirmLoadingLabel={en.project.dangerZone.deletingButton}
        cancelLabel={en.workspace.form.cancelButton}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingState}
        variant="danger"
      />
    </>
  );
}
