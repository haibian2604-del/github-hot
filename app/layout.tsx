import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Hot · Trending 浏览页",
  description: "浏览 GitHub 每日/每周/每月热门仓库",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
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
