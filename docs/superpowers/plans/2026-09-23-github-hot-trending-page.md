# GitHub Trending 浏览页 (github-hot) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 GitHub Trending 浏览页：URL 驱动的语言/周期筛选 + 可展开的仓库卡片，数据来自 doforce trending API，部署到 Vercel。

**Architecture:** Server Component 内用原生 fetch 调用上游 API（该 API 无 CORS 头，必须服务端请求），筛选状态写入 URL searchParams 由服务端重渲染，卡片展开为纯客户端 useState。数据经 `lib/trending.ts` 单点归一化，组件不感知上游原始 JSON。

**Tech Stack:** Next.js 14.2.x (App Router) · React 18.3 · TypeScript · Tailwind CSS 3.4 · 原生 fetch · Vitest + Testing Library（仅 devDependencies）· pnpm

**Spec:** `docs/development-plan.md`（本计划依据该定稿规格编写，执行者需同时阅读两者）

## Global Constraints

- 包管理器只用 **pnpm**：`pnpm dlx` / `pnpm add` / `pnpm dev` / `pnpm build` / `pnpm test`；禁止 npm/yarn 命令。
- Next.js 锁 **14.2.x**（React 18 要求），禁止升级到 15；React **18.3.x**；Tailwind **3.4.x**。
- 运行时依赖仅 `next` / `react` / `react-dom`；测试库只能是 devDependencies；禁止 axios/SWR/react-query/组件库。
- 数据获取只用原生 fetch，全部在服务端发起；trending 缓存 `revalidate: 3600`，语言列表 `revalidate: 86400`；fetch 超时 8000ms。
- 上游 API：`https://trend.doforce.dpdns.org`；**出错仍返回 200 + `[]`**；`repo`/`by` 字段以 `/` 开头；`desc` 可为空；单次最多 25 条。
- 主题：亮色为主，`dark:` 变体跟随系统（Tailwind 3.4 默认 `darkMode: "media"`，无需配置），不做手动切换按钮。
- 外链一律 `target="_blank" rel="noopener noreferrer"`。
- 语言筛选参数必须校验：为空 或 存在于 `/lang` 返回的 key 集合，非法值回落「全部语言」。
- 展开行为：多卡可同时展开（非手风琴）。
- 本期不做：热门开发者 Tab、手动主题切换、分页、登录/收藏。

---

### Task 1: 脚手架 —— Next.js 14 + Tailwind 空壳

**Files:**
- Create: 脚手架生成 `app/layout.tsx`、`app/page.tsx`、`app/globals.css`、`tailwind.config.ts`、`tsconfig.json`、`next.config.mjs`、`.eslintrc.json`、`package.json`
- Modify: `app/layout.tsx`（元信息）
- Modify: `app/page.tsx`（清空为占位）

**Interfaces:**
- Produces: 可运行的 Next 14 App Router 项目；`@/*` 路径别名指向项目根；后续所有任务的文件落点。

- [ ] **Step 1: 在现有目录内生成脚手架（保留 README.md 与 docs/）**

```bash
cd /Users/kk/code/project/github-hot
pnpm dlx create-next-app@14 . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm
```

Expected: 生成 `app/`、`package.json`（next 14.2.x）、`pnpm-lock.yaml`；若提示目录非空，确认 README.md/docs 属于允许项后重试；禁止 `--yes` 之外改用 next 15。

- [ ] **Step 2: 清理模板页**

将 `app/page.tsx` 整体替换为：

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">GitHub Hot</h1>
      <p className="mt-2 text-sm text-gray-500">脚手架占位页，后续任务替换。</p>
    </main>
  );
}
```

- [ ] **Step 3: 设置站点元信息**

`app/layout.tsx` 中将 metadata 替换为：

```tsx
export const metadata: Metadata = {
  title: "GitHub Hot — Trending 浏览页",
  description: "浏览 GitHub 每日/每周/每月热门仓库",
};
```

- [ ] **Step 4: 验证构建与开发服务器**

```bash
pnpm build
```

Expected: 构建成功，无类型错误；`next` 版本为 14.2.x（`pnpm list next --depth 0` 确认）。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold next.js 14 app with tailwind and pnpm"
```

---

### Task 2: 测试基建 —— Vitest + Testing Library

**Files:**
- Create: `vitest.config.ts`、`vitest.setup.ts`
- Modify: `package.json`（scripts + devDependencies）

**Interfaces:**
- Produces: `pnpm test`（单次运行）与 `pnpm test:watch`；测试内路径别名 `@/` 可用；测试显式 `import { describe, it, expect } from "vitest"`（不启用 globals）；DOM 断言用 `@testing-library/jest-dom/vitest`（由 setup 注入）。

- [ ] **Step 1: 安装 devDependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 2: 添加 scripts**

`package.json` 的 `scripts` 中加入：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: 创建 `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: 创建 `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: 写一个真实的最小冒烟测试 `lib/__tests__/sanity.test.ts`（Task 3 会删除它）**

```ts
import { describe, it, expect } from "vitest";

describe("vitest infra", () => {
  it("runs with jsdom and aliases", () => {
    expect(document).toBeDefined();
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 6: 运行验证**

```bash
pnpm test
```

Expected: 1 passed。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add vitest and testing library infra"
```

---

### Task 3: lib/format.ts —— 数字缩写与周期文案（TDD）

**Files:**
- Create: `lib/format.ts`
- Test: `lib/__tests__/format.test.ts`
- Delete: `lib/__tests__/sanity.test.ts`

**Interfaces:**
- Produces: `formatCompactNumber(n: number): string`（`36726→"36.7k"`、`8386→"8.4k"`、`950→"950"`、`1234567→"1.2M"`、非法输入→`"0"`）；`changeLabel(since: Since): string`（daily→"今天"、weekly→"本周"、monthly→"本月"）；`SINCE_LABELS: Record<Since, string>`。
- Consumes: `Since` 类型来自 Task 5 的 `@/lib/trending`（仅 type import，避免测试期耦合实现）。

- [ ] **Step 1: 删除冒烟测试，写失败测试 `lib/__tests__/format.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatCompactNumber, changeLabel } from "@/lib/format";

describe("formatCompactNumber", () => {
  it("keeps numbers below 1000 as-is", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(950)).toBe("950");
  });
  it("abbreviates thousands with one decimal", () => {
    expect(formatCompactNumber(36726)).toBe("36.7k");
    expect(formatCompactNumber(8386)).toBe("8.4k");
    expect(formatCompactNumber(1000)).toBe("1k");
  });
  it("abbreviates millions", () => {
    expect(formatCompactNumber(1234567)).toBe("1.2M");
    expect(formatCompactNumber(3_000_000)).toBe("3M");
  });
  it("falls back to 0 on invalid input", () => {
    expect(formatCompactNumber(Number.NaN)).toBe("0");
    expect(formatCompactNumber(-5)).toBe("0");
  });
});

describe("changeLabel", () => {
  it("maps since to chinese label", () => {
    expect(changeLabel("daily")).toBe("今天");
    expect(changeLabel("weekly")).toBe("本周");
    expect(changeLabel("monthly")).toBe("本月");
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: FAIL，`Cannot find module '@/lib/format'`。

- [ ] **Step 3: 实现 `lib/format.ts`**

```ts
import type { Since } from "@/lib/trending";

export const SINCE_LABELS: Record<Since, string> = {
  daily: "今天",
  weekly: "本周",
  monthly: "本月",
};

export function changeLabel(since: Since): string {
  return SINCE_LABELS[since];
}

function trimOne(v: number): string {
  const s = v >= 100 ? Math.round(v).toString() : v.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) return `${trimOne(n / 1000)}k`;
  return `${trimOne(n / 1_000_000)}M`;
}
```

注意：`Since` 类型此时尚不存在，测试会编译失败——先在 `lib/trending.ts` 建立最小类型占位（Task 5 会补全该文件）：

```ts
// lib/trending.ts —— Task 5 将扩展本文件
export type Since = "daily" | "weekly" | "monthly";
```

- [ ] **Step 4: 运行确认通过**

```bash
pnpm test
```

Expected: format 测试全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add number formatting and since labels"
```

---

### Task 4: lib/language-colors.ts —— 语言色点（TDD）

**Files:**
- Create: `lib/language-colors.ts`
- Test: `lib/__tests__/language-colors.test.ts`

**Interfaces:**
- Produces: `getLanguageColor(lang: string | undefined): string`（返回 hex 色值；已知语言返回映射色，未知/空返回中性灰 `#8b949e`）。

- [ ] **Step 1: 写失败测试 `lib/__tests__/language-colors.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getLanguageColor } from "@/lib/language-colors";

describe("getLanguageColor", () => {
  it("returns mapped color for known languages", () => {
    expect(getLanguageColor("TypeScript")).toBe("#3178c6");
    expect(getLanguageColor("Python")).toBe("#3572A5");
  });
  it("returns neutral gray for unknown or empty languages", () => {
    expect(getLanguageColor("Klingon")).toBe("#8b949e");
    expect(getLanguageColor("")).toBe("#8b949e");
    expect(getLanguageColor(undefined)).toBe("#8b949e");
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: FAIL，`Cannot find module '@/lib/language-colors'`。

- [ ] **Step 3: 实现 `lib/language-colors.ts`**

```ts
const NEUTRAL = "#8b949e";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Zig: "#ec915c",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  "Jupyter Notebook": "#DA5B0B",
  MDX: "#fcb32c",
  "Objective-C": "#438eff",
  PowerShell: "#012456",
  R: "#198CE7",
  Perl: "#0298c3",
};

export function getLanguageColor(lang: string | undefined): string {
  if (!lang) return NEUTRAL;
  return LANGUAGE_COLORS[lang] ?? NEUTRAL;
}
```

- [ ] **Step 4: 运行确认通过**

```bash
pnpm test
```

Expected: 全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add language color mapping"
```

---

### Task 5: lib/trending.ts —— API 客户端与归一化（TDD）

**Files:**
- Modify: `lib/trending.ts`（Task 3 已有 `Since` 类型，本任务补全）
- Test: `lib/__tests__/trending.test.ts`

**Interfaces:**
- Produces:
  - `type Since = "daily" | "weekly" | "monthly"`；`SINCE_VALUES: Since[]`；`DEFAULT_SINCE: Since = "daily"`
  - `interface Contributor { username: string; avatar: string }`
  - `interface TrendingRepo { owner: string; name: string; description: string; language: string; stars: number; forks: number; change: number; contributors: Contributor[]; repoUrl: string }`
  - `interface LanguageOption { label: string; key: string }`
  - `parseRepoPath(path: unknown): { owner: string; name: string } | null`
  - `normalizeRepos(list: unknown): TrendingRepo[]`（脏数据丢弃、非数字兜底 0）
  - `isSince(v: string | undefined | null): v is Since`
  - `fetchTrending(opts?: { lang?: string; since?: Since }): Promise<TrendingRepo[]>`
  - `fetchLanguages(): Promise<LanguageOption[]>`（按 label 字母序排序）
- Consumes: 无（本任务为数据层源头）。

- [ ] **Step 1: 写失败测试 `lib/__tests__/trending.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseRepoPath,
  normalizeRepos,
  isSince,
  fetchTrending,
  fetchLanguages,
  DEFAULT_SINCE,
} from "@/lib/trending";

const SAMPLE_REPO = {
  repo: "/anthropics/financial-services",
  desc: "",
  lang: "Python",
  stars: 36726,
  forks: 5361,
  build_by: [{ avatar: "https://avatars.githubusercontent.com/u/5457787?s=40&v=4", by: "/mihilmy" }],
  change: 665,
};

describe("parseRepoPath", () => {
  it("parses leading-slash paths", () => {
    expect(parseRepoPath("/vercel/next.js")).toEqual({ owner: "vercel", name: "next.js" });
  });
  it("returns null for malformed input", () => {
    expect(parseRepoPath("just-a-name")).toBeNull();
    expect(parseRepoPath("/a/b/c")).toBeNull();
    expect(parseRepoPath(42)).toBeNull();
    expect(parseRepoPath(undefined)).toBeNull();
  });
});

describe("normalizeRepos", () => {
  it("maps raw api objects to TrendingRepo", () => {
    const repos = normalizeRepos([SAMPLE_REPO]);
    expect(repos).toHaveLength(1);
    expect(repos[0]).toEqual({
      owner: "anthropics",
      name: "financial-services",
      description: "",
      language: "Python",
      stars: 36726,
      forks: 5361,
      change: 665,
      contributors: [{ username: "mihilmy", avatar: "https://avatars.githubusercontent.com/u/5457787?s=40&v=4" }],
      repoUrl: "https://github.com/anthropics/financial-services",
    });
  });
  it("drops malformed entries and clamps bad numbers", () => {
    const repos = normalizeRepos([{ repo: "bad" }, { repo: "/ok/repo", stars: "x", build_by: "nope" }]);
    expect(repos).toHaveLength(1);
    expect(repos[0].stars).toBe(0);
    expect(repos[0].contributors).toEqual([]);
  });
  it("returns empty array for non-array input", () => {
    expect(normalizeRepos(null)).toEqual([]);
  });
});

describe("isSince", () => {
  it("validates since values", () => {
    expect(isSince("daily")).toBe(true);
    expect(isSince("hourly")).toBe(false);
    expect(isSince(undefined)).toBe(false);
  });
});

describe("fetchTrending", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([SAMPLE_REPO]), { status: 200 }))
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("requests /repo with lang and since and normalizes", async () => {
    const repos = await fetchTrending({ lang: "python", since: "weekly" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://trend.doforce.dpdns.org/repo?lang=python&since=weekly"),
      expect.objectContaining({ next: { revalidate: 3600 } })
    );
    expect(repos[0].owner).toBe("anthropics");
  });

  it("omits empty lang and defaults since to daily", async () => {
    await fetchTrending();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/repo\?since=daily$/),
      expect.anything()
    );
  });

  it("throws on non-200 so error.tsx can render", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    await expect(fetchTrending()).rejects.toThrow("HTTP 500");
  });
});

describe("fetchLanguages", () => {
  it("fetches /lang, keeps label/key pairs, sorts by label", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify([{ label: "Zig", key: "zig" }, { label: "ABAP", key: "abap" }, { bad: 1 }]), { status: 200 })
      )
    );
    const langs = await fetchLanguages();
    expect(langs).toEqual([
      { label: "ABAP", key: "abap" },
      { label: "Zig", key: "zig" },
    ]);
    expect(DEFAULT_SINCE).toBe("daily");
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: trending 相关 FAIL（`parseRepoPath` 等未导出）；format/language-colors 仍 PASS。

- [ ] **Step 3: 补全 `lib/trending.ts`**

```ts
const API_BASE = "https://trend.doforce.dpdns.org";
const FETCH_TIMEOUT_MS = 8_000;
const TRENDING_REVALIDATE_S = 3600;
const LANGUAGES_REVALIDATE_S = 86_400;

export type Since = "daily" | "weekly" | "monthly";
export const SINCE_VALUES: Since[] = ["daily", "weekly", "monthly"];
export const DEFAULT_SINCE: Since = "daily";

export interface Contributor {
  username: string;
  avatar: string;
}

export interface TrendingRepo {
  owner: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  change: number;
  contributors: Contributor[];
  repoUrl: string;
}

export interface LanguageOption {
  label: string;
  key: string;
}

interface RawContributor {
  avatar?: unknown;
  by?: unknown;
}

interface RawRepo {
  repo?: unknown;
  desc?: unknown;
  lang?: unknown;
  stars?: unknown;
  forks?: unknown;
  build_by?: unknown;
  change?: unknown;
}

export function parseRepoPath(path: unknown): { owner: string; name: string } | null {
  if (typeof path !== "string") return null;
  const parts = path.replace(/^\/+/, "").split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { owner: parts[0], name: parts[1] };
}

function toCount(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
}

export function normalizeRepos(list: unknown): TrendingRepo[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((raw) => {
    const r = (raw ?? {}) as RawRepo;
    const parsed = parseRepoPath(r.repo);
    if (!parsed) return [];
    const contributors = Array.isArray(r.build_by)
      ? (r.build_by as RawContributor[]).flatMap((c) => {
          const username = typeof c?.by === "string" ? c.by.replace(/^\/+/, "") : "";
          const avatar = typeof c?.avatar === "string" ? c.avatar : "";
          return username && avatar ? [{ username, avatar }] : [];
        })
      : [];
    return [
      {
        owner: parsed.owner,
        name: parsed.name,
        description: typeof r.desc === "string" ? r.desc : "",
        language: typeof r.lang === "string" ? r.lang : "",
        stars: toCount(r.stars),
        forks: toCount(r.forks),
        change: toCount(r.change),
        contributors,
        repoUrl: `https://github.com/${parsed.owner}/${parsed.name}`,
      },
    ];
  });
}

export function isSince(v: string | undefined | null): v is Since {
  return !!v && (SINCE_VALUES as string[]).includes(v);
}

async function getJson(path: string, revalidate: number): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`上游 API 异常：HTTP ${res.status}`);
  return res.json();
}

export async function fetchTrending(opts: { lang?: string; since?: Since } = {}): Promise<TrendingRepo[]> {
  const params = new URLSearchParams();
  if (opts.lang) params.set("lang", opts.lang);
  params.set("since", opts.since ?? DEFAULT_SINCE);
  const list = await getJson(`/repo?${params.toString()}`, TRENDING_REVALIDATE_S);
  return normalizeRepos(list);
}

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const list = await getJson("/lang", LANGUAGES_REVALIDATE_S);
  if (!Array.isArray(list)) return [];
  return list
    .flatMap((item) => {
      const l = (item ?? {}) as Record<string, unknown>;
      return typeof l.label === "string" && typeof l.key === "string" ? [{ label: l.label, key: l.key }] : [];
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}
```

- [ ] **Step 4: 运行确认通过**

```bash
pnpm test
```

Expected: 全部 PASS。

- [ ] **Step 5: 真实联调冒烟（一次性脚本，不入库）**

```bash
pnpm exec tsx -e "import('./lib/trending').then(m => m.fetchTrending({ since: 'daily' }).then(r => console.log(r.length, r[0]?.owner, r[0]?.name)))"
```

Expected: 打印 `25 <owner> <name>`。若 `tsx` 不可用，改用 `pnpm add -D tsx` 后重试（devDependency，允许）。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add trending api client with normalization"
```

---

### Task 6: lib/filter.ts —— 筛选状态与 URL 互转（TDD）

**Files:**
- Create: `lib/filter.ts`
- Test: `lib/__tests__/filter.test.ts`

**Interfaces:**
- Produces:
  - `interface FilterState { lang: string; since: Since }`
  - `parseFilters(sp: Record<string, string | string[] | undefined>): FilterState`（`since` 非法回落 `daily`；`lang` 取首值，缺省 `""`）
  - `buildFilterPath(f: FilterState): string`（`lang` 为空时不写入；`since` 恒写入；如 `/?lang=python&since=weekly`、`/?since=daily`）
- Consumes: `Since` / `isSince` / `DEFAULT_SINCE`（Task 5）。

- [ ] **Step 1: 写失败测试 `lib/__tests__/filter.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseFilters, buildFilterPath } from "@/lib/filter";

describe("parseFilters", () => {
  it("parses valid lang and since", () => {
    expect(parseFilters({ lang: "python", since: "weekly" })).toEqual({ lang: "python", since: "weekly" });
  });
  it("falls back on invalid or missing params", () => {
    expect(parseFilters({})).toEqual({ lang: "", since: "daily" });
    expect(parseFilters({ since: "hourly" })).toEqual({ lang: "", since: "daily" });
    expect(parseFilters({ lang: ["python", "go"] })).toEqual({ lang: "python", since: "daily" });
  });
});

describe("buildFilterPath", () => {
  it("omits empty lang, always writes since", () => {
    expect(buildFilterPath({ lang: "", since: "daily" })).toBe("/?since=daily");
    expect(buildFilterPath({ lang: "python", since: "weekly" })).toBe("/?lang=python&since=weekly");
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: FAIL，`Cannot find module '@/lib/filter'`。

- [ ] **Step 3: 实现 `lib/filter.ts`**

```ts
import { DEFAULT_SINCE, isSince, type Since } from "@/lib/trending";

export interface FilterState {
  lang: string;
  since: Since;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): FilterState {
  const langRaw = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const sinceRaw = Array.isArray(sp.since) ? sp.since[0] : sp.since;
  return { lang: langRaw ?? "", since: isSince(sinceRaw) ? sinceRaw : DEFAULT_SINCE };
}

export function buildFilterPath(f: FilterState): string {
  const params = new URLSearchParams();
  if (f.lang) params.set("lang", f.lang);
  params.set("since", f.since);
  return `/?${params.toString()}`;
}
```

- [ ] **Step 4: 运行确认通过**

```bash
pnpm test
```

Expected: 全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add filter state url mapping helpers"
```

---

### Task 7: FilterBar —— URL 驱动的筛选栏（客户端组件，TDD）

**Files:**
- Create: `components/filter-bar.tsx`
- Test: `components/__tests__/filter-bar.test.tsx`

**Interfaces:**
- Consumes: `LanguageOption` / `SINCE_VALUES`（Task 5）、`FilterState` / `buildFilterPath`（Task 6）。
- Produces: `default export FilterBar({ languages, filters }: { languages: LanguageOption[]; filters: FilterState })`——周期分段控件（今天/本周/本月）+ 语言下拉（含首项「全部语言」value `""`）；变更即 `router.push(buildFilterPath(next))` 并包在 `startTransition` 中，`pending` 时容器半透明。

- [ ] **Step 1: 写失败测试 `components/__tests__/filter-bar.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "@/components/filter-bar";
import type { LanguageOption } from "@/lib/trending";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const languages: LanguageOption[] = [
  { label: "Python", key: "python" },
  { label: "Go", key: "go" },
];

describe("FilterBar", () => {
  it("renders since tabs and language options with 全部语言 first", () => {
    render(<FilterBar languages={languages} filters={{ lang: "", since: "daily" }} />);
    expect(screen.getByRole("button", { name: "今天" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "本周" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "本月" })).toBeInTheDocument();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options[0]).toHaveTextContent("全部语言");
    expect(select.options[1]).toHaveTextContent("Python");
  });

  it("pushes new url when since tab clicked", async () => {
    const user = userEvent.setup();
    render(<FilterBar languages={languages} filters={{ lang: "", since: "daily" }} />);
    await user.click(screen.getByRole("button", { name: "本周" }));
    expect(push).toHaveBeenCalledWith("/?since=weekly");
  });

  it("pushes new url when language selected", async () => {
    const user = userEvent.setup();
    render(<FilterBar languages={languages} filters={{ lang: "", since: "daily" }} />);
    await user.selectOptions(screen.getByRole("combobox"), "python");
    expect(push).toHaveBeenCalledWith("/?lang=python&since=daily");
  });

  it("reflects current filter state", () => {
    render(<FilterBar languages={languages} filters={{ lang: "go", since: "monthly" }} />);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("go");
    expect(screen.getByRole("button", { name: "本月" })).toHaveAttribute("data-active", "true");
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: FAIL，`Cannot find module '@/components/filter-bar'`。

- [ ] **Step 3: 实现 `components/filter-bar.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { buildFilterPath, type FilterState } from "@/lib/filter";
import type { LanguageOption, Since } from "@/lib/trending";

const SINCE_TABS: { value: Since; label: string }[] = [
  { value: "daily", label: "今天" },
  { value: "weekly", label: "本周" },
  { value: "monthly", label: "本月" },
];

export default function FilterBar({
  languages,
  filters,
}: {
  languages: LanguageOption[];
  filters: FilterState;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const apply = (next: FilterState) => {
    startTransition(() => router.push(buildFilterPath(next)));
  };

  return (
    <div
      className={`sticky top-0 z-10 flex flex-col gap-3 border-b bg-white/95 px-1 py-3 backdrop-blur transition-opacity sm:flex-row sm:items-center sm:justify-between dark:bg-gray-950/95 ${
        pending ? "opacity-50" : "opacity-100"
      }`}
      aria-busy={pending}
    >
      <div role="group" aria-label="时间周期" className="inline-flex rounded-md border">
        {SINCE_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            data-active={filters.since === value}
            onClick={() => apply({ ...filters, since: value })}
            className={`px-3 py-1.5 text-sm transition-colors first:rounded-l-md last:rounded-r-md ${
              filters.since === value
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        语言
        <select
          value={filters.lang}
          onChange={(e) => apply({ ...filters, lang: e.target.value })}
          className="rounded-md border bg-transparent px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:text-gray-100 dark:focus:border-gray-500"
        >
          <option value="">全部语言</option>
          {languages.map((l) => (
            <option key={l.key} value={l.key}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
```

说明：周期选项以 `SINCE_TABS` 常量为准；选中态通过 `data-active` 暴露给测试。

- [ ] **Step 4: 运行确认通过**

```bash
pnpm test
```

Expected: 全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add url-driven filter bar"
```

---

### Task 8: RepoCard —— 可展开仓库卡片（客户端组件，TDD）

**Files:**
- Create: `components/repo-card.tsx`
- Test: `components/__tests__/repo-card.test.tsx`

**Interfaces:**
- Consumes: `TrendingRepo`（Task 5）、`formatCompactNumber` / `changeLabel`（Task 3）、`getLanguageColor`（Task 4）。
- Produces: `default export RepoCard({ repo, rank, since }: { repo: TrendingRepo; rank: number; since: Since })`——点击整卡切换展开（`aria-expanded`），可多卡同时展开；展开区含完整描述、贡献者（头像+用户名外链）、「在 GitHub 打开」「查看 Issues」、复制 clone 按钮（点击后 1.5s 显示「已复制 ✓」）。

- [ ] **Step 1: 写失败测试 `components/__tests__/repo-card.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepoCard from "@/components/repo-card";
import type { TrendingRepo } from "@/lib/trending";

const repo: TrendingRepo = {
  owner: "anthropics",
  name: "financial-services",
  description: "Financial services workflows",
  language: "Python",
  stars: 36726,
  forks: 5361,
  change: 665,
  contributors: [
    { username: "mihilmy", avatar: "https://avatars.githubusercontent.com/u/5457787?s=40&v=4" },
  ],
  repoUrl: "https://github.com/anthropics/financial-services",
};

const writeText = vi.fn(async () => undefined);

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText } });
  writeText.mockClear();
});

describe("RepoCard collapsed", () => {
  it("renders rank, name, description, language, stats and change", () => {
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    expect(screen.getByText("financial-services")).toBeInTheDocument();
    expect(screen.getByText(/anthropics/u)).toBeInTheDocument();
    expect(screen.getByText(/Financial services workflows/u)).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("36.7k")).toBeInTheDocument();
    expect(screen.getByText("本周 +665")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /financial-services/u })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows placeholder when description is empty", () => {
    render(<RepoCard repo={{ ...repo, description: "" }} rank={2} since="weekly" />);
    expect(screen.getByText("暂无描述")).toBeInTheDocument();
  });
});

describe("RepoCard expanded", () => {
  it("toggles details with contributors and links on click", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    expect(screen.getByRole("button", { name: /financial-services/u })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("mihilmy")).toHaveAttribute("href", "https://github.com/mihilmy");
    expect(screen.getByRole("link", { name: "在 GitHub 打开" })).toHaveAttribute(
      "href",
      "https://github.com/anthropics/financial-services"
    );
    expect(screen.getByRole("link", { name: "查看 Issues" })).toHaveAttribute(
      "href",
      "https://github.com/anthropics/financial-services/issues"
    );
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    expect(screen.queryByRole("link", { name: "在 GitHub 打开" })).not.toBeInTheDocument();
  });

  it("copies clone command and shows feedback", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    await user.click(screen.getByRole("button", { name: "复制 clone 命令" }));
    expect(writeText).toHaveBeenCalledWith("git clone https://github.com/anthropics/financial-services.git");
    expect(screen.getByText("已复制 ✓")).toBeInTheDocument();
  });

  it("renders external links with rel=noopener", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    const link = screen.getByRole("link", { name: "在 GitHub 打开" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: FAIL，`Cannot find module '@/components/repo-card'`。

- [ ] **Step 3: 实现 `components/repo-card.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Since, TrendingRepo } from "@/lib/trending";
import { changeLabel, formatCompactNumber } from "@/lib/format";
import { getLanguageColor } from "@/lib/language-colors";

export default function RepoCard({
  repo,
  rank,
  since,
}: {
  repo: TrendingRepo;
  rank: number;
  since: Since;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const cloneCommand = `git clone ${repo.repoUrl}.git`;

  const copyClone = async () => {
    try {
      await navigator.clipboard.writeText(cloneCommand);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板不可用（如非安全上下文）时静默失败
    }
  };

  return (
    <li className="overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md dark:bg-gray-900 dark:hover:shadow-black/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-baseline gap-3">
          <span className="w-6 shrink-0 text-right text-sm tabular-nums text-gray-400 dark:text-gray-500">
            {rank}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm text-gray-500 dark:text-gray-400">{repo.owner} /</span>
            <span className="block truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
              {repo.name}
            </span>
          </span>
        </div>
        <p className="mt-1.5 pl-9 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {repo.description || "暂无描述"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-9 text-xs text-gray-500 dark:text-gray-400">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: getLanguageColor(repo.language) }}
              />
              {repo.language}
            </span>
          )}
          <span>★ {formatCompactNumber(repo.stars)}</span>
          <span>⑂ {formatCompactNumber(repo.forks)}</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {changeLabel(since)} +{formatCompactNumber(repo.change)}
          </span>
          {repo.contributors.length > 0 && (
            <span className="ml-auto flex -space-x-1.5">
              {repo.contributors.slice(0, 5).map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.username}
                  src={c.avatar}
                  alt={c.username}
                  loading="lazy"
                  className={`h-5 w-5 rounded-full border border-white dark:border-gray-900 ${
                    i >= 3 ? "hidden sm:block" : ""
                  }`}
                />
              ))}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <p className="text-sm text-gray-700 dark:text-gray-200">{repo.description || "暂无描述"}</p>

          {repo.contributors.length > 0 && (
            <div className="mt-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                贡献者
              </h3>
              <ul className="mt-1.5 flex flex-wrap gap-3">
                {repo.contributors.map((c) => (
                  <li key={c.username}>
                    <a
                      href={`https://github.com/${c.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.avatar} alt="" loading="lazy" className="h-5 w-5 rounded-full" />
                      {c.username}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={repo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
            >
              在 GitHub 打开
            </a>
            <a
              href={`${repo.repoUrl}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              查看 Issues
            </a>
            <button
              type="button"
              onClick={copyClone}
              className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {copied ? "已复制 ✓" : "复制 clone 命令"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
```

实现要点：收起态的增量文案随周期变化（如 `本周 +665`），但 URL 状态由页面持有，因此组件从父级接收 `since` prop（Task 9 的 RepoList 传入），测试统一以 `since="weekly"` 渲染。窄屏（<640px）贡献者头像堆叠仅显示前 3 个，其余 `hidden sm:block`（spec §8 响应式要求）。

- [ ] **Step 4: 运行确认通过**

```bash
pnpm test
```

Expected: 全部 PASS（含「本周 +665」断言）。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add expandable repo card"
```

---

### Task 9: 页面组装 —— RepoList / 空态 / loading / error / page

**Files:**
- Create: `components/repo-list.tsx`、`components/states.tsx`、`app/loading.tsx`、`app/error.tsx`
- Modify: `app/page.tsx`（整体替换）
- Test: `components/__tests__/states.test.tsx`

**Interfaces:**
- Consumes: `FilterBar`（Task 7）、`RepoCard`（Task 8，prop `since: Since`）、`parseFilters` / `FilterState`（Task 6）、`fetchTrending` / `fetchLanguages` / `LanguageOption` / `Since`（Task 5）。
- Produces:
  - `RepoList({ repos, since }: { repos: TrendingRepo[]; since: Since })`——有序列表，rank 从 1 起。
  - `EmptyState({ lang }: { lang: string })`——空态文案 + 「查看全部语言」链接 `/`。
  - `app/page.tsx`：`export const revalidate = 3600`；`searchParams` → `parseFilters` → 语言白名单校验（非法 lang 回落 `""`）→ `Promise.all([fetchTrending, fetchLanguages])` → Header 由 layout 承担，页面渲染 FilterBar + RepoList/EmptyState。
  - `app/loading.tsx`：筛选栏骨架 + 5 张卡片骨架。
  - `app/error.tsx`：client 组件，错误文案 + 「重试」按钮调用 `reset()`。

- [ ] **Step 1: 写失败测试 `components/__tests__/states.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/states";
import RepoList from "@/components/repo-list";
import type { TrendingRepo } from "@/lib/trending";

describe("EmptyState", () => {
  it("mentions the language and offers view-all link", () => {
    render(<EmptyState lang="python" />);
    expect(screen.getByText(/python/u)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看全部语言热门" })).toHaveAttribute("href", "/");
  });
});

describe("RepoList", () => {
  it("renders ranked cards", () => {
    const repo: TrendingRepo = {
      owner: "vercel",
      name: "next.js",
      description: "The React Framework",
      language: "JavaScript",
      stars: 100000,
      forks: 20000,
      change: 300,
      contributors: [],
      repoUrl: "https://github.com/vercel/next.js",
    };
    render(<RepoList repos={[repo, { ...repo, name: "another", owner: "a" }]} since="daily" />);
    expect(screen.getByText("next.js")).toBeInTheDocument();
    expect(screen.getByText("今天 +300")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm test
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 `components/states.tsx`**

```tsx
import Link from "next/link";

export function EmptyState({ lang }: { lang: string }) {
  return (
    <div className="rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {lang ? `语言「${lang}」在此周期暂无 trending 数据。` : "此周期暂无 trending 数据。"}
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        上游数据每天更新，稍后再来看看，或换个语言/周期。
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        查看全部语言热门
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: 实现 `components/repo-list.tsx`**

```tsx
import RepoCard from "@/components/repo-card";
import type { Since, TrendingRepo } from "@/lib/trending";

export default function RepoList({ repos, since }: { repos: TrendingRepo[]; since: Since }) {
  return (
    <ol className="space-y-3">
      {repos.map((repo, i) => (
        <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} rank={i + 1} since={since} />
      ))}
    </ol>
  );
}
```

- [ ] **Step 5: 实现 `app/loading.tsx`**

```tsx
function CardSkeleton() {
  return (
    <li className="rounded-lg border p-4">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-6 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
    </li>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="flex items-center justify-between py-3">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 6: 实现 `app/error.tsx`**

```tsx
"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">数据加载失败</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        无法从上游获取 trending 数据，请稍后重试。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
      >
        重试
      </button>
    </main>
  );
}
```

- [ ] **Step 7: 实现 `app/page.tsx`（整体替换）**

```tsx
import FilterBar from "@/components/filter-bar";
import RepoList from "@/components/repo-list";
import { EmptyState } from "@/components/states";
import { parseFilters } from "@/lib/filter";
import { fetchLanguages, fetchTrending } from "@/lib/trending";

export const revalidate = 3600;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { lang?: string; since?: string };
}) {
  const filters = parseFilters(searchParams ?? {});
  const languages = await fetchLanguages();

  // 语言参数白名单校验：非法值回落「全部语言」，防止构造异常 URL 打上游
  const lang = filters.lang === "" || languages.some((l) => l.key === filters.lang) ? filters.lang : "";
  const langLabel = languages.find((l) => l.key === lang)?.label ?? lang;
  const repos = await fetchTrending({ lang, since: filters.since });

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12">
      <FilterBar languages={languages} filters={{ ...filters, lang }} />
      <div className="mt-4">
        {repos.length === 0 ? (
          <EmptyState lang={langLabel} />
        ) : (
          <RepoList repos={repos} since={filters.since} />
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 8: 运行测试与构建**

```bash
pnpm test && pnpm build
```

Expected: 测试全部 PASS；构建成功。

- [ ] **Step 9: 开发服务器人工冒烟**

```bash
pnpm dev
```

浏览器检查：`http://localhost:3000`（25 张卡片、筛选切换 URL 变化、展开/收起、复制按钮）、`/?lang=python&since=weekly`（正确筛选）、`/?lang=notalang`（回落全部）、空态与骨架屏可见。检查完毕 Ctrl-C。

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: wire home page with list, states and error handling"
```

---

### Task 10: 布局主题、Header 与收尾打磨

**Files:**
- Create: `components/header.tsx`
- Modify: `app/layout.tsx`（全局外壳 + 挂载 Header）
- Modify: `app/globals.css`（必要的基础样式微调）
- Modify: `README.md`

**Interfaces:**
- Consumes: 无新接口。
- Produces: `default export SiteHeader()`（服务端组件：站名 + 数据来源署名链接）；layout 提供全局底色（亮 `#f8f9fa` / 暗 `#0d1117` 类 GitHub 观感）与页脚。

- [ ] **Step 1: 创建 `components/header.tsx` 并接入 layout**

`components/header.tsx`：

```tsx
export default function SiteHeader() {
  return (
    <header className="border-b bg-white dark:bg-[#161b22]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold tracking-tight">GitHub Hot 🔥</h1>
        <a
          href="https://github.com/doforce/github-trending"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          数据来源：doforce/github-trending
        </a>
      </div>
    </header>
  );
}
```

`app/layout.tsx`：

```tsx
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
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-[#0d1117] dark:text-gray-100">
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
```

- [ ] **Step 2: `app/page.tsx` 去掉与 Header 重复的站名（如 Task 9 实现里没有则跳过）**

检查 `app/page.tsx` 顶层没有再渲染 `<h1>GitHub Hot</h1>`；若有，删除该块（Header 已在 layout）。

- [ ] **Step 3: 回归**

```bash
pnpm test && pnpm build && pnpm dev
```

Expected: 测试 PASS、构建成功；浏览器确认亮/暗两套观感正常（系统切换深色模式验证）、移动端 375px 宽度布局正常（头像堆叠不溢出）、筛选与展开交互不回归。

- [ ] **Step 4: 更新 `README.md`**

```markdown
# github-hot

Trending GitHub repositories tracker.

基于 Next.js 14 (App Router) + Tailwind CSS 的 GitHub Trending 浏览页。

- 数据来源：[doforce/github-trending](https://github.com/doforce/github-trending) 公共 API（服务端获取）
- 筛选：编程语言 + 周期（今天/本周/本月），状态写入 URL，可直接分享
- 卡片可展开：贡献者、GitHub 外链、复制 clone 命令

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
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add site layout header and polish theme"
```

---

### Task 11: 部署与验收

**Files:**
- Modify: 无代码文件（推送 + 线上验收；Vercel Import 需用户在浏览器操作或提供 `vercel` CLI 登录）

**Interfaces:**
- Consumes: 全部前置任务。

- [ ] **Step 1: 最终全量验证**

```bash
pnpm test && pnpm build
```

Expected: 全部 PASS，构建成功。

- [ ] **Step 2: 推送仓库**

```bash
git push origin main
```

（若远端未配置，先 `git remote add origin <用户提供的仓库地址>`。）

- [ ] **Step 3: Vercel 上线（与用户协作）**

用户在 Vercel 控制台 Import 该仓库（零配置，自动识别 pnpm + Next.js）；或用户已 `vercel login` 时执行 `pnpm dlx vercel --prod`。上线后拿到生产 URL。

- [ ] **Step 4: 线上验收（对照 development-plan.md §12 清单）**

浏览器逐项验证：daily Top 25 渲染；`/?lang=python&since=weekly` 可分享还原；展开/收起与复制 clone；骨架屏（切换筛选时）、错误态（可临时改 `lib/trending.ts` 的 API_BASE 为无效地址验证 error.tsx，验完改回并重新部署）、空态；375px 与 1280px 两档宽度；系统深色模式。全过即交付。

- [ ] **Step 5: 收尾 Commit（如验收中有修补）**

```bash
git add -A
git commit -m "fix: address acceptance findings"
git push origin main
```

---

## Plan Notes（执行者必读）

1. **上游三个特性**（详见 spec §3.3）：无 CORS（服务端请求已规避）；出错返回 200+`[]`（空态呈现，不报错）；`repo`/`by` 带前导 `/`（`parseRepoPath`/归一化已处理）。
2. **Next 14 的 `searchParams` 是普通对象**（Next 15 才是 Promise），`app/page.tsx` 按此写。
3. Tailwind 3.4 默认 `darkMode: "media"`，无需改 `tailwind.config.ts`。
4. 卡片头像用原生 `<img>` 而非 `next/image`（上游 URL 带 `s=40` 固定尺寸，无需优化管线），因此 `next.config.mjs` **不需要** `images.remotePatterns`（spec §10.2 的配置仅在改用 `next/image` 时才需要）。
5. 测试显式 import vitest API（不启用 globals），`@testing-library/jest-dom/vitest` 由 `vitest.setup.ts` 注入 matchers。
