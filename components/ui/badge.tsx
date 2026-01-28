import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:ring-offset-2 focus:ring-offset-slate-950",
        {
          "border-transparent bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500 text-white shadow-sm shadow-emerald-500/40":
            variant === "default",
          "border-transparent bg-emerald-500/10 text-emerald-800 backdrop-blur-md dark:bg-emerald-400/10 dark:text-emerald-100":
            variant === "secondary",
          "border-emerald-500/40 text-emerald-500 dark:text-emerald-300": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

