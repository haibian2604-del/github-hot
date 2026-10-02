"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
    // 浮动胶囊：吸顶容器与胶囊合一（根元素需承载 aria-busy 契约），sticky top-0 直接贴顶，无全宽横带
    <div
      className={`mx-auto mt-3 flex max-w-5xl flex-col gap-3 rounded-2xl border border-line/70 bg-white/90 py-2 pl-5 pr-2 shadow-[0_10px_30px_-15px_rgba(24,24,27,0.25)] backdrop-blur transition-opacity duration-200 ease-out motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between sm:rounded-full dark:border-line-dark/60 dark:bg-surface-dark/90 dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] ${
        busy ? "opacity-50" : "opacity-100"
      }`}
      aria-busy={busy}
    >
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
  );
}
