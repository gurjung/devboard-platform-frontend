"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { en } from "@/locales/en";
import { Trash2, AlertTriangle } from "lucide-react";

interface ProjectDangerZoneProps {
  projectName: string;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}

export function ProjectDangerZone({
  projectName,
  onDelete,
  disabled = false,
}: ProjectDangerZoneProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="size-4" />
              {en.project.dangerZone.title}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              {en.project.dangerZone.description}
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={disabled || isDeleting}
            className="shrink-0 cursor-pointer font-semibold text-xs"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            {en.project.dangerZone.deleteButton}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`${en.project.dangerZone.confirmTitle}: "${projectName}"`}
        description={en.project.dangerZone.confirmDescription}
        confirmLabel={en.project.dangerZone.confirmButton}
        confirmLoadingLabel={en.project.dangerZone.deletingButton}
        cancelLabel={en.common.cancel}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
