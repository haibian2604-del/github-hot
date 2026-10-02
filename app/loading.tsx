import { CardSkeleton } from "@/components/skeletons";

// 与 FilterBar 同构：移动端两行 / sm 起单行的浮动胶囊。玻璃效果不在骨架中呈现，保留近似底色/边框/阴影；
// 圆角对齐 GlassSurface borderRadius=999 的实际钳制（移动端两行胶囊高 100px → 50px，sm 单行 56px → 全胶囊）。
function FilterBarSkeleton() {
  return (
    <div className="mx-auto mt-3 flex max-w-5xl flex-col gap-3 rounded-[50px] border border-line/70 bg-white/90 px-5 py-3 shadow-[0_10px_30px_-15px_rgba(24,24,27,0.25)] sm:flex-row sm:items-center sm:justify-between sm:rounded-full dark:border-line-dark/60 dark:bg-surface-dark/90 dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-1 self-start">
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
