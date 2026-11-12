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
    <li className="repo-entry">
      <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer" className="repo-link group">
        <span className="repo-rank tnum">{rank}</span>
        <span className="min-w-0 flex flex-1 flex-col">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="repo-owner">{repo.owner} /</span>
              <span className="repo-name">{repo.name}</span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="repo-arrow"><path d="M6 18 18 6M6 6h12v12" /></svg>
          </span>
          <span className="repo-description">{repo.description || "暂无描述"}</span>
          <span className="repo-meta">
            {repo.language && (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />
                {repo.language}
              </span>
            )}
            <span className="inline-flex items-center gap-1" title="Stars">
              <StarIcon /><span className="sr-only">Stars </span><span className="tnum">{formatCompactNumber(repo.stars)}</span>
            </span>
            <span className="inline-flex items-center gap-1" title="Forks">
              <ForkIcon /><span className="sr-only">Forks </span><span className="tnum">{formatCompactNumber(repo.forks)}</span>
            </span>
            <span className="repo-gain tnum" title={`${changeLabel(since)}新增 Stars`}>
              <span className="sr-only">{changeLabel(since)}</span>{" "}+{formatCompactNumber(repo.change)}
            </span>
          </span>
          {repo.contributors.length > 0 && (
            <span className="repo-contributors">
              <span className="flex -space-x-1.5">
                {repo.contributors.slice(0, 5).map((c) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={c.username} src={c.avatar} alt={c.username} loading="lazy" className="h-5 w-5 rounded-full ring-2 ring-canvas dark:ring-canvas-dark" />
                ))}
              </span>
              <span>贡献者</span>
            </span>
          )}
        </span>
      </a>
    </li>
  );
}
