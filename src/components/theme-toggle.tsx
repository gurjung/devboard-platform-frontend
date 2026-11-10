"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="size-8 flex items-center justify-center cursor-pointer rounded-md outline-none text-muted-foreground hover:text-foreground hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        aria-label="Toggle theme"
      >
        {!mounted ? (
          <div className="size-4" />
        ) : resolvedTheme === "dark" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="p-1 rounded-xl shadow-md border border-border min-w-[136px]"
      >
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-xs flex items-center justify-between w-full",
            mounted &&
              theme === "light" &&
              "font-semibold bg-accent/40 text-foreground"
          )}
          onClick={() => setTheme("light")}
        >
          <span>Light</span>
          {mounted && theme === "light" && (
            <Check className="size-3.5 text-brand-text ml-2" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-xs flex items-center justify-between w-full",
            mounted &&
              theme === "dark" &&
              "font-semibold bg-accent/40 text-foreground"
          )}
          onClick={() => setTheme("dark")}
        >
          <span>Dark</span>
          {mounted && theme === "dark" && (
            <Check className="size-3.5 text-brand-text ml-2" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-xs flex items-center justify-between w-full",
            mounted &&
              theme === "system" &&
              "font-semibold bg-accent/40 text-foreground"
          )}
          onClick={() => setTheme("system")}
        >
          <span>System</span>
          {mounted && theme === "system" && (
            <Check className="size-3.5 text-brand-text ml-2" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
