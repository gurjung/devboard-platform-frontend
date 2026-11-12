"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, User as UserIcon } from "lucide-react";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const titleId = React.useId();
  const titleErrorId = React.useId();
  const descriptionId = React.useId();
  const descriptionErrorId = React.useId();
  const statusLabelId = React.useId();
  const statusTriggerId = React.useId();
  const priorityLabelId = React.useId();
  const priorityTriggerId = React.useId();
  const dueDateId = React.useId();
  const assigneeLabelId = React.useId();
  const assigneeTriggerId = React.useId();

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

  const memberNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      const id = m.user?.id || m.userId || m.id;
      const label = m.user?.name || m.user?.email || "Member";
      if (id) map.set(id, label);
    }
    return map;
  }, [members]);

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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-1">
        {/* Title Input */}
        <div className="space-y-1.5">
          <Label htmlFor={titleId} className="text-xs font-medium text-foreground">
            {en.tasks.form.titleLabel}{" "}
            <span aria-hidden="true" className="text-destructive-text">
              *
            </span>
          </Label>
          <Input
            id={titleId}
            placeholder={en.tasks.form.titlePlaceholder}
            className="h-9 text-sm rounded-lg bg-card border-input"
            disabled={createTaskMutation.isPending}
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? titleErrorId : undefined}
            autoFocus
            {...register("title")}
          />
          {errors.title && (
            <p id={titleErrorId} role="alert" className="text-xs text-destructive-text">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <Label htmlFor={descriptionId} className="text-xs font-medium text-foreground">
            {en.tasks.form.descriptionLabel}
          </Label>
          <Textarea
            id={descriptionId}
            rows={3}
            placeholder={en.tasks.form.descriptionPlaceholder}
            className="min-h-[84px] text-xs rounded-lg bg-card border-input resize-y"
            disabled={createTaskMutation.isPending}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? descriptionErrorId : undefined}
            {...register("description")}
          />
          {errors.description && (
            <p
              id={descriptionErrorId}
              role="alert"
              className="text-xs text-destructive-text"
            >
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Properties Grid */}
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1.5">
            <Label
              id={statusLabelId}
              htmlFor={statusTriggerId}
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {en.tasks.form.statusLabel}
            </Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => {
                const selectedStatus =
                  TASK_STATUS_CONFIG[(field.value as TaskStatus) || "BACKLOG"] ||
                  TASK_STATUS_CONFIG.BACKLOG;
                const SelectedStatusIcon = selectedStatus.icon;
                return (
                  <Select
                    value={field.value}
                    onValueChange={(val) => val && field.onChange(val)}
                    disabled={createTaskMutation.isPending}
                  >
                    <SelectTrigger
                      id={statusTriggerId}
                      aria-labelledby={statusLabelId}
                      className="w-full h-8 rounded-md text-xs bg-card border-input"
                    >
                      <SelectValue>
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground truncate">
                          <SelectedStatusIcon
                            className={`size-3.5 shrink-0 ${selectedStatus.color}`}
                          />
                          <span className="truncate">{selectedStatus.label}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                );
              }}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label
              id={priorityLabelId}
              htmlFor={priorityTriggerId}
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {en.tasks.form.priorityLabel}
            </Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => {
                const selectedPriority =
                  TASK_PRIORITY_CONFIG[(field.value as TaskPriority) || "MEDIUM"] ||
                  TASK_PRIORITY_CONFIG.MEDIUM;
                const SelectedPriorityIcon = selectedPriority.icon;
                return (
                  <Select
                    value={field.value}
                    onValueChange={(val) => val && field.onChange(val)}
                    disabled={createTaskMutation.isPending}
                  >
                    <SelectTrigger
                      id={priorityTriggerId}
                      aria-labelledby={priorityLabelId}
                      className="w-full h-8 rounded-md text-xs bg-card border-input"
                    >
                      <SelectValue>
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground truncate">
                          <SelectedPriorityIcon
                            className={`size-3.5 shrink-0 ${selectedPriority.color}`}
                          />
                          <span className="truncate">{selectedPriority.label}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                );
              }}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor={dueDateId}
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {en.tasks.form.dueDateLabel}
            </Label>
            <div className="relative">
              <Input
                id={dueDateId}
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                className="text-xs h-8 rounded-md bg-card border-input"
                disabled={createTaskMutation.isPending}
                {...register("dueDate")}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label
              id={assigneeLabelId}
              htmlFor={assigneeTriggerId}
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {en.tasks.form.assigneeLabel}
            </Label>
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => {
                const selectedAssigneeName = field.value
                  ? memberNameById.get(field.value)
                  : null;
                return (
                  <Select
                    value={field.value || "unassigned"}
                    onValueChange={(val) =>
                      field.onChange(val === "unassigned" ? "" : val)
                    }
                    disabled={createTaskMutation.isPending || isMembersLoading}
                  >
                    <SelectTrigger
                      id={assigneeTriggerId}
                      aria-labelledby={assigneeLabelId}
                      className="w-full h-8 rounded-md text-xs bg-card border-input"
                    >
                      <SelectValue placeholder={en.tasks.form.assigneePlaceholder}>
                        {selectedAssigneeName ? (
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground truncate">
                            <UserIcon className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{selectedAssigneeName}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <UserIcon className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{en.tasks.unassigned}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <UserIcon className="size-3.5 text-muted-foreground" />
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
                );
              }}
            />
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={createTaskMutation.isPending}
            className="h-8 text-xs rounded-lg cursor-pointer"
          >
            {en.common.cancel}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={createTaskMutation.isPending}
            className="h-8 text-xs rounded-lg cursor-pointer gap-1.5 font-medium"
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
