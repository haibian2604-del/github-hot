"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "theme";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
  } catch {
    // 隐私模式下 localStorage 可能不可用，回落系统偏好
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // 写入失败（如隐私模式）不影响本次会话的切换
  }
}

// 挂载前渲染中性占位（月亮 + 切换到暗色模式），与 SSR 输出一致，避免水合不匹配；
// useEffect 挂载后读真实状态（localStorage 或系统偏好）。
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const isDark = mounted && theme === "dark";
  const label = isDark ? "切换到亮色模式" : "切换到暗色模式";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-zinc-500 hover:text-ink hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-ink-dark dark:hover:bg-surface-dark transition-colors duration-150 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.95 16.95l1.41 1.41M18.36 5.64l-1.41 1.42M7.05 16.95l-1.42 1.41"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
          />
        </svg>
      )}
    </button>
  );
}
