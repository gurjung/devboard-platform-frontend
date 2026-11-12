"use client";

import React, { useEffect, useRef } from "react";
import { useSimulation } from "../context/simulation-context";
import { cn } from "@/lib/utils";

interface TourSpotlightWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  badgePosition?: "top" | "bottom";
}

export function TourSpotlightWrapper({
  id,
  children,
  className,
  badgePosition = "top",
}: TourSpotlightWrapperProps) {
  const { isDemo, highlightedElementId, spotlightMessage } = useSimulation();
  const isHighlighted = isDemo && highlightedElementId === id;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && ref.current) {
      const timer = setTimeout(() => {
        const prefersReduced =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        ref.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative transition-all duration-200",
        isHighlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl shadow-lg z-30 bg-primary/5",
        className
      )}
    >
      {isHighlighted && spotlightMessage && (
        <div
          role="status"
          className={cn(
            "absolute z-40 whitespace-nowrap rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow-md flex items-center gap-1.5 pointer-events-none",
            badgePosition === "top" ? "-top-3.5 left-3" : "-bottom-3.5 left-3"
          )}
        >
          <span className="inline-flex rounded-full size-1.5 bg-primary-foreground" aria-hidden="true" />
          <span>{spotlightMessage}</span>
        </div>
      )}
      {children}
    </div>
  );
}
