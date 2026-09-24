import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepoBrowser from "@/components/repo-browser";
import { buildFilterPath } from "@/lib/filter";
import type { TrendingRepo } from "@/lib/trending";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  // useSearchParams 每次渲染读当前 location.search，模拟 App Router 的 URL 派生
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push }),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function repo(name: string): TrendingRepo {
  return {
    owner: "owner",
    name,
    description: `desc of ${name}`,
    language: "TypeScript",
    stars: 1000,
    forks: 100,
    change: 10,
    contributors: [],
    repoUrl: `https://github.com/owner/${name}`,
  };
}

function okResponse(payload: unknown) {
  return { ok: true, status: 200, json: async () => payload };
}

const languages = [{ label: "Python", key: "python" }];

function setup(initialFilters: { lang: string; since: "daily" | "weekly" | "monthly" }, initialRepos: TrendingRepo[]) {
  window.history.replaceState(null, "", buildFilterPath(initialFilters));
  return render(<RepoBrowser initialFilters={initialFilters} initialRepos={initialRepos} languages={languages} />);
}

describe("RepoBrowser", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    push.mockReset();
    mockFetch.mockReset();
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    window.history.replaceState(null, "", "/");
  });

  it("renders initialRepos on mount without calling fetch", () => {
    setup({ lang: "", since: "daily" }, [repo("initial-repo")]);
    expect(screen.getByText("initial-repo")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("serves a visited key from cache: no fetch, instant swap, pushState gets buildFilterPath", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("daily-repo")]);
    // 先访问 weekly（未命中 → fetch），再切回 daily（命中缓存）
    mockFetch.mockResolvedValueOnce(okResponse([repo("weekly-repo")]));
    await user.click(screen.getByRole("button", { name: "本周" }));
    await waitFor(() => expect(screen.getByText("weekly-repo")).toBeInTheDocument());
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", buildFilterPath({ lang: "", since: "weekly" }));

    await user.click(screen.getByRole("button", { name: "今天" }));
    expect(screen.getByText("daily-repo")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenLastCalledWith(null, "", buildFilterPath({ lang: "", since: "daily" }));
  });

  it("fetches same-origin proxy on cache miss, then serves revisit from cache without refetch", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("all-daily")]);
    mockFetch.mockResolvedValueOnce(okResponse([repo("py-repo")]));
    await user.selectOptions(screen.getByRole("combobox"), "python");
    await waitFor(() => expect(screen.getByText("py-repo")).toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledWith("/api/trending?lang=python&since=daily");

    // 再切回首个键（初始播种的缓存）：不二次 fetch
    await user.selectOptions(screen.getByRole("combobox"), "");
    expect(screen.getByText("all-daily")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to router.push SSR navigation when the proxy fetch rejects", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("stable")]);
    mockFetch.mockRejectedValueOnce(new Error("proxy down"));
    await user.click(screen.getByRole("button", { name: "本周" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(buildFilterPath({ lang: "", since: "weekly" })));
  });

  it("renders EmptyState when the proxy returns an empty list", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("before-empty")]);
    mockFetch.mockResolvedValueOnce(okResponse([]));
    await user.click(screen.getByRole("button", { name: "本周" }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "查看全部语言热门" })).toBeInTheDocument()
    );
  });
});
