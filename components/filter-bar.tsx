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
    <div
      className={`sticky top-0 z-10 flex flex-col gap-3 border-b border-line bg-canvas/95 py-3 backdrop-blur transition-opacity duration-200 ease-out motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between dark:border-line-dark dark:bg-canvas-dark/95 ${
        busy ? "opacity-50" : "opacity-100"
      }`}
      aria-busy={busy}
    >
      <div role="group" aria-label="时间周期" className="flex items-end gap-5 self-start">
        {SINCE_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            data-active={filters.since === value}
            aria-pressed={filters.since === value}
            onClick={() => apply({ ...filters, since: value })}
            className={`relative px-1 pb-2 pt-1 text-sm transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-dark ${
              filters.since === value
                ? "font-medium text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:content-[''] dark:text-ink-dark dark:after:bg-accent-dark"
                : "text-zinc-500 hover:text-ink dark:text-zinc-400 dark:hover:text-ink-dark"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        语言
        <span className="relative inline-flex">
          <select
            value={filters.lang}
            onChange={(e) => apply({ ...filters, lang: e.target.value })}
            className="appearance-none rounded-lg border border-line bg-surface py-1.5 pl-2.5 pr-8 text-sm text-ink transition-colors duration-150 ease-out hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:hover:border-zinc-500 dark:focus-visible:ring-accent-dark"
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
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </label>
    </div>
  );
}
