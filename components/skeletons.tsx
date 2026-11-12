export function CardSkeleton() {
  return (
    <li data-testid="card-skeleton" className="repo-entry py-7" aria-hidden="true">
      <div className="flex gap-4 sm:gap-5">
        <div className="skeleton h-5 w-6 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-6 w-2/3" />
          <div className="space-y-2 py-1"><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-3/4" /></div>
          <div className="flex gap-4 pt-2"><div className="skeleton h-3 w-20" /><div className="skeleton h-3 w-12" /><div className="skeleton ml-auto h-3 w-12" /></div>
        </div>
      </div>
    </li>
  );
}
