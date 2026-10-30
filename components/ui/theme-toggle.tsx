import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;

  return (
    <button
      id="theme-toggle-button"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 p-2 text-xs font-medium shadow-xs transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer select-none ${
        showLabel ? "px-3.5 py-2 w-full justify-start" : "size-9"
      } ${className}`}
    >
      <div className="relative size-4 flex items-center justify-center shrink-0">
        {/* Sun Icon (shown in light mode) */}
        <Sun
          className={`size-4 text-amber-500 transition-all duration-500 transform ${
            isDark ? "-rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        {/* Moon Icon (shown in dark mode) */}
        <Moon
          className={`size-4 text-indigo-400 transition-all duration-500 transform ${
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0 absolute"
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
          {isDark ? "Dark theme active" : "Light theme active"}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
