"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";

export const themeLocalStorageKey = "payload-theme";
export const defaultTheme: Theme = "light";
export type Theme = "dark" | "light";

export interface ThemeContextType {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const isValidTheme = (value: string | null): value is Theme => value === "dark" || value === "light";

const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(themeLocalStorageKey);
    return isValidTheme(stored) ? stored : defaultTheme;
  } catch {
    return defaultTheme;
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const setTheme = useCallback((next: Theme) => {
    try { localStorage.setItem(themeLocalStorageKey, next); } catch {}
    document.documentElement.setAttribute("data-theme", next);
    setThemeState(next);
  }, []);

  useEffect(() => {
    const initial = getStoredTheme();
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
    const onStorage = (event: StorageEvent) => {
      if (event.key === themeLocalStorageKey) {
        const next = getStoredTheme();
        setThemeState(next);
        document.documentElement.setAttribute("data-theme", next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
