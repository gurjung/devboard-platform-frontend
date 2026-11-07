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
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative transition-all duration-300",
        isHighlighted &&
          "ring-4 ring-primary ring-offset-4 ring-offset-background border-primary rounded-2xl shadow-2xl scale-[1.01] z-30 bg-primary/5",
        className
      )}
    >
      {isHighlighted && spotlightMessage && (
        <div
          role="status"
          className={cn(
            "absolute z-40 whitespace-nowrap rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-xl animate-bounce flex items-center gap-2 pointer-events-none",
            badgePosition === "top" ? "-top-4 left-4" : "-bottom-4 left-4"
          )}
        >
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-white" />
          </span>
          <span>{spotlightMessage}</span>
        </div>
      )}
      {children}
    </div>
  );
}
