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
    <div className="filter-bar" aria-busy={busy}>
      <div role="group" aria-label="时间周期" className="flex shrink-0 gap-1">
        {SINCE_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            data-active={filters.since === value}
            aria-pressed={filters.since === value}
            onClick={() => apply({ ...filters, since: value })}
            className="period-button"
          >
            {label}
          </button>
        ))}
      </div>
      <label className="language-filter">
        <span className="muted text-xs">语言</span>
        <span className="relative inline-flex min-w-0">
          <select value={filters.lang} onChange={(e) => apply({ ...filters, lang: e.target.value })} className="language-select">
            <option value="">全部语言</option>
            {languages.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </label>
    </div>
  );
}
