import { CardSkeleton } from "@/components/skeletons";

// 与 FilterBar 同构：白色浮动胶囊（rounded-2xl，sm 起全胶囊），左侧周期 tab 短块，右侧语言 select 块
function FilterBarSkeleton() {
  return (
    <div className="mx-auto mt-3 flex max-w-5xl flex-col gap-3 rounded-2xl border border-line/70 bg-white/90 py-2 pl-5 pr-2 shadow-[0_10px_30px_-15px_rgba(24,24,27,0.25)] sm:flex-row sm:items-center sm:justify-between sm:rounded-full dark:border-line-dark/60 dark:bg-surface-dark/90 dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-1">
        <div className="h-8 w-14 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
        <div className="h-8 w-14 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
        <div className="h-8 w-14 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
      </div>
      <div className="h-8 w-32 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4" aria-hidden="true">
      <FilterBarSkeleton />
      <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
