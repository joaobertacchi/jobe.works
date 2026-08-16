import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("application styles", () => {
  it("defines the exact sans font fallback stack", () => {
    const css = readFileSync("app/app.css", "utf8");
    const fontSans = css.match(/--font-sans:\s*([^;]+);/)?.[1];

    expect(fontSans?.replace(/\s+/g, " ").trim()).toBe(
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    );
  });

  it("defines the JOBE brand color token", () => {
    const css = readFileSync("app/app.css", "utf8");
    expect(css).toContain("--brand: oklch(0.36 0.13 262);");
  });
});
