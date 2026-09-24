"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center dark:border-ghline dark:bg-ghcard">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">数据加载失败</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          无法从上游获取 trending 数据，请稍后重试。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out motion-reduce:transition-none hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-gray-500"
        >
          重试
        </button>
      </div>
    </main>
  );
}
