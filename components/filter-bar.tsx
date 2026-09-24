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
      className={`sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-200 bg-white/95 px-1 py-3 backdrop-blur transition-opacity duration-200 ease-out motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between dark:border-[#30363d] dark:bg-[#161b22]/95 ${
        pending ? "opacity-50" : "opacity-100"
      }`}
      aria-busy={pending}
    >
      <div
        role="group"
        aria-label="时间周期"
        className="inline-flex self-start rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-[#30363d] dark:bg-[#0d1117]"
      >
        {SINCE_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            data-active={filters.since === value}
            onClick={() => apply({ ...filters, since: value })}
            className={`rounded-md px-3 py-1 text-sm transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 ${
              filters.since === value
                ? "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900"
                : "text-gray-700 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        语言
        <span className="relative inline-flex">
          <select
            value={filters.lang}
            onChange={(e) => apply({ ...filters, lang: e.target.value })}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-2.5 pr-8 text-sm text-gray-900 transition-colors duration-150 ease-out hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 motion-reduce:transition-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-gray-100 dark:hover:border-gray-500 dark:focus-visible:ring-gray-500"
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
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </label>
    </div>
  );
}
