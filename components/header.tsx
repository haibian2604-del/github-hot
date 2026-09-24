export default function SiteHeader() {
  return (
    <header className="border-b bg-white dark:bg-ghcard">
      <div className="mx-auto flex max-w-5xl flex-col gap-y-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">GitHub Hot 🔥</h1>
        <a
          href="https://github.com/doforce/github-trending"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          数据来源：doforce/github-trending
        </a>
      </div>
    </header>
  );
}
