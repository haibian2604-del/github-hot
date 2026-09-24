# github-hot

Trending GitHub repositories tracker.

基于 Next.js 14 (App Router) + Tailwind CSS 的 GitHub Trending 浏览页。

- 数据来源：[doforce/github-trending](https://github.com/doforce/github-trending) 公共 API（服务端获取）
- 筛选：编程语言 + 周期（今天/本周/本月），状态写入 URL，可直接分享
- 卡片整卡直链 GitHub 仓库页（新标签页打开）

## 开发

```bash
pnpm install
pnpm dev      # 本地开发
pnpm test     # Vitest 单测
pnpm build    # 生产构建
```

## 部署

推送到 GitHub 后在 [Vercel](https://vercel.com) Import 即可，零配置（自动识别 pnpm 与 Next.js）。

设计与实施计划见 `docs/`。
