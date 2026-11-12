import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-width flex items-center justify-between gap-4 py-6 sm:py-7">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="brand-mark" aria-hidden="true">
            <Image src="/logo.svg" alt="" width={40} height={40} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">GitHub Hot</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
