"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function ThemeWatcher() {
  const { theme, resolvedTheme } = useTheme();
  
  React.useEffect(() => {
    const root = document.documentElement;
    const currentTheme = resolvedTheme || theme || "light";
    
    // Force remove and add to ensure it works
    root.classList.remove("dark", "light");
    
    if (currentTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
    
    // Also update the attribute for next-themes
    root.setAttribute("data-theme", currentTheme);
  }, [theme, resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="expense-tracker-theme"
      forcedTheme={mounted ? undefined : "light"}
    >
      <ThemeWatcher />
      {children}
    </NextThemesProvider>
  );
}

