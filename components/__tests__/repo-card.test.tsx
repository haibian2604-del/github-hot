import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("RepoCard collapsed content", () => {
  it("renders rank, name, owner, description, language, stats and change", () => {
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("financial-services")).toBeInTheDocument();
    expect(screen.getByText(/anthropics/u)).toBeInTheDocument();
    expect(screen.getByText(/Financial services workflows/u)).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("36.7k")).toBeInTheDocument();
    expect(screen.getByText("本周 +665")).toBeInTheDocument();
  });

  it("shows placeholder when description is empty", () => {
    render(<RepoCard repo={{ ...repo, description: "" }} rank={2} since="weekly" />);
    expect(screen.getByText("暂无描述")).toBeInTheDocument();
  });
});

describe("RepoCard whole-card link", () => {
  it("renders the card as a direct GitHub link in a new tab", () => {
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    const link = screen.getByRole("link", { name: /financial-services/u });
    expect(link).toHaveAttribute("href", "https://github.com/anthropics/financial-services");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("RepoCard no expansion leftovers", () => {
  it("renders no aria-expanded toggle and no expanded-panel UI", () => {
    const { container } = render(<RepoCard repo={repo} rank={1} since="weekly" />);
    expect(container.querySelector("[aria-expanded]")).toBeNull();
    expect(screen.queryByText("在 GitHub 打开")).not.toBeInTheDocument();
    expect(screen.queryByText("查看 Issues")).not.toBeInTheDocument();
    expect(screen.queryByText("复制 clone 命令")).not.toBeInTheDocument();
    expect(screen.queryByText("已复制 ✓")).not.toBeInTheDocument();
  });
});

describe("RepoCard accessible name", () => {
  it("link accessible name includes the repo name and the change chip", () => {
    render(<RepoCard repo={repo} rank={1} since="weekly" />);
    expect(
      screen.getByRole("link", { name: /financial-services[\s\S]*本周 \+665/u })
    ).toBeInTheDocument();
  });
});
