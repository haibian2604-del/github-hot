import RepoCard from "@/components/repo-card";
import type { Since, TrendingRepo } from "@/lib/trending";

export default function RepoList({ repos, since }: { repos: TrendingRepo[]; since: Since }) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
      {repos.map((repo, i) => (
        <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} rank={i + 1} since={since} />
      ))}
    </ol>
  );
}
