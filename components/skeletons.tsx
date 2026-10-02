// 骨架屏原语：与 app/loading.tsx（首屏 SSR loading）和 RepoBrowser 的
// 客户端 pending 态共用，保证「加载中」的形状在任何触发路径下一致。
export function CardSkeleton() {
  return (
    <li
      data-testid="card-skeleton"
      className="border-t border-line py-4 first:border-t-0 md:[&:nth-child(-n+2)]:border-t-0 dark:border-line-dark"
    >
      {/* 与 RepoCard 榜单行同构：排名块 / 身份行 / 两行描述 / 元信息行 */}
      <div className="flex items-start gap-3">
        <div className="h-8 w-12 shrink-0 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />

        <div className="min-w-0 flex-1">
          {/* 身份行 */}
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
          <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
          {/* 描述两行 */}
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
          {/* 元信息行：语言点+星标/复刻/增量 chip */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
            <div className="h-3.5 w-14 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
            <div className="h-3.5 w-14 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </li>
  );
}
