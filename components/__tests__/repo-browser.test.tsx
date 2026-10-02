import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepoBrowser from "@/components/repo-browser";
import { changeLabel } from "@/lib/format";
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

  it("keeps the cache-hit selection when an in-flight miss resolves late", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("daily-repo")]);
    // miss 到 weekly，保持在途不 resolve
    let resolveMiss: (v: unknown) => void = () => {};
    mockFetch.mockReturnValueOnce(new Promise((resolve) => { resolveMiss = resolve; }));
    await user.click(screen.getByRole("button", { name: "本周" }));
    // pending 期间点击缓存命中的键：界面立即切回 daily
    await user.click(screen.getByRole("button", { name: "今天" }));
    expect(screen.getByText("daily-repo")).toBeInTheDocument();
    // 迟到的 weekly 响应返回：不得把界面或 URL 拉回 weekly
    resolveMiss(okResponse([repo("weekly-repo")]));
    await act(async () => {});
    expect(screen.queryByText("weekly-repo")).not.toBeInTheDocument();
    expect(screen.getByText("daily-repo")).toBeInTheDocument();
    expect(window.location.search).toBe("?since=daily");
  });

  it("shows a result summary line above the list on initial render", () => {
    setup({ lang: "", since: "daily" }, [repo("alpha"), repo("beta")]);
    // 摘要行拆为左右两 span：左 = 周期·语言，右 = mono 计数
    expect(screen.getByText(`${changeLabel("daily")} · 全部语言`)).toBeInTheDocument();
    expect(screen.getByText("2 个仓库")).toBeInTheDocument();
  });

  it("updates the summary line with the selected language label and count after a language switch", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("all-daily")]);
    mockFetch.mockResolvedValueOnce(okResponse([repo("py-a"), repo("py-b"), repo("py-c")]));
    await user.selectOptions(screen.getByRole("combobox"), "python");
    await waitFor(() => {
      expect(screen.getByText(`${changeLabel("daily")} · Python`)).toBeInTheDocument();
      expect(screen.getByText("3 个仓库")).toBeInTheDocument();
    });
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

describe("RepoBrowser idle prefetch and pending skeleton", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  // RTL 16 的 asyncWrapper 在返回前会安排一个 setTimeout(0) 排水微任务，但只有检测到
  // jest 全局（faked setTimeout 上的 clock 属性 vitest 同样会挂）才会自行 advance。
  // vitest 不定义 jest 全局 → 不 advance → await user.click 永久挂起。
  // 给它补一个最小 jest 兼容垫片（vi.advanceTimersByTime 与 jest 签名一致），
  // 仅本 describe 生效；shouldAdvanceTime 保持关闭，预热阈值仍是确定性推进。
  beforeAll(() => {
    (globalThis as { jest?: unknown }).jest = { advanceTimersByTime: vi.advanceTimersByTime };
  });

  afterAll(() => {
    delete (globalThis as { jest?: unknown }).jest;
  });

  beforeEach(() => {
    push.mockReset();
    mockFetch.mockReset();
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    vi.useRealTimers();
    pushStateSpy.mockRestore();
    window.history.replaceState(null, "", "/");
  });

  it("idle-prefetches the other periods once, cache-write only, so first click needs zero fetches", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch
      .mockResolvedValueOnce(okResponse([repo("weekly-repo")]))
      .mockResolvedValueOnce(okResponse([repo("monthly-repo")]));
    setup({ lang: "", since: "daily" }, [repo("daily-repo")]);

    expect(mockFetch).not.toHaveBeenCalled();

    // 越过空闲预热阈值：weekly 与 monthly 各静默预取一次（daily 已播种，跳过）
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    await act(async () => {}); // 冲刷预取响应的微任务

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith("/api/trending?since=weekly");
    expect(mockFetch).toHaveBeenCalledWith("/api/trending?since=monthly");
    expect(mockFetch).not.toHaveBeenCalledWith("/api/trending?since=daily");
    // 预热只写缓存：不切列表、不碰 URL
    expect(screen.getByText("daily-repo")).toBeInTheDocument();
    expect(screen.queryByText("weekly-repo")).not.toBeInTheDocument();
    expect(pushStateSpy).not.toHaveBeenCalled();

    // 首次点击 本周：纯缓存命中，零额外请求
    await user.click(screen.getByRole("button", { name: "本周" }));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(screen.getByText("weekly-repo")).toBeInTheDocument();
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", buildFilterPath({ lang: "", since: "weekly" }));
  });

  it("shows card skeletons while a pending miss fetch is in flight, then the new list", async () => {
    const user = userEvent.setup();
    setup({ lang: "", since: "daily" }, [repo("daily-repo")]);
    // miss 到 weekly，保持在途不 resolve（与竞态测试相同的可控 promise 模式）
    let resolveMiss: (v: unknown) => void = () => {};
    mockFetch.mockReturnValueOnce(new Promise((resolve) => { resolveMiss = resolve; }));

    await user.click(screen.getByRole("button", { name: "本周" }));

    // pending 期间：两列骨架屏替代旧列表
    expect(screen.getAllByTestId("card-skeleton")).toHaveLength(6);
    expect(screen.queryByText("daily-repo")).not.toBeInTheDocument();

    resolveMiss(okResponse([repo("weekly-repo")]));
    await waitFor(() => expect(screen.getByText("weekly-repo")).toBeInTheDocument());
    expect(screen.queryByTestId("card-skeleton")).not.toBeInTheDocument();
  });
});
