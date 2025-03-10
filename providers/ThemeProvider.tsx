"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  attribute = "class",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Tema değiştirme fonksiyonu
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = newTheme === "system" ? systemTheme : newTheme;

    // HTML elementine tema sınıfını ekle/çıkar
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    return resolvedTheme;
  };

  // Tema değiştirme işleyicisi
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // İlk yükleme
  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan tema tercihini al
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = storedTheme || defaultTheme;
    
    setTheme(initialTheme);
    setMounted(true);
  }, [defaultTheme]);

  // Tema değişikliklerini uygula
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  // Sistem teması değişikliklerini dinle
  useEffect(() => {
    if (!mounted || !enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, mounted]);

  const value = {
    theme,
    setTheme: handleThemeChange,
  };

  // Sayfa yüklenmeden önce render etme (hydration hatalarını önlemek için)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}; 