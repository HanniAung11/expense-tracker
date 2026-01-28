"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 dark:bg-slate-950/80"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl border border-emerald-500/30 bg-white/90 shadow-2xl shadow-emerald-500/30 backdrop-blur-2xl dark:border-emerald-500/40 dark:bg-slate-900/90",
          {
            "max-w-sm": size === "sm",
            "max-w-md": size === "md",
            "max-w-lg": size === "lg",
            "max-w-xl": size === "xl",
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-fuchsia-500/10 p-4 dark:border-emerald-500/40">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="p-4 text-slate-900 dark:text-slate-100">{children}</div>
      </div>
    </div>
  );
}

