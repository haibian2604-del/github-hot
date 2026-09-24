import { describe, it, expect } from "vitest";
import { parseFilters, buildFilterPath } from "@/lib/filter";

describe("parseFilters", () => {
  it("parses valid lang and since", () => {
    expect(parseFilters({ lang: "python", since: "weekly" })).toEqual({ lang: "python", since: "weekly" });
  });
  it("falls back on invalid or missing params", () => {
    expect(parseFilters({})).toEqual({ lang: "", since: "daily" });
    expect(parseFilters({ since: "hourly" })).toEqual({ lang: "", since: "daily" });
    expect(parseFilters({ lang: ["python", "go"] })).toEqual({ lang: "python", since: "daily" });
  });
});

describe("buildFilterPath", () => {
  it("omits empty lang, always writes since", () => {
    expect(buildFilterPath({ lang: "", since: "daily" })).toBe("/?since=daily");
    expect(buildFilterPath({ lang: "python", since: "weekly" })).toBe("/?lang=python&since=weekly");
  });
});
