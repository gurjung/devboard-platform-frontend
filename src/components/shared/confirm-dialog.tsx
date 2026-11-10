"use client";

import React from "react";
import { AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";

export type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  variant?: ConfirmVariant;
}

const variantStyles: Record<
  ConfirmVariant,
  {
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    confirmButton: string;
  }
> = {
  danger: {
    badge: "bg-red-500/10 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    icon: AlertTriangle,
    title: "text-red-700 dark:text-red-400",
    confirmButton:
      "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 shadow-xs transition-colors",
  },
  warning: {
    badge:
      "bg-amber-500/10 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: AlertCircle,
    title: "text-amber-700 dark:text-amber-400",
    confirmButton:
      "bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-700 shadow-xs transition-colors",
  },
  info: {
    badge:
      "bg-blue-500/10 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    icon: Info,
    title: "text-blue-700 dark:text-blue-400",
    confirmButton:
      "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-xs transition-colors",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = en.common.cancel,
  confirmLabel = en.common.confirm,
  confirmLoadingLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  const currentVariant = variantStyles[variant];
  const IconComponent = currentVariant.icon;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-sm">
        <DialogHeader className="flex flex-col items-start text-left space-y-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                currentVariant.badge
              )}
            >
              <IconComponent className="h-4 w-4" />
            </div>
            <DialogTitle
              className={cn(
                "font-semibold text-sm text-left pr-6",
                currentVariant.title
              )}
            >
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground text-left leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 w-full sm:justify-end mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-8 text-xs rounded-lg px-3.5 cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "h-8 text-xs rounded-lg px-3.5 cursor-pointer font-medium",
              currentVariant.confirmButton
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {confirmLoadingLabel ||
                  (variant === "danger"
                    ? en.common.deletingFallback
                    : en.common.confirmingFallback)}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
