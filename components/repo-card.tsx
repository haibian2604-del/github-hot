"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Since, TrendingRepo } from "@/lib/trending";
import { changeLabel, formatCompactNumber } from "@/lib/format";
import { getLanguageColor } from "@/lib/language-colors";

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
      <polygon points="8,1.65 9.68,6.09 14.42,6.31 10.71,9.28 11.97,13.86 8,11.25 4.03,13.86 5.29,9.28 1.58,6.31 6.32,6.09" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <circle cx="4.5" cy="3.5" r="1.75" />
      <circle cx="11.5" cy="3.5" r="1.75" />
      <circle cx="8" cy="12.5" r="1.75" />
      <path d="M4.5 5.25v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-1" />
      <path d="M8 8.25v2.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mt-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ease-out motion-reduce:transition-none dark:text-gray-500 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

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
  const panelId = useId();

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
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none hover:border-gray-300 hover:shadow-md hover:shadow-gray-900/5 dark:border-ghline dark:bg-ghcard dark:hover:border-[#484f58] dark:hover:shadow-black/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full rounded-[inherit] px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <span
            className={`w-12 shrink-0 text-right text-3xl font-light leading-none tabular-nums sm:w-14 sm:text-4xl ${
              rank <= 3 ? "text-[#0969da] dark:text-[#4493f8]" : "text-gray-500"
            }`}
          >
            {rank}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-gray-500 dark:text-gray-400">{repo.owner} /</span>
            <span className="mt-0.5 block truncate text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {repo.name}
            </span>
            <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {repo.description || "暂无描述"}
            </span>

            <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {repo.language && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                  />
                  {repo.language}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <StarIcon />
                {formatCompactNumber(repo.stars)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ForkIcon />
                {formatCompactNumber(repo.forks)}
              </span>
              <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 font-medium text-green-700 dark:bg-[#3fb950]/10 dark:text-[#3fb950]">
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
                      className={`h-5 w-5 rounded-full ring-2 ring-white dark:ring-ghcard ${
                        i >= 3 ? "hidden sm:block" : ""
                      }`}
                    />
                  ))}
                </span>
              )}
            </span>
          </span>

          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div
          id={panelId}
          className="grid grid-rows-[1fr] motion-safe:animate-[repo-card-expand_180ms_ease-out]"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-ghline dark:bg-white/[0.04]">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {repo.description || "暂无描述"}
              </p>

              {repo.contributors.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    贡献者
                  </h3>
                  <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                    {repo.contributors.map((c) => (
                      <li key={c.username}>
                        <a
                          href={`https://github.com/${c.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-gray-700 underline-offset-2 hover:text-[#0969da] hover:underline dark:text-gray-300 dark:hover:text-[#4493f8]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.avatar}
                            alt=""
                            loading="lazy"
                            className="h-5 w-5 rounded-full ring-1 ring-gray-200 dark:ring-ghline"
                          />
                          {c.username}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <a
                  href={repo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[#1a7f37] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#116329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a7f37] focus-visible:ring-offset-1 dark:bg-[#238636] dark:hover:bg-[#2ea043] dark:focus-visible:ring-[#3fb950] dark:focus-visible:ring-offset-ghcard"
                >
                  在 GitHub 打开
                </a>
                <a
                  href={`${repo.repoUrl}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-400 hover:bg-white dark:border-ghline dark:text-gray-300 dark:hover:border-[#484f58] dark:hover:bg-white/[0.06]"
                >
                  查看 Issues
                </a>
                <button
                  type="button"
                  onClick={copyClone}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-400 hover:bg-white dark:border-ghline dark:text-gray-300 dark:hover:border-[#484f58] dark:hover:bg-white/[0.06]"
                >
                  <CopyIcon />
                  {copied ? "已复制 ✓" : "复制 clone 命令"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
