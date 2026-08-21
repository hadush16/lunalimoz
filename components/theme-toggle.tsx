"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 border border-neutral-800 bg-neutral-900/50 ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex items-center justify-center p-2 rounded-none border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-neutral-800 dark:text-gold hover:border-gold transition-all duration-300 group shadow-sm ${className}`}
      title={isDark ? "Switch to Light Luxury Theme" : "Switch to Dark Executive Theme"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-gold group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-800 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
