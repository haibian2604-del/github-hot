import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/theme-toggle";

describe("ThemeToggle", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    // jsdom 无 matchMedia：默认亮色（不匹配 dark）。
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    cleanup();
  });

  it("shows 切换到亮色模式 when localStorage theme is dark", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    // 挂载后同步真实状态
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "切换到亮色模式" })).toBeInTheDocument();
    });
  });

  it("shows 切换到暗色模式 when no stored theme and system prefers light", async () => {
    render(<ThemeToggle />);
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "切换到暗色模式" })).toBeInTheDocument();
    });
  });

  it("clicking toggles html class, persists to localStorage and flips label", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = await vi.waitFor(() => screen.getByRole("button", { name: "切换到暗色模式" }));

    await user.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "切换到亮色模式" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "切换到亮色模式" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(screen.getByRole("button", { name: "切换到暗色模式" })).toBeInTheDocument();
  });
});
