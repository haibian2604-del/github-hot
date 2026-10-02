import Link from "next/link";

export function EmptyState({ lang }: { lang: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-line bg-white/50 px-6 py-12 text-center dark:border-line-dark dark:bg-white/[0.02]"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {lang ? `语言「${lang}」在此周期暂无 trending 数据。` : "此周期暂无 trending 数据。"}
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        上游数据每天更新，稍后再来看看，或换个语言/周期。
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-md border border-accent/40 px-3 py-1.5 text-sm text-accent transition-colors duration-150 ease-out hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none dark:text-accent-dark dark:focus-visible:ring-accent-dark"
      >
        查看全部语言热门
      </Link>
    </div>
  );
}
