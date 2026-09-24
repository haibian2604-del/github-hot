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
    <li className="h-full">
      <a
        href={repo.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col overflow-hidden rounded-lg border bg-white px-4 py-4 text-left transition-shadow duration-200 ease-out hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 dark:border-ghline dark:bg-ghcard dark:focus-visible:ring-gray-500 dark:hover:shadow-black/40"
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
          </span>
        </div>

        <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {repo.description || "暂无描述"}
        </span>

        <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2.5 text-xs tabular-nums text-gray-500 dark:text-gray-400">
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
            <span className="flex -space-x-1.5 sm:ml-auto">
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
      </a>
    </li>
  );
}
