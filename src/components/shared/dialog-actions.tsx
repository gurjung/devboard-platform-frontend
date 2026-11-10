"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";

export interface DialogActionsProps {
  cancelLabel?: string;
  completeLabel: string;
  onCancel: () => void;
  isCompleteDisabled?: boolean;
  isCompleteLoading?: boolean;
  completeLoadingLabel?: string;
}

export function DialogActions({
  cancelLabel = en.common.cancel,
  completeLabel,
  onCancel,
  isCompleteDisabled = false,
  isCompleteLoading = false,
  completeLoadingLabel,
}: DialogActionsProps) {
  const showLoadingState = isCompleteLoading;
  const label = showLoadingState
    ? (completeLoadingLabel ?? completeLabel)
    : completeLabel;

  return (
    <DialogFooter className="flex flex-row items-center justify-end gap-2 w-full sm:justify-end pt-3 border-t border-border/60">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isCompleteLoading}
        className="h-8 text-xs rounded-lg px-3.5 cursor-pointer"
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={isCompleteDisabled || isCompleteLoading}
        className="h-8 text-xs rounded-lg px-3.5 cursor-pointer font-medium"
      >
        {showLoadingState && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </DialogFooter>
  );
}
