# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要用户：中文开发者。场景：每天（或每周/每月）花几分钟快速浏览 GitHub 社区热门仓库，发现值得关注的新项目与趋势。状态：扫读、时间碎片化、以信息获取为主，偶尔深入某个仓库。

## Product Purpose

GitHub Trending 浏览页：按周期（今天/本周/本月）与编程语言筛选浏览 GitHub 热门仓库，支持卡片展开查看详情。成功 = 30 秒内看清今天有什么值得关注的新项目/新趋势。

## Positioning

个人学习浏览工具。机制：聚合 doforce/github-trending 公共 API（服务端获取、URL 驱动筛选、筛选状态可分享），加上「展开式详情」——这是 GitHub 官方 trending 页不具备的组合。

## Operating Context

浏览器访问（桌面 + 移动 web）；上游数据每天更新；上游为个人维护的公益 API（无 SLA）。

## Capabilities and Constraints

- 数据源：`https://trend.doforce.dpdns.org`（`/repo`、`/lang`）；无 CORS 头 → 必须服务端请求；出错仍返回 200+`[]`；单次最多 25 条（实测某日仅 17 条，不得假定满额）。
- 技术约束：Next.js 14.2 (App Router) + React 18 + Tailwind 3.4 + TypeScript + 原生 fetch + pnpm；运行时零额外依赖（规格 docs/development-plan.md §2）。
- 明确不做：登录、收藏、搜索、热门开发者 Tab、分页、手动主题切换、商业化。

## Brand Commitments

- 站名「GitHub Hot」；页面需署名数据来源 doforce/github-trending。
- 视觉语言：GitHub 风格、亮色为主 + 跟随系统深色（规格 §8，用户钉住）；执行档位为「升级打磨版」——保留 GitHub 色彩语言，排版更讲究（排名序号作设计元素、更清晰层级、hover 微交互）（用户 2026-09-24 确认）。
- 语言筛选器：原生 `<select>`（用户确认）；卡片密度：舒适阅读型（用户确认）。

## Evidence on Hand

- 上游 API 实测样例与字段结构（docs/development-plan.md §3）。
- 无品牌资产、无用户数据、无 testimonials——不得虚构任何商业或事实性声明。

## Product Principles

1. 信息至上：30 秒扫读是第一目标，视觉服务信息，永不喧宾夺主。
2. 诚实呈现：数据来自上游，空态/错误态如实说明，不虚构内容。
3. 轻快克制：零依赖、轻交互；打磨体现在排版与细节，而非堆功能。
4. 可分享：筛选状态在 URL 里，链接即视图。

## Accessibility & Inclusion

- 展开/收起用 `aria-expanded`；筛选区有 `aria-busy`/`aria-label`；外链 `rel="noopener noreferrer"`。
- 中文界面，`lang="zh-CN"`；控件用原生元素，键盘天然可达。
- 动效尊重 `prefers-reduced-motion`。
