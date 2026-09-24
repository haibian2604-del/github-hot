"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterBar from "@/components/filter-bar";
import RepoList from "@/components/repo-list";
import { EmptyState } from "@/components/states";
import { buildFilterPath, parseFilters, type FilterState } from "@/lib/filter";
import type { LanguageOption, TrendingRepo } from "@/lib/trending";

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

  // URL 同步：目标地址已是浏览器当前地址（后退/前进水合）时不再 push，
  // 否则每次前进/后退都会向历史栈追加重复条目
  const syncUrl = useCallback((next: FilterState) => {
    if (window.location.pathname + window.location.search === buildFilterPath(next)) return;
    window.history.pushState(null, "", buildFilterPath(next));
  }, []);

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      const nextKey = cacheKey(next);
      if (nextKey === currentKeyRef.current) return;

      const cached = cacheRef.current?.get(nextKey);
      if (cached) {
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

  const urlFilters = filtersFromParams(searchParams);
  const urlKey = cacheKey(urlFilters);
  const seenUrlKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // 首次挂载：SSR 初始数据已与 URL 一致，无需水合
    if (seenUrlKeyRef.current === null) {
      seenUrlKeyRef.current = urlKey;
      return;
    }
    // 只响应 useSearchParams 的真实变化：本组件自己的 window.history.pushState 是
    // shallow routing，不会更新 useSearchParams，因此「派生键变化」只会来自
    // 浏览器后退/前进（App Router 会随之更新 searchParams 并重渲染）。
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
      <div
        aria-busy={pending}
        className={`mt-4 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          pending ? "opacity-60" : "opacity-100"
        }`}
      >
        {repos.length === 0 ? (
          <EmptyState lang={langLabel} />
        ) : (
          <RepoList repos={repos} since={filters.since} />
        )}
      </div>
    </>
  );
}
