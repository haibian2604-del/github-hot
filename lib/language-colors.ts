const NEUTRAL = "#8b949e";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Zig: "#ec915c",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  "Jupyter Notebook": "#DA5B0B",
  MDX: "#fcb32c",
  "Objective-C": "#438eff",
  PowerShell: "#012456",
  R: "#198CE7",
  Perl: "#0298c3",
};

export function getLanguageColor(lang: string | undefined): string {
  if (!lang) return NEUTRAL;
  return LANGUAGE_COLORS[lang] ?? NEUTRAL;
}
