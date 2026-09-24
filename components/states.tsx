import Link from "next/link";

export function EmptyState({ lang }: { lang: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-gray-300 bg-white/50 px-6 py-12 text-center dark:border-ghline dark:bg-white/[0.02]"
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {lang ? `语言「${lang}」在此周期暂无 trending 数据。` : "此周期暂无 trending 数据。"}
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        上游数据每天更新，稍后再来看看，或换个语言/周期。
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors duration-150 ease-out motion-reduce:transition-none hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-ghline dark:bg-transparent dark:text-gray-300 dark:hover:border-[#484f58] dark:focus-visible:ring-gray-500"
      >
        查看全部语言热门
      </Link>
    </div>
  );
}
