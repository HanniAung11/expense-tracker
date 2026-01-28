"use client";

import * as React from "react";

// Simplified ThemeProvider: dark mode removed, no next-themes dependency
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
