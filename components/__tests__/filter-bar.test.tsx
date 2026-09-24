import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "@/components/filter-bar";
import type { LanguageOption } from "@/lib/trending";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const languages: LanguageOption[] = [
  { label: "Python", key: "python" },
  { label: "Go", key: "go" },
];

describe("FilterBar", () => {
  it("renders since tabs and language options with 全部语言 first", () => {
    render(<FilterBar languages={languages} filters={{ lang: "", since: "daily" }} />);
    expect(screen.getByRole("button", { name: "今天" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "本周" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "本月" })).toBeInTheDocument();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options[0]).toHaveTextContent("全部语言");
    expect(select.options[1]).toHaveTextContent("Python");
  });

  it("pushes new url when since tab clicked", async () => {
    const user = userEvent.setup();
    render(<FilterBar languages={languages} filters={{ lang: "", since: "daily" }} />);
    await user.click(screen.getByRole("button", { name: "本周" }));
    expect(push).toHaveBeenCalledWith("/?since=weekly");
  });

  it("pushes new url when language selected", async () => {
    const user = userEvent.setup();
    render(<FilterBar languages={languages} filters={{ lang: "", since: "daily" }} />);
    await user.selectOptions(screen.getByRole("combobox"), "python");
    expect(push).toHaveBeenCalledWith("/?lang=python&since=daily");
  });

  it("reflects current filter state", () => {
    render(<FilterBar languages={languages} filters={{ lang: "go", since: "monthly" }} />);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("go");
    expect(screen.getByRole("button", { name: "本月" })).toHaveAttribute("data-active", "true");
  });
});
