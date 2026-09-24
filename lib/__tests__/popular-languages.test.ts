import { describe, expect, it } from "vitest";

import { POPULAR_LANGUAGE_LABELS, toPopularLanguages } from "@/lib/popular-languages";
import type { LanguageOption } from "@/lib/trending";

const ALL: LanguageOption[] = [
  { label: "ABAP", key: "abap" },
  { label: "Python", key: "python" },
  { label: "TypeScript", key: "typescript" },
  { label: "Zig", key: "zig" },
  { label: "OCaml", key: "ocaml" },
  { label: "Perl", key: "perl" },
];

describe("toPopularLanguages", () => {
  it("只保留白名单内的热门语言，丢弃非热门项", () => {
    const result = toPopularLanguages(ALL);
    expect(result.every((l) => POPULAR_LANGUAGE_LABELS.includes(l.label as never))).toBe(true);
    expect(result.some((l) => l.label === "ABAP")).toBe(false);
    expect(result.some((l) => l.label === "OCaml")).toBe(false);
  });

  it("按 POPULAR_LANGUAGE_LABELS 的流行度序输出，不随全量列表顺序", () => {
    const result = toPopularLanguages(ALL);
    expect(result[0]).toEqual({ label: "TypeScript", key: "typescript" });
    expect(result[1]).toEqual({ label: "Python", key: "python" });
    const idx = (label: string) => POPULAR_LANGUAGE_LABELS.indexOf(label as never);
    expect(result.map((l) => l.label)).toEqual([...result].map((l) => l.label).sort((a, b) => idx(a) - idx(b)));
  });

  it("label 匹配项保留上游 key", () => {
    const result = toPopularLanguages(ALL);
    expect(result.find((l) => l.label === "Python")?.key).toBe("python");
    expect(result.find((l) => l.label === "Zig")?.key).toBe("zig");
  });

  it("全量列表缺失某热门语言时丢弃该项且不报错", () => {
    const withoutPerl: LanguageOption[] = ALL.filter((l) => l.label !== "Perl");
    const result = toPopularLanguages(withoutPerl);
    expect(result.some((l) => l.label === "Perl")).toBe(false);
    expect(result.every((l) => l.label !== "Perl")).toBe(true);
  });

  it("空输入返回空数组", () => {
    expect(toPopularLanguages([])).toEqual([]);
  });
});
