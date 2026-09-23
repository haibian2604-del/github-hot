import { describe, it, expect } from "vitest";

describe("vitest infra", () => {
  it("runs with jsdom and aliases", () => {
    expect(document).toBeDefined();
    expect(true).toBe(true);
  });
});
