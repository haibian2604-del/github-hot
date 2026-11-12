import RepoBrowser from "@/components/repo-browser";
import { parseFilters } from "@/lib/filter";
import { toPopularLanguages } from "@/lib/popular-languages";
import { fetchLanguages, fetchTrending } from "@/lib/trending";

export const revalidate = 3600;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const filters = parseFilters(searchParams ?? {});
  const languages = toPopularLanguages(await fetchLanguages());

  // 语言参数白名单校验：非法值回落「全部语言」，防止构造异常 URL 打上游
  const lang = filters.lang === "" || languages.some((l) => l.key === filters.lang) ? filters.lang : "";
  const repos = await fetchTrending({ lang, since: filters.since });

  return (
    <main className="page-width pb-12">
      <div className="page-heading">
        <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">开源热榜<span className="text-accent dark:text-accent-dark">.</span></h2>
        <p className="muted text-sm">发现 GitHub 上值得关注的项目</p>
      </div>
      <RepoBrowser initialFilters={{ ...filters, lang }} initialRepos={repos} languages={languages} />
    </main>
  );
}
