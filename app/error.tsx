"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page-width py-8">
      <div className="state-panel">
        <h1 className="text-lg font-semibold text-ink dark:text-ink-dark">数据加载失败</h1>
        <p className="mt-2 text-sm muted">
          无法从上游获取 trending 数据，请稍后重试。
        </p>
        <button
          type="button"
          onClick={reset}
          className="state-action"
        >
          重试
        </button>
      </div>
    </main>
  );
}
