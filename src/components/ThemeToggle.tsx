"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { getServerThemeSnapshot, getThemeSnapshot, initializeTheme, subscribeToTheme, toggleTheme } from "@/lib/theme";
import { Icon } from "./Icon";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  // Also restores the attribute after React's development-only document remount.
  useLayoutEffect(initializeTheme, []);

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Тёмная тема" aria-pressed={theme === "dark"} title={theme === "dark" ? "Включить дневную тему" : "Включить ночную тему"}>
      <span className="theme-toggle-option theme-toggle-day"><Icon name="sun" size={17} /></span>
      <span className="theme-toggle-option theme-toggle-night"><Icon name="moon" size={17} /></span>
    </button>
  );
}
