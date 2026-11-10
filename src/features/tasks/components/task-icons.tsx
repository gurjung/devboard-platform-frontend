import React from "react";

interface IconProps {
  className?: string;
}

// ─── Linear-inspired SVG Status Glyphs ──────────────────────────────
export function BacklogIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="2.2 2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TodoIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function InProgressIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 2.5A5.5 5.5 0 0 1 8 13.5V2.5Z" fill="currentColor" />
    </svg>
  );
}

export function InReviewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="8" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function DoneIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" fill="currentColor" />
      <path
        d="M5.5 8.1L7.2 9.8L10.7 6.3"
        stroke="white"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Linear-inspired SVG Priority Signal Bars ───────────────────────
export function PriorityLowIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="9.5" width="2.4" height="4" rx="0.8" fill="currentColor" />
      <rect
        x="6.8"
        y="6.5"
        width="2.4"
        height="7"
        rx="0.8"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="11.1"
        y="3.5"
        width="2.4"
        height="10"
        rx="0.8"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

export function PriorityMediumIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="9.5" width="2.4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6.8" y="6.5" width="2.4" height="7" rx="0.8" fill="currentColor" />
      <rect
        x="11.1"
        y="3.5"
        width="2.4"
        height="10"
        rx="0.8"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

export function PriorityHighIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="9.5" width="2.4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6.8" y="6.5" width="2.4" height="7" rx="0.8" fill="currentColor" />
      <rect x="11.1" y="3.5" width="2.4" height="10" rx="0.8" fill="currentColor" />
    </svg>
  );
}

export function PriorityUrgentIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="12" rx="3" fill="currentColor" />
      <path
        d="M8 4.8V8.6"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.1" r="0.95" fill="white" />
    </svg>
  );
}

