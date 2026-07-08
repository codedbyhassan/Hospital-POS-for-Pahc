import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark";

export interface ColorPreset {
  name: string;
  label: string;
  primary: string;
  success: string;
  accent: string;
}

export const colorPresets: ColorPreset[] = [
  { name: "blue", label: "Ocean Blue", primary: "211 100% 50%", success: "142 71% 45%", accent: "211 100% 96%" },
  { name: "violet", label: "Royal Violet", primary: "262 83% 58%", success: "142 71% 45%", accent: "262 83% 96%" },
  { name: "rose", label: "Rose Pink", primary: "346 77% 50%", success: "142 71% 45%", accent: "346 77% 96%" },
  { name: "emerald", label: "Emerald", primary: "160 84% 39%", success: "142 71% 45%", accent: "160 84% 96%" },
  { name: "amber", label: "Warm Amber", primary: "38 92% 50%", success: "142 71% 45%", accent: "38 92% 96%" },
  { name: "teal", label: "Cool Teal", primary: "183 74% 44%", success: "142 71% 45%", accent: "183 74% 96%" },
];

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  preset: ColorPreset;
  setPreset: (preset: ColorPreset) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("pahc-theme-mode");
    return (saved === "dark" ? "dark" : "light") as ThemeMode;
  });

  const [preset, setPresetState] = useState<ColorPreset>(() => {
    const saved = localStorage.getItem("pahc-color-preset");
    return colorPresets.find(p => p.name === saved) || colorPresets[0];
  });

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  }, []);

  const setPreset = useCallback((p: ColorPreset) => {
    setPresetState(p);
    localStorage.setItem("pahc-color-preset", p.name);
  }, []);

  useEffect(() => {
    localStorage.setItem("pahc-theme-mode", mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", preset.primary);
    root.style.setProperty("--ring", preset.primary);
    root.style.setProperty("--sidebar-primary", preset.primary);
    root.style.setProperty("--sidebar-ring", preset.primary);
    root.style.setProperty("--sidebar-accent", preset.accent);
  }, [preset]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, preset, setPreset }}>
      {children}
    </ThemeContext.Provider>
  );
};
