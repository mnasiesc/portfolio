"use client";

// ─── ThemeToggle — Client Component ──────────────────────────────────────────
// Handles switching between light mode (Warm Newsprint Parchment) and
// dark mode (Warm Ink Charcoal).
//
// Why "use client"?
//   Needs to access `window.localStorage` and manipulate `document.documentElement.classList`.
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  labels: {
    themeToggleLabel: string;
    lightThemeTitle: string;
    darkThemeTitle: string;
  };
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const isDark = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("portfolio-theme-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("portfolio-theme-change", onChange);
      };
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    window.dispatchEvent(new Event("portfolio-theme-change"));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="station-theme-toggle"
      aria-label={labels.themeToggleLabel}
      title={isDark ? labels.lightThemeTitle : labels.darkThemeTitle}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
