import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchTrending = vi.fn();

vi.mock("@/lib/trending", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/trending")>();
  return { ...actual, fetchTrending: (...args: Parameters<typeof actual.fetchTrending>) => fetchTrending(...args) };
});

import { GET } from "@/app/api/trending/route";

function requestAt(query: string): Request {
  return new Request(`http://localhost:3000/api/trending${query}`);
}

describe("GET /api/trending", () => {
  beforeEach(() => {
    fetchTrending.mockReset();
  });

  it("returns 200 JSON array and passes parsed lang/since to fetchTrending", async () => {
    fetchTrending.mockResolvedValue([{ owner: "a", name: "b" }]);
    const res = await GET(requestAt("?lang=python&since=weekly"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ owner: "a", name: "b" }]);
    expect(fetchTrending).toHaveBeenCalledWith({ lang: "python", since: "weekly" });
  });

  it("returns 502 when fetchTrending rejects", async () => {
    fetchTrending.mockRejectedValue(new Error("upstream down"));
    const res = await GET(requestAt("?since=daily"));
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "upstream failed" });
  });

  it("falls back to daily when since is invalid", async () => {
    fetchTrending.mockResolvedValue([]);
    await GET(requestAt("?since=bogus"));
    expect(fetchTrending).toHaveBeenCalledWith({ lang: undefined, since: "daily" });
  });
});
