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
    <main className="mx-auto max-w-5xl px-4 pb-12">
      <RepoBrowser initialFilters={{ ...filters, lang }} initialRepos={repos} languages={languages} />
    </main>
  );
}
