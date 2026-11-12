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
        signal: "#f4ce46",
        // 深墨索引：暖白画布、橙色增长、黄色导视。
        // 用法形如 bg-canvas dark:bg-canvas-dark、border-line dark:border-line-dark、
        // hover:bg-surface dark:hover:bg-surface-dark、text-accent dark:text-accent-dark。
        canvas: {
          DEFAULT: "#f5f3ed",
          dark: "#191d1b",
        },
        surface: {
          DEFAULT: "#fbfaf6",
          dark: "#242925",
        },
        line: {
          DEFAULT: "#d9dcd3",
          dark: "#383f39",
        },
        ink: {
          DEFAULT: "#202421",
          dark: "#eeeee5",
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
