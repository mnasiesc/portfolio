"use client";

// ─── ThemeToggle — Client Component ──────────────────────────────────────────
// Handles switching between light mode (Warm Newsprint Parchment) and
// dark mode (Warm Ink Charcoal).
//
// Why "use client"?
//   Needs to access `window.localStorage` and manipulate `document.documentElement.classList`.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check local storage or document class
    const hasDarkClass = document.documentElement.classList.contains("dark");
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || (!storedTheme && hasDarkClass)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded border border-stone-300 dark:border-stone-800 opacity-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="inline-flex items-center justify-center p-2 rounded-md border border-stone-300/80 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono text-xs"
      aria-label="Toggle tactile paper dark mode"
      title={isDark ? "Switch to Light Parchment" : "Switch to Dark Ink"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-stone-700" />
      )}
    </button>
  );
}
