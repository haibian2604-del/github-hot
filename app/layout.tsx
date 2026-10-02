import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Hot · Trending 浏览页",
  description: "浏览 GitHub 每日/每周/每月热门仓库",
};

// 防闪烁（FOUC）：首帧渲染前同步主题——localStorage 手动选择优先，其次系统偏好；
// 同时设置 style.colorScheme 让原生控件/滚动条跟随。try/catch 兜底隐私模式。
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased dark:bg-canvas-dark dark:text-ink-dark">
        <SiteHeader />
        {children}
        <footer className="border-t border-line bg-white dark:border-line-dark dark:bg-surface-dark">
          <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            数据来自公共 API，仅供学习浏览 ·{" "}
            <Link href="/" className="hover:underline">
              回到顶部
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
