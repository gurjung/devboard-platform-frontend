"use client";

import * as React from "react";
import {
  Search,
  X,
  User,
  Plus,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const quickMembers = members.slice(0, 5);
  const currentAssigneeFilter = filters.assigneeId || "ALL";

  return (
    <div className="flex flex-col gap-2.5 py-0.5">
      {/* Top row: Search input + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            aria-label="Search tasks"
            placeholder={en.tasks.searchPlaceholder}
            value={filters.search || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-8 pr-8 text-xs h-8 rounded-lg bg-card border-input"
          />
          {filters.search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onFiltersChange({ ...filters, search: "" })}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring cursor-pointer"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Right side: Task count badge + New Task button */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Badge
            variant="outline"
            className="h-7 text-[11px] font-medium px-2.5 rounded-md text-muted-foreground bg-muted/30 border-border/70 tabular-nums"
          >
            {totalCount} {totalCount === 1 ? "task" : "tasks"}
          </Badge>

          <Button
            size="sm"
            onClick={onOpenCreateDialog}
            className="h-8 px-3 text-xs font-medium rounded-lg cursor-pointer gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>{en.tasks.newTask}</span>
          </Button>
        </div>
      </div>

      {/* Second row: Dropdown filters + Quick collaborator strip + Overdue chip + Clear */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Status Filter */}
        <div className="w-auto min-w-34">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              onFiltersChange({
                ...filters,
                status: (val as TaskStatus | "ALL") || "ALL",
              })
            }
          >
            <SelectTrigger
              aria-label={en.tasks.filterByStatus}
              className="h-8 text-xs rounded-lg bg-card border-input flex items-center gap-1.5 px-2.5"
            >
              <span className="text-muted-foreground font-medium shrink-0">
                {en.tasks.tableHeaders.status}:
              </span>
              <SelectValue placeholder={en.tasks.filterByStatus} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">
                <span className="text-xs">{en.tasks.allStatuses}</span>
              </SelectItem>
              {TASK_STATUSES.map((st) => {
                const cfg = TASK_STATUS_CONFIG[st];
                const Icon = cfg.icon;
                return (
                  <SelectItem key={st} value={st}>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon className={cn("size-3.5", cfg.color)} />
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="w-auto min-w-34">
          <Select
            value={filters.priority || "ALL"}
            onValueChange={(val) =>
              onFiltersChange({
                ...filters,
                priority: (val as TaskPriority | "ALL") || "ALL",
              })
            }
          >
            <SelectTrigger
              aria-label={en.tasks.filterByPriority}
              className="h-8 text-xs rounded-lg bg-card border-input flex items-center gap-1.5 px-2.5"
            >
              <span className="text-muted-foreground font-medium shrink-0">
                {en.tasks.tableHeaders.priority}:
              </span>
              <SelectValue placeholder={en.tasks.filterByPriority} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">
                <span className="text-xs">{en.tasks.allPriorities}</span>
              </SelectItem>
              {TASK_PRIORITIES.map((pr) => {
                const cfg = TASK_PRIORITY_CONFIG[pr];
                const Icon = cfg.icon;
                return (
                  <SelectItem key={pr} value={pr}>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon className={cn("size-3.5", cfg.color)} />
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Filter */}
        <div className="w-auto min-w-38">
          <Select
            value={currentAssigneeFilter}
            onValueChange={(val) =>
              onFiltersChange({
                ...filters,
                assigneeId: val || "ALL",
              })
            }
          >
            <SelectTrigger
              aria-label={en.tasks.filterByAssignee}
              className="h-8 text-xs rounded-lg bg-card border-input flex items-center gap-1.5 px-2.5"
            >
              <span className="text-muted-foreground font-medium shrink-0">
                {en.tasks.tableHeaders.assignee}:
              </span>
              <SelectValue placeholder={en.tasks.filterByAssignee} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">
                <span className="text-xs">{en.tasks.allAssignees}</span>
              </SelectItem>
              <SelectItem value="UNASSIGNED">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3 text-muted-foreground" aria-hidden="true" />
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
          aria-pressed={Boolean(filters.overdue)}
          onClick={() =>
            onFiltersChange({
              ...filters,
              overdue: !filters.overdue,
            })
          }
          className={cn(
            "h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap",
            filters.overdue
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35"
              : "bg-card border-input text-muted-foreground hover:text-foreground"
          )}
        >
          <AlertCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
          <span>{en.tasks.overdueOnly}</span>
        </button>

        {/* Jira-inspired Quick Collaborator Avatar Strip */}
        {quickMembers.length > 0 && (
          <div
            role="group"
            aria-label="Quick filter by collaborator"
            className="hidden md:inline-flex items-center gap-1 pl-2 ml-0.5 border-l border-border/50"
          >
            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  assigneeId: "ALL",
                })
              }
              aria-pressed={currentAssigneeFilter === "ALL"}
              className={cn(
                "h-7 px-2 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                currentAssigneeFilter === "ALL"
                  ? "bg-accent text-foreground border-border"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              All
            </button>

            <div className="flex items-center gap-1">
              {quickMembers.map((m) => {
                const memberUserId = m.user?.id || m.userId || m.id;
                const displayName = m.user?.name || m.user?.email || "Member";
                const initials = displayName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isSelected = currentAssigneeFilter === memberUserId;

                return (
                  <button
                    key={memberUserId}
                    type="button"
                    aria-label={`Filter tasks assigned to ${displayName}`}
                    aria-pressed={isSelected}
                    title={`${displayName}${isSelected ? " (filtered)" : ""}`}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        assigneeId: isSelected ? "ALL" : memberUserId,
                      })
                    }
                    className={cn(
                      "rounded-full transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-ring",
                      isSelected &&
                        "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105"
                    )}
                  >
                    <Avatar size="sm" className="size-6.5 text-[10px]">
                      {m.user?.image && (
                        <AvatarImage src={m.user.image} alt={displayName} />
                      )}
                      <AvatarFallback className="font-semibold bg-primary/15 text-brand-text">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  assigneeId:
                    currentAssigneeFilter === "UNASSIGNED"
                      ? "ALL"
                      : "UNASSIGNED",
                })
              }
              aria-pressed={currentAssigneeFilter === "UNASSIGNED"}
              className={cn(
                "h-7 px-2 rounded-md text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap",
                currentAssigneeFilter === "UNASSIGNED"
                  ? "bg-accent text-foreground border-border"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {en.tasks.unassigned}
            </button>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1 rounded-lg"
          >
            <RotateCcw className="size-3" />
            <span>{en.tasks.clearFilters}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
