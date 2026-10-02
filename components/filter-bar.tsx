"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import GlassSurface from "@/components/glass-surface";
import { SINCE_LABELS } from "@/lib/format";
import { buildFilterPath, type FilterState } from "@/lib/filter";
import { SINCE_VALUES, type LanguageOption, type Since } from "@/lib/trending";

const SINCE_TABS: { value: Since; label: string }[] = SINCE_VALUES.map((value) => ({
  value,
  label: SINCE_LABELS[value],
}));

export default function FilterBar({
  languages,
  filters,
  onFilterChange,
  pending,
}: {
  languages: LanguageOption[];
  filters: FilterState;
  // 提供时优先于 router.push（客户端切换缓存模式）；不传时行为与原先完全一致
  onFilterChange?: (next: FilterState) => void;
  // 外部 pending（客户端取数进行中）
  pending?: boolean;
}) {
  const router = useRouter();
  const [transitionPending, startTransition] = useTransition();

  const apply = (next: FilterState) => {
    if (onFilterChange) {
      onFilterChange(next);
      return;
    }
    startTransition(() => router.push(buildFilterPath(next)));
  };

  const busy = pending || transitionPending;

  return (
    // 悬浮胶囊：sticky top-3 吸顶，滚动时钉在视口顶部悬浮于内容之上（top-3 留呼吸缝隙，周围透出滚动内容属该模式正常观感）；无全宽横带
    // 玻璃样式由 GlassSurface 接管（液态玻璃滤镜 + 降级分支），此处仅保留吸顶与 busy 语义
    <div className="sticky top-3 z-20 mt-3" aria-busy={busy}>
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={999}
        backgroundOpacity={0.55}
        saturation={1.6}
        blur={10}
        displace={2}
        className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${busy ? "opacity-50" : "opacity-100"}`}
      >
        {/* 移动端两行 / sm 起单行（实测 375px：select 宽度由最宽 option「Jupyter Notebook」撑到 116px，单行自然宽 ~400px > 343px 可用，塞不下——保留两行） */}
        <div className="flex w-full flex-col gap-3 px-3 py-1 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label="时间周期" className="flex items-center gap-1 self-start">
            {SINCE_TABS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                data-active={filters.since === value}
                aria-pressed={filters.since === value}
                onClick={() => apply({ ...filters, since: value })}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ease-out hover:bg-zinc-100/70 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:hover:bg-white/5 dark:focus-visible:ring-accent-dark ${
                  filters.since === value
                    ? "font-semibold text-accent dark:text-accent-dark"
                    : "text-zinc-500 hover:text-ink dark:text-zinc-400 dark:hover:text-ink-dark"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1 self-start sm:self-auto">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">语言</span>
            <span className="relative inline-flex">
              <select
                value={filters.lang}
                onChange={(e) => apply({ ...filters, lang: e.target.value })}
                className="appearance-none rounded-full bg-transparent py-1.5 pl-2 pr-8 text-sm text-ink transition-colors duration-150 ease-out hover:bg-zinc-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none dark:text-ink-dark dark:hover:bg-white/5 dark:focus-visible:ring-accent-dark"
              >
                <option value="">全部语言</option>
                {languages.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </span>
          </label>
        </div>
      </GlassSurface>
    </div>
  );
}
