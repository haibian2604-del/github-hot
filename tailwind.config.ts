import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GitHub 观感基础色（surface brief 钉定）：
        // 画布（暗 DEFAULT / 亮 light）、暗色卡片、暗色发丝线。
        // 用法形如 bg-ghcanvas-light dark:bg-ghcanvas、dark:border-ghline。
        ghcanvas: {
          DEFAULT: "#0d1117",
          light: "#f8f9fa",
        },
        ghcard: {
          DEFAULT: "#161b22",
        },
        ghline: {
          DEFAULT: "#30363d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
