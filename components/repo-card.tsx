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

export default function RepoCard({
  repo,
  rank,
  since,
}: {
  repo: TrendingRepo;
  rank: number;
  since: Since;
}) {
  return (
    // 榜单行：发丝线分隔替代卡片框。首行免顶部孤立 hairline 的 nth-child 前缀
    // 必须与 RepoList 在各断点的列数（1/2/3/4）同步：md 前 1 项、md 2 项、xl 3 项、2xl 4 项。
    <li className="h-full border-t border-line first:border-t-0 md:[&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+3)]:border-t-0 2xl:[&:nth-child(-n+4)]:border-t-0 dark:border-line-dark">
      <a
        href={repo.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group -mx-2 flex h-full flex-col rounded-md px-2 py-4 transition-colors duration-150 ease-out hover:bg-surface motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent dark:focus-visible:ring-accent-dark dark:hover:bg-surface-dark"
      >
        <span className="flex items-start gap-3">
          <span
            className={`tnum w-12 shrink-0 text-right text-3xl font-medium leading-none ${
              rank <= 3 ? "text-accent dark:text-accent-dark" : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {rank}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{repo.owner} /</span>
            <span className="mt-0.5 block truncate text-lg font-semibold tracking-tight text-ink transition-colors duration-150 group-hover:text-accent motion-reduce:transition-none dark:text-ink-dark dark:group-hover:text-accent-dark">
              {repo.name}
            </span>
          </span>
        </span>

        {/* 排名列宽 w-12(3rem) + gap-3(0.75rem) = 3.75rem，与身份行右缘对齐 */}
        <span className="mt-1.5 line-clamp-2 pl-[3.75rem] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {repo.description || "暂无描述"}
        </span>

        <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-[3.75rem] pt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
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
            <span className="tnum">{formatCompactNumber(repo.stars)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <ForkIcon />
            <span className="tnum">{formatCompactNumber(repo.forks)}</span>
          </span>
          <span className="tnum inline-flex items-center rounded-full bg-orange-100 px-1.5 py-0.5 font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-400">
            {changeLabel(since)} +{formatCompactNumber(repo.change)}
          </span>
          {repo.contributors.length > 0 && (
            <span className="flex -space-x-1.5 sm:ml-auto">
              {repo.contributors.slice(0, 5).map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.username}
                  src={c.avatar}
                  alt={c.username}
                  loading="lazy"
                  className={`h-5 w-5 rounded-full ring-2 ring-surface dark:ring-surface-dark ${
                    i >= 3 ? "hidden sm:block" : ""
                  }`}
                />
              ))}
            </span>
          )}
        </span>
      </a>
    </li>
  );
}
