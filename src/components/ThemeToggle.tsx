"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check local storage or preference
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 border-2 border-foreground bg-background text-foreground flex items-center justify-center shadow-[4px_4px_0_0_currentColor] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_currentColor] transition-all focus:outline-none focus:ring-4 focus:ring-foreground/20 active:translate-y-1 active:translate-x-1 active:shadow-none pointer-events-auto`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 fill-current" />
      ) : (
        <Moon className="w-5 h-5 fill-current" />
      )}
    </button>
  );
}
