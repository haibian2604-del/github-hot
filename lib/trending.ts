const API_BASE = "https://trend.doforce.dpdns.org";
const FETCH_TIMEOUT_MS = 8_000;
const TRENDING_REVALIDATE_S = 3600;
const LANGUAGES_REVALIDATE_S = 86_400;

export type Since = "daily" | "weekly" | "monthly";
export const SINCE_VALUES: Since[] = ["daily", "weekly", "monthly"];
export const DEFAULT_SINCE: Since = "daily";

export interface Contributor {
  username: string;
  avatar: string;
}

export interface TrendingRepo {
  owner: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  change: number;
  contributors: Contributor[];
  repoUrl: string;
}

export interface LanguageOption {
  label: string;
  key: string;
}

interface RawContributor {
  avatar?: unknown;
  by?: unknown;
}

interface RawRepo {
  repo?: unknown;
  desc?: unknown;
  lang?: unknown;
  stars?: unknown;
  forks?: unknown;
  build_by?: unknown;
  change?: unknown;
}

export function parseRepoPath(path: unknown): { owner: string; name: string } | null {
  if (typeof path !== "string") return null;
  const parts = path.replace(/^\/+/, "").split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { owner: parts[0], name: parts[1] };
}

function toCount(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
}

export function normalizeRepos(list: unknown): TrendingRepo[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((raw) => {
    const r = (raw ?? {}) as RawRepo;
    const parsed = parseRepoPath(r.repo);
    if (!parsed) return [];
    const contributors = Array.isArray(r.build_by)
      ? (r.build_by as RawContributor[]).flatMap((c) => {
          const username = typeof c?.by === "string" ? c.by.replace(/^\/+/, "") : "";
          const avatar = typeof c?.avatar === "string" ? c.avatar : "";
          return username && avatar ? [{ username, avatar }] : [];
        })
      : [];
    return [
      {
        owner: parsed.owner,
        name: parsed.name,
        description: typeof r.desc === "string" ? r.desc : "",
        language: typeof r.lang === "string" ? r.lang : "",
        stars: toCount(r.stars),
        forks: toCount(r.forks),
        change: toCount(r.change),
        contributors,
        repoUrl: `https://github.com/${parsed.owner}/${parsed.name}`,
      },
    ];
  });
}

export function isSince(v: string | undefined | null): v is Since {
  return !!v && (SINCE_VALUES as string[]).includes(v);
}

async function getJson(path: string, revalidate: number): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`上游 API 异常：HTTP ${res.status}`);
  return res.json();
}

export async function fetchTrending(opts: { lang?: string; since?: Since } = {}): Promise<TrendingRepo[]> {
  const params = new URLSearchParams();
  if (opts.lang) params.set("lang", opts.lang);
  params.set("since", opts.since ?? DEFAULT_SINCE);
  const list = await getJson(`/repo?${params.toString()}`, TRENDING_REVALIDATE_S);
  return normalizeRepos(list);
}

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const list = await getJson("/lang", LANGUAGES_REVALIDATE_S);
  if (!Array.isArray(list)) return [];
  return list
    .flatMap((item) => {
      const l = (item ?? {}) as Record<string, unknown>;
      return typeof l.label === "string" && typeof l.key === "string" ? [{ label: l.label, key: l.key }] : [];
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}
