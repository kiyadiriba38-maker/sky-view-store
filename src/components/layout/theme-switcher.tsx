"use client";

import { FiMoon, FiSun } from "react-icons/fi";

import { useTheme } from "@/lib/providers/theme";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-sm transition hover:border-cyan-200/50">
      {dark ? <FiSun className="size-4 text-amber-300" /> : <FiMoon className="size-4 text-cyan-200" />}
    </button>
  );
}
