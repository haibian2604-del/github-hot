import type { Metadata } from "next";
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
      <body id="top" className="min-h-screen bg-canvas text-ink antialiased dark:bg-canvas-dark dark:text-ink-dark">
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="page-width flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <a href="#top" className="source-link" aria-label="回到顶部">GitHub Hot · 回到顶部</a>
            <a href="https://github.com/doforce/github-trending" target="_blank" rel="noopener noreferrer" className="source-link">
              数据来源：doforce/github-trending
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
