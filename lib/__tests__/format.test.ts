import { describe, it, expect } from "vitest";
import { formatCompactNumber, changeLabel } from "@/lib/format";

describe("formatCompactNumber", () => {
  it("keeps numbers below 1000 as-is", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(950)).toBe("950");
  });
  it("abbreviates thousands with one decimal", () => {
    expect(formatCompactNumber(36726)).toBe("36.7k");
    expect(formatCompactNumber(8386)).toBe("8.4k");
    expect(formatCompactNumber(1000)).toBe("1k");
    expect(formatCompactNumber(999_999)).toBe("999k");
  });
  it("abbreviates millions", () => {
    expect(formatCompactNumber(1234567)).toBe("1.2M");
    expect(formatCompactNumber(3_000_000)).toBe("3M");
    expect(formatCompactNumber(1_000_000)).toBe("1M");
  });
  it("falls back to 0 on invalid input", () => {
    expect(formatCompactNumber(Number.NaN)).toBe("0");
    expect(formatCompactNumber(-5)).toBe("0");
  });
});

describe("changeLabel", () => {
  it("maps since to chinese label", () => {
    expect(changeLabel("daily")).toBe("今天");
    expect(changeLabel("weekly")).toBe("本周");
    expect(changeLabel("monthly")).toBe("本月");
  });
});
