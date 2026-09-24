import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepoCard from "@/components/repo-card";
import type { TrendingRepo } from "@/lib/trending";

const repo: TrendingRepo = {
  owner: "anthropics",
  name: "financial-services",
  description: "Financial services workflows",
  language: "Python",
  stars: 36726,
  forks: 5361,
  change: 665,
  contributors: [
    { username: "mihilmy", avatar: "https://avatars.githubusercontent.com/u/5457787?s=40&v=4" },
  ],
  repoUrl: "https://github.com/anthropics/financial-services",
};

const writeText = vi.fn(async () => undefined);

// jsdom 30 + user-event 14：userEvent.setup() 会通过 defineProperty 把
// window.navigator.clipboard 换成它自己的 stub（发生在 beforeEach 之后），
// Object.assign / 直接 defineProperty 注入的 mock 都会被覆盖。
// 这里用 Proxy 包装原始 navigator：仅把 `clipboard` 固定为我们的 mock，
// 其余属性原样透传，并吸收 user-event 对 clipboard 的 defineProperty，
// 保证组件与断言始终读写同一个 writeText。
const realNavigator = window.navigator;

function stubbedNavigator() {
  return new Proxy(realNavigator, {
    get(target, prop) {
      if (prop === "clipboard") return { writeText };
      return Reflect.get(target, prop);
    },
    defineProperty(target, prop, desc) {
      if (prop === "clipboard") return true;
      return Reflect.defineProperty(target, prop, desc);
    },
  });
}

beforeEach(() => {
  vi.stubGlobal("navigator", stubbedNavigator());
  writeText.mockClear();
});

describe("RepoCard collapsed", () => {
  it("renders rank, name, description, language, stats and change", () => {
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    expect(screen.getByText("financial-services")).toBeInTheDocument();
    expect(screen.getByText(/anthropics/u)).toBeInTheDocument();
    expect(screen.getByText(/Financial services workflows/u)).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("36.7k")).toBeInTheDocument();
    expect(screen.getByText("本周 +665")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /financial-services/u })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows placeholder when description is empty", () => {
    render(<RepoCard repo={{ ...repo, description: "" }} rank={2} since="weekly" />);
    expect(screen.getByText("暂无描述")).toBeInTheDocument();
  });
});

describe("RepoCard expanded", () => {
  it("toggles details with contributors and links on click", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    expect(screen.getByRole("button", { name: /financial-services/u })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("mihilmy")).toHaveAttribute("href", "https://github.com/mihilmy");
    expect(screen.getByRole("link", { name: "在 GitHub 打开" })).toHaveAttribute(
      "href",
      "https://github.com/anthropics/financial-services"
    );
    expect(screen.getByRole("link", { name: "查看 Issues" })).toHaveAttribute(
      "href",
      "https://github.com/anthropics/financial-services/issues"
    );
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    expect(screen.queryByRole("link", { name: "在 GitHub 打开" })).not.toBeInTheDocument();
  });

  it("copies clone command and shows feedback", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    await user.click(screen.getByRole("button", { name: "复制 clone 命令" }));
    expect(writeText).toHaveBeenCalledWith("git clone https://github.com/anthropics/financial-services.git");
    expect(screen.getByText("已复制 ✓")).toBeInTheDocument();
  });

  it("renders external links with rel=noopener", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    await user.click(screen.getByRole("button", { name: /financial-services/u }));
    const link = screen.getByRole("link", { name: "在 GitHub 打开" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
