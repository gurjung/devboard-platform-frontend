"use client";

import * as React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Clock,
  User,
  Plus,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUSES, TASK_STATUS_CONFIG, TASK_PRIORITIES, TASK_PRIORITY_CONFIG } from "../constants";
import type { TaskFilters, TaskStatus, TaskPriority } from "../types";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-members";
import { en } from "@/locales/en";
import { cn } from "@/lib/utils";

interface TaskFilterBarProps {
  workspaceId: string;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onOpenCreateDialog: () => void;
  totalCount: number;
}

export function TaskFilterBar({
  workspaceId,
  filters,
  onFiltersChange,
  onOpenCreateDialog,
  totalCount,
}: TaskFilterBarProps) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.status && filters.status !== "ALL") ||
      (filters.priority && filters.priority !== "ALL") ||
      (filters.assigneeId && filters.assigneeId !== "ALL") ||
      filters.overdue
  );

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      status: "ALL",
      priority: "ALL",
      assigneeId: "ALL",
      overdue: false,
    });
  };

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Top row: Search input + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={en.tasks.searchPlaceholder}
            value={filters.search || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9 pr-8 text-xs h-9 rounded-xl bg-card border-border/70"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Task count badge + New Task button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <Badge
            variant="outline"
            className="text-[11px] font-medium px-2.5 py-1 text-muted-foreground bg-muted/30"
          >
            {totalCount} {totalCount === 1 ? "task" : "tasks"}
          </Badge>

          <Button
            size="sm"
            onClick={onOpenCreateDialog}
            className="h-9 px-3.5 text-xs font-semibold rounded-xl cursor-pointer gap-1.5 shadow-2xs"
          >
            <Plus className="size-3.5" />
            <span>{en.tasks.newTask}</span>
          </Button>
        </div>
      </div>

      {/* Second row: Dropdown filters + Overdue chip + Clear */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Status Filter */}
        <div className="w-auto min-w-36">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              onFiltersChange({
                ...filters,
                status: (val as TaskStatus | "ALL") || "ALL",
              })
            }
          >
            <SelectTrigger className="h-8 text-xs rounded-xl bg-card border-border/70 flex items-center gap-1.5 px-2.5">
              <span className="text-muted-foreground font-medium shrink-0">
                {en.tasks.tableHeaders.status}:
              </span>
              <SelectValue placeholder={en.tasks.filterByStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                <span className="text-xs">{en.tasks.allStatuses}</span>
              </SelectItem>
              {TASK_STATUSES.map((st) => {
                const cfg = TASK_STATUS_CONFIG[st];
                const Icon = cfg.icon;
                return (
                  <SelectItem key={st} value={st}>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon className={cn("size-3", cfg.color)} />
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="w-auto min-w-36">
          <Select
            value={filters.priority || "ALL"}
            onValueChange={(val) =>
              onFiltersChange({
                ...filters,
                priority: (val as TaskPriority | "ALL") || "ALL",
              })
            }
          >
            <SelectTrigger className="h-8 text-xs rounded-xl bg-card border-border/70 flex items-center gap-1.5 px-2.5">
              <span className="text-muted-foreground font-medium shrink-0">
                {en.tasks.tableHeaders.priority}:
              </span>
              <SelectValue placeholder={en.tasks.filterByPriority} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                <span className="text-xs">{en.tasks.allPriorities}</span>
              </SelectItem>
              {TASK_PRIORITIES.map((pr) => {
                const cfg = TASK_PRIORITY_CONFIG[pr];
                const Icon = cfg.icon;
                return (
                  <SelectItem key={pr} value={pr}>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon className={cn("size-3", cfg.color)} />
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Filter */}
        <div className="w-auto min-w-40">
          <Select
            value={filters.assigneeId || "ALL"}
            onValueChange={(val) =>
              onFiltersChange({
                ...filters,
                assigneeId: val || "ALL",
              })
            }
          >
            <SelectTrigger className="h-8 text-xs rounded-xl bg-card border-border/70 flex items-center gap-1.5 px-2.5">
              <span className="text-muted-foreground font-medium shrink-0">
                {en.tasks.tableHeaders.assignee}:
              </span>
              <SelectValue placeholder={en.tasks.filterByAssignee} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                <span className="text-xs">{en.tasks.allAssignees}</span>
              </SelectItem>
              <SelectItem value="UNASSIGNED">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3 opacity-50" />
                  <span>{en.tasks.unassigned}</span>
                </div>
              </SelectItem>
              {members.map((m) => (
                <SelectItem
                  key={m.user?.id || m.id}
                  value={m.user?.id || m.userId || m.id}
                >
                  <span className="text-xs truncate max-w-32">
                    {m.user?.name || m.user?.email}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overdue filter toggle chip */}
        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              ...filters,
              overdue: !filters.overdue,
            })
          }
          className={cn(
            "h-8 px-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors",
            filters.overdue
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
              : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
          )}
        >
          <AlertCircle className="size-3 text-rose-500" />
          <span>{en.tasks.overdueOnly}</span>
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
          >
            <RotateCcw className="size-3" />
            <span>{en.tasks.clearFilters}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
