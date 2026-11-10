import * as React from "react";
import { cn } from "@/lib/utils";

interface DevBoardLogoProps {
  showWordmark?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function DevBoardLogo({
  showWordmark = true,
  size = "default",
  className,
}: DevBoardLogoProps) {
  const iconSize = size === "sm" ? "size-6" : "size-7";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-foreground select-none",
        className
      )}
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(iconSize, "shrink-0")}
        aria-hidden="true"
      >
        <rect
          width="28"
          height="28"
          rx="7"
          className="fill-primary"
        />
        <path
          d="M8.5 9.5L13.5 14L8.5 18.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 18.5H19.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className={cn(textSize, "leading-none")}>
          Dev<span className="text-brand-text">Board</span>
        </span>
      )}
    </span>
  );
}

