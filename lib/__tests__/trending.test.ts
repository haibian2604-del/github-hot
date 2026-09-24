import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseRepoPath,
  normalizeRepos,
  isSince,
  fetchTrending,
  fetchLanguages,
  DEFAULT_SINCE,
} from "@/lib/trending";

const SAMPLE_REPO = {
  repo: "/anthropics/financial-services",
  desc: "",
  lang: "Python",
  stars: 36726,
  forks: 5361,
  build_by: [{ avatar: "https://avatars.githubusercontent.com/u/5457787?s=40&v=4", by: "/mihilmy" }],
  change: 665,
};

describe("parseRepoPath", () => {
  it("parses leading-slash paths", () => {
    expect(parseRepoPath("/vercel/next.js")).toEqual({ owner: "vercel", name: "next.js" });
  });
  it("returns null for malformed input", () => {
    expect(parseRepoPath("just-a-name")).toBeNull();
    expect(parseRepoPath("/a/b/c")).toBeNull();
    expect(parseRepoPath(42)).toBeNull();
    expect(parseRepoPath(undefined)).toBeNull();
  });
});

describe("normalizeRepos", () => {
  it("maps raw api objects to TrendingRepo", () => {
    const repos = normalizeRepos([SAMPLE_REPO]);
    expect(repos).toHaveLength(1);
    expect(repos[0]).toEqual({
      owner: "anthropics",
      name: "financial-services",
      description: "",
      language: "Python",
      stars: 36726,
      forks: 5361,
      change: 665,
      contributors: [{ username: "mihilmy", avatar: "https://avatars.githubusercontent.com/u/5457787?s=40&v=4" }],
      repoUrl: "https://github.com/anthropics/financial-services",
    });
  });
  it("drops malformed entries and clamps bad numbers", () => {
    const repos = normalizeRepos([{ repo: "bad" }, { repo: "/ok/repo", stars: "x", build_by: "nope" }]);
    expect(repos).toHaveLength(1);
    expect(repos[0].stars).toBe(0);
    expect(repos[0].contributors).toEqual([]);
  });
  it("returns empty array for non-array input", () => {
    expect(normalizeRepos(null)).toEqual([]);
  });
});

describe("isSince", () => {
  it("validates since values", () => {
    expect(isSince("daily")).toBe(true);
    expect(isSince("hourly")).toBe(false);
    expect(isSince(undefined)).toBe(false);
  });
});

describe("fetchTrending", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([SAMPLE_REPO]), { status: 200 }))
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("requests /repo with lang and since and normalizes", async () => {
    const repos = await fetchTrending({ lang: "python", since: "weekly" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://trend.doforce.dpdns.org/repo?lang=python&since=weekly"),
      expect.objectContaining({ next: { revalidate: 3600 } })
    );
    expect(repos[0].owner).toBe("anthropics");
  });

  it("omits empty lang and defaults since to daily", async () => {
    await fetchTrending();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/repo\?since=daily$/),
      expect.anything()
    );
  });

  it("throws on non-200 so error.tsx can render", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    await expect(fetchTrending()).rejects.toThrow("HTTP 500");
  });
});

describe("fetchLanguages", () => {
  it("fetches /lang, keeps label/key pairs, sorts by label", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify([{ label: "Zig", key: "zig" }, { label: "ABAP", key: "abap" }, { bad: 1 }]), { status: 200 })
      )
    );
    const langs = await fetchLanguages();
    expect(langs).toEqual([
      { label: "ABAP", key: "abap" },
      { label: "Zig", key: "zig" },
    ]);
    expect(DEFAULT_SINCE).toBe("daily");
  });
});
