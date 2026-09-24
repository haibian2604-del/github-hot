# github-hot 开发文档

> GitHub Trending 浏览页 · Next.js 14 App Router · 状态：已确认，待开发
> 日期：2026-09-23

---

## 1. 项目概述

构建一个 GitHub Trending 浏览页（仓库当前仅有一个 README），数据来自 doforce/github-trending 公共 API。核心能力：

1. **热门仓库列表**：展示每周期（今天/本周/本月）GitHub 热门仓库，单页最多 25 条。
2. **筛选**：按编程语言（热门语言白名单 30 项，来自 API `/lang` 过滤）+ 时间周期（daily / weekly / monthly）筛选，筛选状态写入 URL，可分享、可回退。
3. **卡片直链**：整卡为直达链接，点击新标签页打开对应 GitHub 仓库（target=_blank + noopener），无展开面板。
4. **部署**：Vercel 零配置部署。

**明确不做**（当前范围外）：登录、收藏、搜索、热门开发者 Tab（API 有 `/user` 端点，列为可选二期）。

---

## 2. 技术栈

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | **Next.js 14.2.x（App Router）** | 要求 React 18，故锁定 14.x 大版本（Next 15 强制 React 19） |
| UI 运行时 | **React 18.3.x** | 仅 `use client` 用于筛选栏与列表刷新（FilterBar/RepoBrowser），其余为 Server Component |
| 样式 | **Tailwind CSS 3.4.x** | 与 Next 14 配套的稳定版本；不用任何组件库 |
| 数据获取 | **原生 fetch**（Server Component 内调用） | 不引入 axios / SWR / react-query |
| 语言 | **TypeScript**（推荐，见待确认项 ①） | 接口字段强类型，成本低收益高 |
| 运行时依赖 | 除 next / react / react-dom 外 **0 个** | 数字格式化、语言色值均自行实现 |
| 包管理器 | **pnpm** | 全程使用 pnpm 命令（脚手架 / 安装 / dev / build / lint），Vercel 自动识别 pnpm-lock.yaml |
| 部署 | **Vercel** | Node 20.x，零配置 |

---

## 3. 数据源分析（已实测验证）

Base URL：`https://trend.doforce.dpdns.org`（FastAPI，托管于 Vercel，Swagger：`/docs`）

### 3.1 端点

| 端点 | 参数 | 用途 |
|---|---|---|
| `GET /repo` | `lang`（语言 key，默认空=全部）、`since`（`daily`/`weekly`/`monthly`，默认 `daily`） | 热门仓库列表，本项目主数据源 |
| `GET /lang` | 无 | 全部可用语言，`[{label, key}]` 约 700 项，供筛选器下拉 |

### 3.2 `/repo` 返回结构（实测样例）

```json
[
  {
    "repo": "/anthropics/financial-services",
    "desc": "",
    "lang": "Python",
    "stars": 36726,
    "forks": 5361,
    "build_by": [
      { "avatar": "https://avatars.githubusercontent.com/u/5457787?s=40&v=4", "by": "/mihilmy" }
    ],
    "change": 665
  }
]
```

字段说明：

- `repo`：仓库路径，**以 `/` 开头**（如 `/owner/name`），需解析出 `owner` / `name` 用于展示与外链。
- `desc`：描述，**可能为空字符串**。
- `lang`：语言显示名（如 `Python`）；`change`：该周期新增 star 数。
- `build_by`：贡献者头像数组（通常 ≤5 项），`by` 同样以 `/` 开头。

### 3.3 必须注意的三个坑（影响架构）

1. **无 CORS 头**：实测响应头不含 `access-control-allow-origin`，浏览器直连会被拦 → **所有请求必须在服务端发起**（Server Component 内 fetch），客户端组件只拿现成 props。
2. **出错也返回 200 + `[]`**：API 约定失败/参数不匹配时仍回 200 空数组 → 客户端需把"空数组"按"无数据"优雅呈现，而不是当 HTTP 错误。
3. **单次最多 25 条**：无分页参数，列表按排名 1–25 渲染即可，不做分页。

---

## 4. 总体架构

```
浏览器 ──URL(searchParams: lang, since)──▶ Next.js Server (Vercel)
                                            ├─ app/page.tsx (RSC)
                                            │    ├─ fetch /repo?lang&since   (revalidate 1h)
                                            │    └─ fetch /lang              (revalidate 24h)
                                            ├─ 服务端渲染列表 HTML
                                            └─ 客户端交互：FilterBar 改 URL、RepoBrowser 会话缓存/待刷新态
```

**关键决策**

- **URL 驱动筛选**：`/?lang=python&since=weekly`。筛选变更由 `FilterBar` 通过 `router.push` 更新 searchParams，服务端重新取数渲染。换来的好处：筛选结果可分享/可收藏、浏览器前进后退可用、首屏即含数据（利于 SEO 与 LCP）。
- **缓存策略**：trending 数据 `next: { revalidate: 3600 }`（上游页面约每小时更新）；`/lang` 列表基本不变 `revalidate: 86400`。同一筛选的重复访问直接命中 Vercel 边缘缓存，不回源。
- **不建自用 API 路由**：~~RSC 直连上游即可~~ → 2026-09-24 用户确认新增客户端切换缓存：/api/trending 同源代理（复用 1h Data Cache）+ RepoBrowser 会话内存缓存；首屏 SSR、URL 可分享、错误链路全部保持不变。
- **卡片无本地状态**：RepoCard 为服务端组件，整卡直链 GitHub，不引入额外 URL 参数（2026-09-24 用户确认移除展开功能）。

---

## 5. 目录结构

```
github-hot/
├── app/
│   ├── layout.tsx            # 全局布局、元信息、字体
│   ├── page.tsx              # 主页 RSC：读 searchParams → 取数 → 组装
│   ├── loading.tsx           # 首屏/切换筛选时的骨架屏
│   ├── error.tsx             # 取数失败兜底（含重试按钮）
│   ├── globals.css           # Tailwind 指令与少量全局样式
│   └── favicon.ico
├── components/
│   ├── header.tsx            # 站点标题 + 数据来源署名
│   ├── filter-bar.tsx        # 客户端：语言下拉 + 周期切换（写 URL）
│   ├── repo-card.tsx         # 服务端：单张卡片（整卡直链 GitHub）
│   ├── repo-list.tsx         # 服务端：卡片列表（含排名）
│   └── states.tsx            # EmptyState / ErrorState
├── lib/
│   ├── trending.ts           # API 客户端：fetch + 类型 + repo 路径解析（上游单点隔离）
│   ├── format.ts             # 数字缩写(36.7k)、change 文案
│   └── language-colors.ts    # 常见语言→色点颜色映射，未知语言用中性灰
├── docs/development-plan.md
├── next.config.mjs           # images.remotePatterns 放行 avatars.githubusercontent.com
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. 数据模型（lib/trending.ts）

```ts
export type Since = "daily" | "weekly" | "monthly";

export interface TrendingRepo {
  owner: string;        // 解析自 repo，如 "anthropics"
  name: string;         // 解析自 repo，如 "financial-services"
  description: string;  // 上游 desc，可为空
  language: string;     // 如 "Python"
  stars: number;
  forks: number;
  change: number;       // 该周期新增 star
  contributors: { username: string; avatar: string }[]; // 上游 build_by
  repoUrl: string;      // https://github.com/{owner}/{name}
}

export interface LanguageOption { label: string; key: string }

export async function fetchTrending(opts: { lang?: string; since?: Since }): Promise<TrendingRepo[]>
export async function fetchLanguages(): Promise<LanguageOption[]>
```

- fetch 带超时（`AbortSignal.timeout(8_000)`），超时/网络错误统一抛出交由 `error.tsx` 呈现。
- `repo` 字段解析失败（不含 `/`）的脏数据直接丢弃，不渲染半残卡片。

---

## 7. 页面与交互设计

### 7.1 主页布局（自上而下）

1. **Header**：站名 "GitHub Hot" + 一句话副标题 + 数据来源链接。
2. **FilterBar（吸顶）**：
   - 周期切换：分段控件「今天 / 本周 / 本月」（→ `since`）。
   - 语言选择：`<select>`，选项为热门语言白名单（30 项，按流行度排序，来自 `/lang` 过滤），含「全部语言」（→ `lang`，取 `key`；2026-09-24 用户确认由全量 ~700 项收敛）。
   - 变更即 `router.push(新URL)`，配合 `useTransition` 显示待刷新态（FilterBar 半透明/转圈）。
3. **RepoList**：25 张卡片，序号 1–25。

### 7.2 卡片

**收起态**：排名序号 · 仓库全名（owner 灰色小字 + name 加粗）· 描述（空则显示占位文案"暂无描述"，最多 2 行截断）· 底部元信息行：语言色点+语言名、★ stars（缩写如 36.7k）、forks、绿色「本周 +665」随 `since` 变化文案、贡献者头像堆叠（≤5）。

**交互**：整卡为直达链接，点击新标签页打开对应 GitHub 仓库（target=_blank + noopener）。无展开面板——贡献者以头像堆叠呈现在元信息行，克隆等操作由用户在 GitHub 页完成（2026-09-24 用户确认移除展开功能）。

### 7.3 状态设计

| 状态 | 呈现 |
|---|---|
| 加载中 | `loading.tsx` 骨架屏（筛选栏 + 5 张卡片形状），切换筛选同样触发 |
| 上游失败/超时 | `error.tsx`：错误提示 + 「重试」按钮（`router.refresh()`） |
| 返回空数组 | EmptyState：说明可能原因（该语言本周暂无 trending）+ 「查看全部」快捷入口 |
| desc 为空 | 卡片内占位文案，不留空白 |

---

## 8. 样式与主题

- **视觉基调**：GitHub 风格 —— 亮色为主，跟随系统深色模式（`media` 策略的 `dark:` 变体，不引入主题切换按钮，不做本地存储）。
- 卡片：圆角、1px 边框、hover 阴影/边框微反馈（150–200ms ease-out，motion-reduce 退化）；整卡直链 GitHub，无展开区。
- 语言色点：内置 30+ 常见语言的 GitHub 官方色（TypeScript 蓝、Python 黄绿…），未知语言统一中性灰。
- 响应式：移动端（<768px）单列；≥768px 仓库列表为两列网格，容器最大宽度 `max-w-5xl` 居中（2026-09-24 用户确认由单列改为两列）。头像堆叠在窄屏自动隐藏至 3 个。

---

## 9. 错误处理与防御性细节

- 所有上游数据经 `lib/trending.ts` 归一化后才进组件，组件不感知原始 JSON 字段名。
- `stars/forks/change` 非数字时按 0 兜底；`build_by` 缺失渲染为空。
- 外链统一 `target="_blank" rel="noopener noreferrer"`。
- 语言参数做白名单校验（必须存在于 `/lang` 返回的 key 集合，或为空），非法值忽略并回落「全部」，防止构造异常 URL 打上游。

---

## 10. 部署（Vercel）

1. 仓库推 GitHub → Vercel Import，Framework Preset 自动识别 Next.js，包管理器自动识别 pnpm-lock.yaml，零配置。
2. `next.config.mjs` 中配置：

```js
images: { remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }] }
```

3. 无需任何环境变量（上游为公开 API）；如日后加 GitHub Token（二期降级方案）再以 Environment Variables 注入，服务端使用不暴露。
4. 部署后验收：线上三种 `since` × 若干语言组合、深色模式、Lighthouse 移动端性能 ≥ 90。

---

## 11. 里程碑拆分

| 阶段 | 内容 | 产出 |
|---|---|---|
| M1 脚手架 | `pnpm dlx create-next-app@14`（TS + Tailwind + App Router）、清理模板、layout/全局样式、目录骨架、`pnpm dev` 本地跑通 | 可运行的空壳页 |
| M2 数据层 | `lib/trending.ts`（fetch+类型+解析+超时）、`/lang` 接入、`page.tsx` 直出 25 条无样式列表 | 数据打通 |
| M3 列表与筛选 | RepoCard 收起态、RepoList、FilterBar（URL 驱动）、loading/error/empty 三态 | 核心功能可用 |
| M4 直链与打磨 | 卡片直链 GitHub、头像堆叠、深色模式、语言色点、数字缩写 | 视觉与交互完整 |
| M5 部署验收 | Vercel 上线、线上回归（移动端+桌面端+双主题）、README 更新 | 可交付 |

预估 M1–M5 合计一次会话内可完成。

## 12. 验收标准

- [ ] 首屏展示 daily Top 25，含排名、名称、描述、语言、stars/forks、周期增量、贡献者头像。
- [ ] 语言 + 周期筛选生效，URL 随之变化，直接打开带参数链接能还原筛选结果。
- [ ] 点击整卡在新标签页打开对应 GitHub 仓库（target=_blank + noopener），贡献者以头像堆叠呈现在卡片上。
- [ ] 筛选切换出现骨架屏；接口异常出现错误页并可重试；空结果有空态文案。
- [ ] 移动端（375px）与桌面端（1280px）布局正常，深色模式正常。
- [ ] `pnpm build` 无错误无类型错误；Vercel 线上可访问。

## 13. 风险与备选

| 风险 | 影响 | 对策 |
|---|---|---|
| 上游为个人维护的公益 API，可能限流/停服 | 页面不可用 | 数据层单点隔离在 `lib/trending.ts`；备选降级为 GitHub Search API（`created:>date sort:stars`，近似 trending），仅需替换该文件 |
| 上游字段变更 | 渲染缺字段 | 归一化层统一兜底，缺字段不致白屏 |
| 上游出错返回 200+`[]` | 误判"无数据" | 按空态优雅呈现（见 §3.3），空态中提供「查看全部语言」帮助用户自证 |

## 14. 已确认决策（2026-09-23）

1. **语言**：使用 TypeScript。
2. **主题**：亮色为主 + 跟随系统深色（`dark:` 变体），不做手动切换按钮。
3. **卡片行为**：整卡直链 GitHub——2026-09-24 用户确认移除展开功能，原「多卡可同时展开」决策作废。
4. **热门开发者 Tab**（API `/user` 端点）：本期不做，列为二期可选项。
5. **包管理器**：pnpm——脚手架与日常命令一律用 pnpm（`pnpm dlx create-next-app`、`pnpm dev`、`pnpm build`、`pnpm lint`），不使用 npm/yarn。
