import FilterBar from "@/components/filter-bar";
import RepoList from "@/components/repo-list";
import { EmptyState } from "@/components/states";
import { parseFilters } from "@/lib/filter";
import { fetchLanguages, fetchTrending } from "@/lib/trending";

export const revalidate = 3600;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const filters = parseFilters(searchParams ?? {});
  const languages = await fetchLanguages();

  // 语言参数白名单校验：非法值回落「全部语言」，防止构造异常 URL 打上游
  const lang = filters.lang === "" || languages.some((l) => l.key === filters.lang) ? filters.lang : "";
  const langLabel = languages.find((l) => l.key === lang)?.label ?? lang;
  const repos = await fetchTrending({ lang, since: filters.since });

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12">
      <FilterBar languages={languages} filters={{ ...filters, lang }} />
      <div className="mt-4">
        {repos.length === 0 ? (
          <EmptyState lang={langLabel} />
        ) : (
          <RepoList repos={repos} since={filters.since} />
        )}
      </div>
    </main>
  );
}
