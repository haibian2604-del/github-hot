import RepoCard from "@/components/repo-card";
import type { Since, TrendingRepo } from "@/lib/trending";

export default function RepoList({ repos, since }: { repos: TrendingRepo[]; since: Since }) {
  return (
    <ol className="space-y-3">
      {repos.map((repo, i) => (
        <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} rank={i + 1} since={since} />
      ))}
    </ol>
  );
}
