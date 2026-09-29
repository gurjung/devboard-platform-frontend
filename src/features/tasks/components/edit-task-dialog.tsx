"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Trash2,
  Calendar as CalendarIcon,
  User as UserIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
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
import { updateTaskSchema, type UpdateTaskFormValues } from "../schema";
import { useUpdateTask } from "../hooks/use-update-task";
import { useDeleteTask } from "../hooks/use-delete-task";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-members";
import {
  TASK_STATUSES,
  TASK_STATUS_CONFIG,
  TASK_PRIORITIES,
  TASK_PRIORITY_CONFIG,
} from "../constants";
import type { Task, TaskStatus, TaskPriority } from "../types";
import type { WorkspaceRole } from "@/features/workspace/types";
import { en } from "@/locales/en";

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  userRole?: WorkspaceRole;
  currentUserId?: string;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  workspaceId,
  projectId,
  userRole = "MEMBER",
  currentUserId,
}: EditTaskDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
  const updateTaskMutation = useUpdateTask(workspaceId, projectId);
  const deleteTaskMutation = useDeleteTask(workspaceId, projectId);

  const isCreator = task?.createdById === currentUserId;
  const isAssignee = task?.assigneeId === currentUserId;
  const isPrivileged = userRole === "OWNER" || userRole === "ADMIN";
  const canEdit = isCreator || isAssignee || isPrivileged;
  const canDelete = isCreator || isPrivileged;

  // Format due date for date input (YYYY-MM-DD)
  const initialDueDate = React.useMemo(() => {
    if (!task?.dueDate) return "";
    try {
      return new Date(task.dueDate).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }, [task?.dueDate]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    values: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "BACKLOG",
      priority: task?.priority || "MEDIUM",
      dueDate: initialDueDate,
      assigneeId: task?.assigneeId || "",
    },
  });

  React.useEffect(() => {
    if (open && task) {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: initialDueDate,
        assigneeId: task.assigneeId || "",
      });
      setShowDeleteConfirm(false);
    }
  }, [open, task, initialDueDate, reset]);

  if (!task) return null;

  const onSubmit = async (values: UpdateTaskFormValues) => {
    const payload = {
      title: values.title?.trim(),
      description: values.description ? values.description.trim() : null,
      status: values.status as TaskStatus,
      priority: values.priority as TaskPriority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      assigneeId:
        values.assigneeId && values.assigneeId !== "unassigned"
          ? values.assigneeId
          : null,
    };

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: payload,
      });
      onOpenChange(false);
    } catch {
      // Error handled in hook toast
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch {
      // Error handled in hook toast
    }
  };

  const formattedCreatedDate = task.createdAt
    ? format(new Date(task.createdAt), "MMM d, yyyy")
    : null;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={en.tasks.editTask}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Title Input */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-title" className="text-xs font-semibold">
            {en.tasks.form.titleLabel} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-task-title"
            placeholder={en.tasks.form.titlePlaceholder}
            className="text-sm rounded-xl"
            disabled={!canEdit || updateTaskMutation.isPending}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-description" className="text-xs font-semibold">
            {en.tasks.form.descriptionLabel}
          </Label>
          <textarea
            id="edit-task-description"
            rows={3}
            placeholder={en.tasks.form.descriptionPlaceholder}
            className="w-full rounded-xl border border-input bg-input/20 px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            disabled={!canEdit || updateTaskMutation.isPending}
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
                  disabled={!canEdit || updateTaskMutation.isPending}
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
                  disabled={!canEdit || updateTaskMutation.isPending}
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
            <Label htmlFor="edit-task-due-date" className="text-xs font-semibold">
              {en.tasks.form.dueDateLabel}
            </Label>
            <Input
              id="edit-task-due-date"
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              className="text-xs h-9 rounded-xl"
              disabled={!canEdit || updateTaskMutation.isPending}
              {...register("dueDate")}
            />
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
                  onValueChange={(val) =>
                    field.onChange(val === "unassigned" ? "" : val)
                  }
                  disabled={!canEdit || updateTaskMutation.isPending || isMembersLoading}
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

        {/* Task Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3" />
            <span>
              {formattedCreatedDate
                ? `Created on ${formattedCreatedDate}`
                : "Created recently"}
              {task.createdBy &&
                ` by ${task.createdBy.name || task.createdBy.email}`}
            </span>
          </div>
        </div>

        {/* Delete Confirmation Box */}
        {showDeleteConfirm ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
              <AlertTriangle className="size-4" />
              <span>{en.tasks.form.confirmDeleteTitle}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {en.tasks.form.confirmDeleteDescription}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteTaskMutation.isPending}
              >
                {en.common.cancel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 text-xs cursor-pointer gap-1.5"
                onClick={handleDelete}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Trash2 className="size-3" />
                )}
                <span>{en.tasks.form.deleteButton}</span>
              </Button>
            </div>
          </div>
        ) : null}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            {canDelete && !showDeleteConfirm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1.5"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
              >
                <Trash2 className="size-3.5" />
                <span>{en.tasks.form.deleteButton}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateTaskMutation.isPending}
              className="text-xs cursor-pointer"
            >
              {en.common.cancel}
            </Button>
            {canEdit && (
              <Button
                type="submit"
                size="sm"
                disabled={updateTaskMutation.isPending}
                className="text-xs cursor-pointer gap-1.5 font-semibold"
              >
                {updateTaskMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{en.tasks.form.savingButton}</span>
                  </>
                ) : (
                  <span>{en.tasks.form.saveButton}</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormDialog>
  );
}
