import { CardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="page-width pb-12" aria-hidden="true">
      <div className="page-heading"><div className="skeleton h-9 w-40" /><div className="skeleton h-4 w-56" /></div>
      <div className="filter-bar"><div className="flex gap-2"><div className="skeleton h-10 w-16" /><div className="skeleton h-10 w-16" /><div className="skeleton h-10 w-16" /></div><div className="skeleton h-10 w-32" /></div>
      <ul className="repo-grid mt-10">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</ul>
    </main>
  );
}
