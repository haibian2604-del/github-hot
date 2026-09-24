// 骨架屏原语：与 app/loading.tsx（首屏 SSR loading）和 RepoBrowser 的
// 客户端 pending 态共用，保证「加载中」的形状在任何触发路径下一致。
export function CardSkeleton() {
  return (
    <li
      data-testid="card-skeleton"
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-ghline dark:bg-ghcard"
    >
      {/* 与 RepoCard 同构：大排名 / 身份行（owner+名称+描述）/ 元信息行 / chevron */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-8 w-12 shrink-0 animate-pulse motion-reduce:animate-none rounded bg-gray-200 sm:h-9 sm:w-14 dark:bg-gray-700" />

        <div className="min-w-0 flex-1">
          {/* 身份行 */}
          <div className="h-3 w-24 animate-pulse motion-reduce:animate-none rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-6 w-2/3 animate-pulse motion-reduce:animate-none rounded bg-gray-200 dark:bg-gray-700" />
          {/* 描述两行 */}
          <div className="mt-3 h-4 w-full animate-pulse motion-reduce:animate-none rounded bg-gray-100 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-3/4 animate-pulse motion-reduce:animate-none rounded bg-gray-100 dark:bg-gray-800" />
          {/* 元信息行：语言点+星标/复刻/增量 chip */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-3.5 w-20 animate-pulse motion-reduce:animate-none rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3.5 w-14 animate-pulse motion-reduce:animate-none rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3.5 w-14 animate-pulse motion-reduce:animate-none rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>

        <div className="h-4 w-4 shrink-0 animate-pulse motion-reduce:animate-none rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </li>
  );
}
