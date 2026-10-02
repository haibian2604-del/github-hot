import RepoCard from "@/components/repo-card";
import type { Since, TrendingRepo } from "@/lib/trending";

export default function RepoList({ repos, since }: { repos: TrendingRepo[]; since: Since }) {
  return (
    // 弹性列：视口越宽列数越多（1/2/3/4），单列宽度始终落在舒适阅读区间，
    // 而不是把两列拉到超宽导致每行描述跨度过长
    <ol className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {repos.map((repo, i) => (
        <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} rank={i + 1} since={since} />
      ))}
    </ol>
  );
}
