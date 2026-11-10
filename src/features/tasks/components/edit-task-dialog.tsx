"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Trash2,
  User as UserIcon,
  Clock,
  AlertTriangle,
  FolderKanban,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { updateTaskSchema, type UpdateTaskFormValues } from "../schema";
import { useUpdateTask } from "../hooks/use-update-task";
import { useDeleteTask } from "../hooks/use-delete-task";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-members";
import {
  TASK_STATUSES,
  TASK_STATUS_CONFIG,
  TASK_PRIORITIES,
  TASK_PRIORITY_CONFIG,
  getShortTaskKey,
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
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = React.useState<
    string | null
  >(null);
  const titleId = React.useId();
  const titleErrorId = React.useId();
  const statusLabelId = React.useId();
  const statusTriggerId = React.useId();
  const priorityLabelId = React.useId();
  const priorityTriggerId = React.useId();
  const dueDateId = React.useId();
  const assigneeLabelId = React.useId();
  const assigneeTriggerId = React.useId();
  const descriptionId = React.useId();
  const descriptionErrorId = React.useId();

  const { data: members = [], isLoading: isMembersLoading } =
    useWorkspaceMembers(workspaceId);
  const updateTaskMutation = useUpdateTask(workspaceId, projectId);
  const deleteTaskMutation = useDeleteTask(workspaceId, projectId);

  const isCreator = task?.createdById === currentUserId;
  const isAssignee = task?.assigneeId === currentUserId;
  const isPrivileged = userRole === "OWNER" || userRole === "ADMIN";
  const canEdit = isCreator || isAssignee || isPrivileged;
  const canDelete = isCreator || isPrivileged;
  const showDeleteConfirm = Boolean(task && deleteConfirmTaskId === task.id);

  const rawDueDate = task?.dueDate;
  const initialDueDate = React.useMemo(() => {
    if (!rawDueDate) return "";
    try {
      return new Date(rawDueDate).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }, [rawDueDate]);

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

  if (!task) return null;

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDeleteConfirmTaskId(null);
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: initialDueDate,
        assigneeId: task.assigneeId || "",
      });
    }
    onOpenChange(nextOpen);
  };

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
      setDeleteConfirmTaskId(null);
      onOpenChange(false);
    } catch {
      // Error handled in hook toast
    }
  };

  const formattedCreatedDate = task.createdAt
    ? format(new Date(task.createdAt), "MMM d, yyyy")
    : null;
  const issueKey = getShortTaskKey(task.id);

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] p-0 gap-0 flex flex-col bg-card border-l border-border shadow-2xl"
      >
        {/* Top Inspector Bar */}
        <SheetHeader className="border-b border-border/70 px-5 py-3.5 pr-12 shrink-0 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-muted border border-border/70 text-muted-foreground tabular-nums shrink-0">
              {issueKey}
            </span>
            {task.project?.name && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate">
                <FolderKanban className="size-3 shrink-0" />
                <span className="truncate">{task.project.name}</span>
              </span>
            )}
          </div>
          <SheetTitle className="sr-only">
            {en.tasks.editTask}: {task.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Inspect or update task properties, schedule, assignee, and description.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col min-h-0"
        >
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor={titleId} className="sr-only">
                {en.tasks.form.titleLabel}
              </Label>
              <Input
                id={titleId}
                placeholder={en.tasks.form.titlePlaceholder}
                className="h-10 text-base font-semibold tracking-tight rounded-lg border-input bg-background/60 px-3"
                disabled={!canEdit || updateTaskMutation.isPending}
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? titleErrorId : undefined}
                {...register("title")}
              />
              {errors.title && (
                <p
                  id={titleErrorId}
                  role="alert"
                  className="text-xs text-destructive-text"
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Linear Property Matrix */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => val && field.onChange(val)}
                      disabled={!canEdit || updateTaskMutation.isPending}
                    >
                      <SelectTrigger
                        id={statusTriggerId}
                        aria-labelledby={statusLabelId}
                        className="w-full h-8 rounded-md text-xs bg-card border-input"
                      >
                        <SelectValue />
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
                  )}
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
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => val && field.onChange(val)}
                      disabled={!canEdit || updateTaskMutation.isPending}
                    >
                      <SelectTrigger
                        id={priorityTriggerId}
                        aria-labelledby={priorityLabelId}
                        className="w-full h-8 rounded-md text-xs bg-card border-input"
                      >
                        <SelectValue />
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
                  )}
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
                <Input
                  id={dueDateId}
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="text-xs h-8 rounded-md bg-card border-input"
                  disabled={!canEdit || updateTaskMutation.isPending}
                  {...register("dueDate")}
                />
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
                  render={({ field }) => (
                    <Select
                      value={field.value || "unassigned"}
                      onValueChange={(val) =>
                        field.onChange(val === "unassigned" ? "" : val)
                      }
                      disabled={
                        !canEdit ||
                        updateTaskMutation.isPending ||
                        isMembersLoading
                      }
                    >
                      <SelectTrigger
                        id={assigneeTriggerId}
                        aria-labelledby={assigneeLabelId}
                        className="w-full h-8 rounded-md text-xs bg-card border-input"
                      >
                        <SelectValue
                          placeholder={en.tasks.form.assigneePlaceholder}
                        />
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
                              <span className="font-medium truncate">
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

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <Label
                htmlFor={descriptionId}
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {en.tasks.form.descriptionLabel}
              </Label>
              <Textarea
                id={descriptionId}
                rows={5}
                placeholder={en.tasks.form.descriptionPlaceholder}
                className="min-h-[120px] resize-y rounded-lg bg-background/60 text-xs leading-relaxed border-input"
                disabled={!canEdit || updateTaskMutation.isPending}
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

            {/* Task Metadata */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3 shrink-0" />
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
              <div
                role="region"
                aria-label={en.tasks.form.confirmDeleteTitle}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 space-y-2"
              >
                <div className="flex items-center gap-2 text-destructive-text text-xs font-semibold">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{en.tasks.form.confirmDeleteTitle}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {en.tasks.form.confirmDeleteDescription}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs rounded-md cursor-pointer"
                    onClick={() => setDeleteConfirmTaskId(null)}
                    disabled={deleteTaskMutation.isPending}
                  >
                    {en.common.cancel}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs rounded-md cursor-pointer gap-1.5"
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
          </div>

          {/* Sticky Inspector Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/70 bg-muted/20 shrink-0">
            <div>
              {canDelete && !showDeleteConfirm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs rounded-md text-destructive-text hover:bg-destructive/10 hover:text-destructive-text cursor-pointer gap-1.5"
                  onClick={() => setDeleteConfirmTaskId(task.id)}
                  disabled={
                    updateTaskMutation.isPending || deleteTaskMutation.isPending
                  }
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
                className="h-8 text-xs rounded-md cursor-pointer"
              >
                {en.common.cancel}
              </Button>
              {canEdit && (
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateTaskMutation.isPending}
                  className="h-8 text-xs rounded-md cursor-pointer gap-1.5 font-medium"
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
      </SheetContent>
    </Sheet>
  );
}
