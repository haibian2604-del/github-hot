import type { Since } from "@/lib/trending";

export const SINCE_LABELS: Record<Since, string> = {
  daily: "今天",
  weekly: "本周",
  monthly: "本月",
};

export function changeLabel(since: Since): string {
  return SINCE_LABELS[since];
}

function trimOne(v: number): string {
  const s = v >= 100 ? Math.round(v).toString() : v.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) return `${trimOne(n / 1000)}k`;
  return `${trimOne(n / 1_000_000)}M`;
}
