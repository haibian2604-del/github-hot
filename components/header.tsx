export default function SiteHeader() {
  return (
    <header className="border-b border-line bg-white dark:border-line-dark dark:bg-surface-dark">
      <div className="mx-auto flex max-w-5xl flex-col gap-y-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          GitHub Hot
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-5 w-5 shrink-0" fill="#f66a0a">
            <path d="M7.998 14.5c2.832 0 5-1.98 5-4.5 0-1.463-.68-2.19-1.879-3.383l-.036-.037c-1.013-1.008-2.3-2.29-2.834-4.434-.322.256-.63.579-.864.953-.432.696-.621 1.58-.046 2.73.473.947.67 2.284-.278 3.232-.61.61-1.545.84-2.403.633a2.056 2.056 0 0 1-.418-.148.379.379 0 0 0-.38.063c-.242.197-.516.377-.79.515-.6.303-1.28.83-1.178 1.727.085.744.59 1.35 1.175 1.75.63.436 1.428.752 2.33.752Z" />
          </svg>
        </h1>
        <a
          href="https://github.com/doforce/github-trending"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 transition-colors duration-150 ease-out hover:text-zinc-600 motion-reduce:transition-none dark:hover:text-zinc-300"
        >
          数据来源：doforce/github-trending
        </a>
      </div>
    </header>
  );
}
