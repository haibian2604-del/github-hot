import Link from "next/link";

export function EmptyState({ lang }: { lang: string }) {
  return (
    <div
      role="status"
      className="state-panel"
    >
      <p className="muted text-sm">
        {lang ? `语言「${lang}」在此周期暂无 trending 数据。` : "此周期暂无 trending 数据。"}
      </p>
      <p className="mt-1 muted text-xs">
        上游数据每天更新，稍后再来看看，或换个语言/周期。
      </p>
      <Link
        href="/"
        className="state-action"
      >
        查看全部语言热门
      </Link>
    </div>
  );
}
