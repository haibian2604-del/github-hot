"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterBar from "@/components/filter-bar";
import RepoList from "@/components/repo-list";
import { CardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/states";
import { buildFilterPath, parseFilters, type FilterState } from "@/lib/filter";
import type { LanguageOption, TrendingRepo } from "@/lib/trending";

// 挂载/切换语言后延迟多久开始静默预热其余时间周期。
// 取值需大于一次快速交互（用户刚进页面就开始点也不至于与点击路径竞争），
// 又要小到在用户第一次点 本周/本月 之前必然完成 —— 1.5s 是两者的平衡点。
const IDLE_PREFETCH_DELAY_MS = 1500;

const PERIODS = ["daily", "weekly", "monthly"] as const;

function cacheKey(f: FilterState): string {
  return `${f.lang}|${f.since}`;
}

function filtersFromParams(sp: { get(name: string): string | null }): FilterState {
  return parseFilters({ lang: sp.get("lang") ?? undefined, since: sp.get("since") ?? undefined });
}

export default function RepoBrowser({
  initialFilters,
  initialRepos,
  languages,
}: {
  initialFilters: FilterState;
  initialRepos: TrendingRepo[];
  languages: LanguageOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 会话内存缓存：键 `${lang}|${since}`。不设 TTL —— 列表新鲜度由 /api/trending
  // 背后服务端的 1h Next Data Cache 负责，客户端只负责「本会话已看过的组合零延迟回切」。
  const cacheRef = useRef<Map<string, TrendingRepo[]> | null>(null);
  if (cacheRef.current === null) {
    cacheRef.current = new Map([[cacheKey(initialFilters), initialRepos]]);
  }

  const [filters, setFilters] = useState(initialFilters);
  const [repos, setRepos] = useState(initialRepos);
  const [pending, setPending] = useState(false);

  // 当前键与请求序号放 ref：事件处理器与 effect 始终读到最新值，避免陈旧闭包
  const currentKeyRef = useRef(cacheKey(initialFilters));
  const seqRef = useRef(0);

  // 在途请求键集合：点击路径与空闲预热共用。先标记再 fetch，双方都不会对同一键
  // 发起第二份并发请求（点击先发 → 预热跳过；预热先发 → 至少点击的迟到响应只重复入缓存，无害）。
  const inFlightRef = useRef<Set<string>>(new Set());

  // URL 同步：目标地址已是浏览器当前地址（后退/前进水合）时不再 push，
  // 否则每次前进/后退都会向历史栈追加重复条目
  const syncUrl = useCallback((next: FilterState) => {
    if (window.location.pathname + window.location.search === buildFilterPath(next)) return;
    window.history.pushState(null, "", buildFilterPath(next));
  }, []);

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      const nextKey = cacheKey(next);
      if (nextKey === currentKeyRef.current) {
        // 同键重复选择同样是一次「用户施加的选择」：使在途请求失效并结束加载态，
        // 否则迟到的 miss 响应会把界面拉回用户已离开的筛选
        seqRef.current += 1;
        setPending(false);
        return;
      }

      const cached = cacheRef.current?.get(nextKey);
      if (cached) {
        // 缓存命中同样使在途 miss 请求失效（与 miss 分支共用 seqRef 序号）
        seqRef.current += 1;
        setPending(false);
        currentKeyRef.current = nextKey;
        setRepos(cached);
        setFilters(next);
        // Next 14 文档化的 shallow routing：仅同步地址栏，不触发服务端重渲染
        syncUrl(next);
        return;
      }

      // 未命中：fetch 同源代理，成功入缓存上屏；失败回落既有 SSR 导航（含 error.tsx 链路）
      const seq = ++seqRef.current;
      setPending(true);
      inFlightRef.current.add(nextKey);
      const params = new URLSearchParams();
      if (next.lang) params.set("lang", next.lang);
      params.set("since", next.since);
      fetch(`/api/trending?${params.toString()}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as TrendingRepo[];
          cacheRef.current?.set(nextKey, data);
          if (seq !== seqRef.current) return; // 过期响应：只入缓存，不上屏
          currentKeyRef.current = nextKey;
          setRepos(data);
          setFilters(next);
          syncUrl(next);
        })
        .catch(() => {
          if (seq !== seqRef.current) return; // 过期请求的失败不触发导航
          router.push(buildFilterPath(next));
        })
        .finally(() => {
          inFlightRef.current.delete(nextKey);
          if (seq === seqRef.current) setPending(false);
        });
    },
    [router, syncUrl]
  );

  // effect 内经 ref 调用最新处理器，避免把旧闭包钉进依赖数组
  const applyRef = useRef(handleFilterChange);
  useEffect(() => {
    applyRef.current = handleFilterChange;
  }, [handleFilterChange]);

  // 预热定时器的回调同样经 ref 读最新筛选（lang + since），避免钉住旧闭包
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 空闲预热：挂载后（以及应用语言变化后）延迟 IDLE_PREFETCH_DELAY_MS，
  // 对「非当前 since、未缓存、未在途」的周期各发一次静默请求 —— 只写缓存，
  // 不 setState、不碰 URL、不置 pending。首次点击 本周/本月 因此变为零请求的缓存命中。
  // 依赖数组只含当前 lang：切换语言 → 新组合值得重新预热 → 重启定时器；
  // 仅切 since 不重启（预热内容与 since 无关，当前键由 inFlightRef/缓存守卫排除）。
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = filtersRef.current;
      for (const since of PERIODS) {
        if (since === current.since) continue;
        const key = cacheKey({ lang: current.lang, since });
        if (cacheRef.current?.has(key)) continue;
        if (inFlightRef.current.has(key)) continue;
        inFlightRef.current.add(key);
        const params = new URLSearchParams();
        if (current.lang) params.set("lang", current.lang);
        params.set("since", since);
        fetch(`/api/trending?${params.toString()}`)
          .then(async (res) => {
            if (!res.ok) return; // 预热失败即放弃：缓存保持冷，点击路径自带 SSR 回落链
            const data = (await res.json()) as TrendingRepo[];
            cacheRef.current?.set(key, data);
          })
          .catch(() => {
            // 吞掉预热失败（网络抖动/组件已卸载），不影响任何用户可见状态
          })
          .finally(() => {
            inFlightRef.current.delete(key);
          });
      }
    }, IDLE_PREFETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [filters.lang]);

  const urlFilters = filtersFromParams(searchParams);
  const urlKey = cacheKey(urlFilters);
  const seenUrlKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // 首次挂载：SSR 初始数据已与 URL 一致，无需水合
    if (seenUrlKeyRef.current === null) {
      seenUrlKeyRef.current = urlKey;
      return;
    }
    // 只响应 useSearchParams 派生键的变化。注意：本组件自己的 window.history.pushState
    // 在 Next 14.1+ 同样会让 searchParams 同步并触发本 effect —— 但那时派生键与当前键
    // 相同，handleFilterChange 的同键守卫使这次水合成为 no-op。
    // 不要因为「看似多余」而移除该守卫：它同时挡住 self-push 回环与迟到的在途响应。
    if (urlKey === seenUrlKeyRef.current) return;
    seenUrlKeyRef.current = urlKey;
    applyRef.current(filtersFromParams(searchParams));
  }, [urlKey, searchParams]);

  const langLabel = languages.find((l) => l.key === filters.lang)?.label ?? filters.lang;

  return (
    <>
      <FilterBar
        languages={languages}
        filters={filters}
        pending={pending}
        onFilterChange={handleFilterChange}
      />
      {/* pending 期间以骨架屏替代旧列表（替代原先的半透明冻结感）；FilterBar 始终可交互 */}
      <div aria-busy={pending} className="mt-4">
        {pending ? (
          <ul aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ul>
        ) : repos.length === 0 ? (
          <EmptyState lang={langLabel} />
        ) : (
          <RepoList repos={repos} since={filters.since} />
        )}
      </div>
    </>
  );
}
