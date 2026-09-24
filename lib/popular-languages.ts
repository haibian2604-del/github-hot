import type { LanguageOption } from "@/lib/trending";

// 热门语言白名单：筛选下拉只展示这些（顺序即展示顺序，按流行度策展）。
// 标签与 lib/language-colors.ts 的 LANGUAGE_COLORS 键一一对应（颜色点同源）。
export const POPULAR_LANGUAGE_LABELS = [
  "TypeScript", "Python", "JavaScript", "Java", "Go", "Rust", "C++", "C", "C#",
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Shell", "HTML", "CSS", "Vue",
  "Svelte", "Jupyter Notebook", "Zig", "Lua", "Elixir", "Haskell", "Scala",
  "MDX", "Objective-C", "PowerShell", "R", "Perl",
] as const;

export function toPopularLanguages(all: LanguageOption[]): LanguageOption[] {
  return POPULAR_LANGUAGE_LABELS.flatMap((label) => {
    const match = all.find((l) => l.label === label);
    return match ? [{ label: match.label, key: match.key }] : [];
  });
}
