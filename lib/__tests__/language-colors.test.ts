import { describe, it, expect } from "vitest";
import { getLanguageColor } from "@/lib/language-colors";

describe("getLanguageColor", () => {
  it("returns mapped color for known languages", () => {
    expect(getLanguageColor("TypeScript")).toBe("#3178c6");
    expect(getLanguageColor("Python")).toBe("#3572A5");
  });
  it("returns neutral gray for unknown or empty languages", () => {
    expect(getLanguageColor("Klingon")).toBe("#8b949e");
    expect(getLanguageColor("")).toBe("#8b949e");
    expect(getLanguageColor(undefined)).toBe("#8b949e");
  });
});
