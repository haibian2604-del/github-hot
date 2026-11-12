# GitHub Hot Index Redesign Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation. Steps use checkbox syntax for tracking.

**Goal:** 用深墨橙索引和黄黑导视融合重构页面，减少干扰并保留完整信息。
**Architecture:** 保留 RepoBrowser 和 lib 数据逻辑，复用现有布局、筛选、列表与状态组件；替换视觉样式并删除不再使用的玻璃组件。
**Tech Stack:** Next.js 14 / React 18 / TypeScript / Tailwind 3 / Vitest / pnpm。
**Spec:** docs/superpowers/specs/2026-11-12-index-redesign.md

## Global Constraints
不添加依赖、不修改接口；保留主题、筛选、缓存、URL、完整仓库信息、键盘操作与 reduced-motion 支持。

## Review Focus
窄屏长仓库名；无描述和无贡献者；筛选请求迟到；亮暗色原生 select；加载时工具栏仍可操作。

### Task 1: 页面视觉及共同布局
Files: app/layout.tsx, app/page.tsx, app/globals.css, tailwind.config.ts, components/header.tsx, components/filter-bar.tsx, components/theme-toggle.tsx。
Interfaces: 保留组件公开 props 与 FilterState。
- [x] 更新色彩、容器、页头与平面筛选栏，移除 GlassSurface 引用和孤立文件。
- [x] 验证现有 FilterBar 和 ThemeToggle 测试。

### Task 2: 榜单、状态与验证
Files: components/repo-card.tsx, components/repo-list.tsx, components/repo-browser.tsx（仅 JSX）, components/skeletons.tsx, components/states.tsx, app/loading.tsx, app/error.tsx, components/__tests__/repo-card.test.tsx。
Interfaces: RepoCard({repo,rank,since})、CardSkeleton() 不变。
- [x] 同步双列布局、信息层级、加载和异常状态。
- [x] 将周期保留在屏幕阅读辅助文本，测试以可访问名称验证信息完整。
- [x] pnpm test / pnpm lint / pnpm build。
- [x] 浏览器桌面和手机、亮暗主题、筛选及边界状态验收；运行一次 detector。
- [x] 独立设计复核并记录 DESIGN.md 和 design.json。

## 验证记录

- `pnpm test`: 11 files / 54 tests passed。
- `pnpm lint`: no warnings or errors。
- `pnpm build`: compiled, type-checked and generated routes successfully。
- Chromium: 1440/1500 桌面、390 手机亮暗截图；320px 额外溢出检查通过；控件高度44px。
- 实际周期切换、Python weekly语言筛选、历史前进后退通过。语言首轮遇上游超时，原错误页出现；相同代理请求之后返回200，复测通过。
- 加载/空态以临时浏览器 fetch 响应夹具检查：6个骨架，3个周期按钮仍可交互，空态正确；导航清除夹具。
- Tab键焦点2px outline；回到顶部链接实测 hash=#top、scrollY=0。
- Detector一次运行结果 `[]`。独立复核要求恢复回到顶部、更新PRODUCT，均已修正；后续 verdict=ship，仅覆盖这两项修复。
- 数据层与接口逻辑无修改；未部署、未推送；未验证Safari/Firefox。
