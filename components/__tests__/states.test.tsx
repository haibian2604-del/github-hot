import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/states";
import RepoList from "@/components/repo-list";
import type { TrendingRepo } from "@/lib/trending";

describe("EmptyState", () => {
  it("mentions the language and offers view-all link", () => {
    render(<EmptyState lang="python" />);
    expect(screen.getByText(/python/u)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看全部语言热门" })).toHaveAttribute("href", "/");
  });
});

describe("RepoList", () => {
  it("renders ranked cards", () => {
    const repo: TrendingRepo = {
      owner: "vercel",
      name: "next.js",
      description: "The React Framework",
      language: "JavaScript",
      stars: 100000,
      forks: 20000,
      change: 300,
      contributors: [],
      repoUrl: "https://github.com/vercel/next.js",
    };
    render(<RepoList repos={[repo, { ...repo, name: "another", owner: "a", change: 210 }]} since="daily" />);
    expect(screen.getByText("next.js")).toBeInTheDocument();
    expect(screen.getByText("今天 +300")).toBeInTheDocument();
  });
});
