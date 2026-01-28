import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50",
          {
            // Vibrant primary gradient button
            "bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/45 hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0":
              variant === "default",
            // Glassy outline button
            "border border-emerald-400/40 bg-emerald-500/5 text-emerald-700 shadow-sm shadow-emerald-500/20 backdrop-blur-md hover:bg-emerald-500/15 hover:text-emerald-900":
              variant === "outline",
            // Subtle icon / ghost button
            "bg-transparent text-slate-600 hover:bg-slate-900/5 hover:text-slate-900":
              variant === "ghost",
            // Destructive
            "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/40 hover:shadow-rose-500/60 hover:-translate-y-[1px]":
              variant === "destructive",
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

