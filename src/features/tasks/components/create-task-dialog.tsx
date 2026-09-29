"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Calendar as CalendarIcon, User as UserIcon } from "lucide-react";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { createTaskSchema, type CreateTaskFormValues } from "../schema";
import { useCreateTask } from "../hooks/use-create-task";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-members";
import { TASK_STATUSES, TASK_STATUS_CONFIG, TASK_PRIORITIES, TASK_PRIORITY_CONFIG } from "../constants";
import type { TaskStatus, TaskPriority } from "../types";
import { en } from "@/locales/en";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  defaultStatus?: TaskStatus;
  defaultDueDate?: string;
  trigger?: React.ReactNode;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  defaultStatus = "BACKLOG",
  defaultDueDate,
  trigger,
}: CreateTaskDialogProps) {
  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
  const createTaskMutation = useCreateTask(workspaceId, projectId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus,
      priority: "MEDIUM",
      dueDate: defaultDueDate || "",
      assigneeId: "",
    },
  });

  // When defaultStatus or defaultDueDate changes when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        title: "",
        description: "",
        status: defaultStatus || "BACKLOG",
        priority: "MEDIUM",
        dueDate: defaultDueDate || "",
        assigneeId: "",
      });
    }
  }, [open, defaultStatus, defaultDueDate, reset]);

  const onSubmit = async (values: CreateTaskFormValues) => {
    const payload = {
      title: values.title.trim(),
      description: values.description ? values.description.trim() : null,
      status: values.status as TaskStatus,
      priority: values.priority as TaskPriority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      assigneeId: values.assigneeId && values.assigneeId !== "unassigned" ? values.assigneeId : null,
    };

    try {
      await createTaskMutation.mutateAsync(payload);
      reset();
      onOpenChange(false);
    } catch {
      // Error handled in hook toast
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={en.tasks.createTask}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Title Input */}
        <div className="space-y-1.5">
          <Label htmlFor="task-title" className="text-xs font-semibold">
            {en.tasks.form.titleLabel} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="task-title"
            placeholder={en.tasks.form.titlePlaceholder}
            className="text-sm rounded-xl"
            disabled={createTaskMutation.isPending}
            autoFocus
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <Label htmlFor="task-description" className="text-xs font-semibold">
            {en.tasks.form.descriptionLabel}
          </Label>
          <textarea
            id="task-description"
            rows={3}
            placeholder={en.tasks.form.descriptionPlaceholder}
            className="w-full rounded-xl border border-input bg-input/20 px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            disabled={createTaskMutation.isPending}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {en.tasks.form.statusLabel}
            </Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => val && field.onChange(val)}
                  disabled={createTaskMutation.isPending}
                >
                  <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((st) => {
                      const cfg = TASK_STATUS_CONFIG[st];
                      const Icon = cfg.icon;
                      return (
                        <SelectItem key={st} value={st}>
                          <div className="flex items-center gap-2 text-xs">
                            <Icon className={`size-3.5 ${cfg.color}`} />
                            <span>{cfg.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {en.tasks.form.priorityLabel}
            </Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => val && field.onChange(val)}
                  disabled={createTaskMutation.isPending}
                >
                  <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((pr) => {
                      const cfg = TASK_PRIORITY_CONFIG[pr];
                      const Icon = cfg.icon;
                      return (
                        <SelectItem key={pr} value={pr}>
                          <div className="flex items-center gap-2 text-xs">
                            <Icon className={`size-3.5 ${cfg.color}`} />
                            <span>{cfg.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Due Date & Assignee Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="task-due-date" className="text-xs font-semibold">
              {en.tasks.form.dueDateLabel}
            </Label>
            <div className="relative">
              <Input
                id="task-due-date"
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                className="text-xs h-9 rounded-xl"
                disabled={createTaskMutation.isPending}
                {...register("dueDate")}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {en.tasks.form.assigneeLabel}
            </Label>
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => (
                <Select
                  value={field.value || "unassigned"}
                  onValueChange={(val) => field.onChange(val === "unassigned" ? "" : val)}
                  disabled={createTaskMutation.isPending || isMembersLoading}
                >
                  <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                    <SelectValue placeholder={en.tasks.form.assigneePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserIcon className="size-3.5 opacity-50" />
                        <span>{en.tasks.unassigned}</span>
                      </div>
                    </SelectItem>
                    {members.map((member) => (
                      <SelectItem
                        key={member.user?.id || member.id}
                        value={member.user?.id || member.userId || member.id}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">
                            {member.user?.name || member.user?.email}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            ({member.role})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={createTaskMutation.isPending}
            className="text-xs cursor-pointer"
          >
            {en.common.cancel}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={createTaskMutation.isPending}
            className="text-xs cursor-pointer gap-1.5 font-semibold"
          >
            {createTaskMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>{en.tasks.form.creatingButton}</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>{en.tasks.form.createButton}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
