import { CardSkeleton } from "@/components/skeletons";

// 与新版 FilterBar 同构：左侧下划线文字 tab（三个短块），右侧原生 select 块
function FilterBarSkeleton() {
  return (
    <div className="flex items-end justify-between border-b border-line py-3 dark:border-line-dark">
      <div className="flex items-end gap-5">
        <div className="h-4 w-8 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
        <div className="h-4 w-8 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
        <div className="h-4 w-8 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
      </div>
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
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
