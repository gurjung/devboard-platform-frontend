import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantIconStyles: Record<
  NonNullable<StatCardProps["variant"]>,
  string
> = {
  default: "text-muted-foreground bg-muted/60",
  info: "text-blue-700 dark:text-blue-300 bg-blue-500/10",
  success: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10",
  warning: "text-amber-700 dark:text-amber-300 bg-amber-500/10",
  danger: "text-rose-700 dark:text-rose-300 bg-rose-500/10",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  description,
  variant = "default",
}: StatCardProps) {
  const isClickable = Boolean(href);

  const cardContent = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-md",
              variantIconStyles[variant]
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          </div>
          {isClickable && (
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 text-muted-foreground transition-transform duration-150 group-hover:text-brand-text group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
          {value}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground truncate">
            {description}
          </span>
        )}
      </div>
    </>
  );

  if (isClickable && href) {
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col justify-between rounded-xl border border-input bg-card p-4 transition-colors duration-150",
          "hover:border-border hover:bg-muted/30",
          "focus-visible:outline-2 focus-visible:outline-ring cursor-pointer"
        )}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 cursor-default"
      )}
    >
      {cardContent}
    </div>
  );
}
