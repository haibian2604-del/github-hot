import { CardSkeleton } from "@/components/skeletons";

function FilterBarSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-ghline">
      <div className="h-8 w-40 animate-pulse motion-reduce:animate-none rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-8 w-32 animate-pulse motion-reduce:animate-none rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4" aria-hidden="true">
      <FilterBarSkeleton />
      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
