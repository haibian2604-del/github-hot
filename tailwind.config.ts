import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 铅字榜单（typographic ledger）语义色：画布 / 面 / 发丝线 / 墨色 / 单一强调。
        // 用法形如 bg-canvas dark:bg-canvas-dark、border-line dark:border-line-dark、
        // hover:bg-surface dark:hover:bg-surface-dark、text-accent dark:text-accent-dark。
        canvas: {
          DEFAULT: "#fafafa",
          dark: "#101012",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#18181b",
        },
        line: {
          DEFAULT: "#e4e4e7",
          dark: "#27272a",
        },
        ink: {
          DEFAULT: "#18181b",
          dark: "#e4e4e7",
        },
        accent: {
          DEFAULT: "#c2410c",
          dark: "#fb923c",
        },
      },
    },
  },
  plugins: [],
};
export default config;
