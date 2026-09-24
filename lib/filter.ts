import { DEFAULT_SINCE, isSince, type Since } from "@/lib/trending";

export interface FilterState {
  lang: string;
  since: Since;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): FilterState {
  const langRaw = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const sinceRaw = Array.isArray(sp.since) ? sp.since[0] : sp.since;
  return { lang: langRaw ?? "", since: isSince(sinceRaw) ? sinceRaw : DEFAULT_SINCE };
}

export function buildFilterPath(f: FilterState): string {
  const params = new URLSearchParams();
  if (f.lang) params.set("lang", f.lang);
  params.set("since", f.since);
  return `/?${params.toString()}`;
}
