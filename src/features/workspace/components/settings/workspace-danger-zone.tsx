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

interface WorkspaceDangerZoneProps {
  onDelete: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function WorkspaceDangerZone({
  onDelete,
  isLoading = false,
  disabled = false,
}: WorkspaceDangerZoneProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <>
      <Card className="w-full rounded-xl border border-destructive/25 bg-destructive/[0.04]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-xs font-semibold text-destructive-text uppercase tracking-wider text-left">
            {en.workspace.dangerZone.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 text-left">
            {en.workspace.dangerZone.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex justify-start">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={isLoading || disabled}
            className="cursor-pointer h-8 px-3.5 rounded-lg text-xs font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                {en.workspace.dangerZone.deletingButton}
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 size-3.5" />
                {en.workspace.dangerZone.deleteButton}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={en.workspace.dangerZone.confirmTitle}
        description={en.workspace.dangerZone.confirmDescription}
        confirmLabel={en.workspace.dangerZone.confirmButton}
        onConfirm={onDelete}
        isLoading={isLoading}
        variant="danger"
      />
    </>
  );
}
