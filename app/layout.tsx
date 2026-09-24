import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Hot — Trending 浏览页",
  description: "浏览 GitHub 每日/每周/每月热门仓库",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-ghcanvas-light text-gray-900 antialiased dark:bg-ghcanvas dark:text-gray-100">
        <SiteHeader />
        {children}
        <footer className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
          数据来自公共 API，仅供学习浏览 ·{" "}
          <Link href="/" className="hover:underline">
            回到顶部
          </Link>
        </footer>
      </body>
    </html>
  );
}
