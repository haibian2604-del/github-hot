import { NextResponse } from "next/server";
import { fetchTrending, isSince, DEFAULT_SINCE } from "@/lib/trending";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // lang 不做白名单：上游对未知 lang 返回 []，与首页 RSC 的直连行为保持一致
  const lang = searchParams.get("lang") ?? "";
  const sinceParam = searchParams.get("since");
  const since = isSince(sinceParam) ? sinceParam : DEFAULT_SINCE;
  try {
    const repos = await fetchTrending({ lang: lang || undefined, since });
    return NextResponse.json(repos);
  } catch {
    // 上游失败不透传细节，统一 502，交由客户端回落 SSR 错误链路
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }
}
