"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center dark:border-line-dark dark:bg-surface-dark">
        <h1 className="text-lg font-semibold text-ink dark:text-ink-dark">数据加载失败</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          无法从上游获取 trending 数据，请稍后重试。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 motion-reduce:transition-none dark:bg-accent-dark dark:text-zinc-950 dark:focus-visible:ring-accent-dark"
        >
          重试
        </button>
      </div>
    </main>
  );
}
