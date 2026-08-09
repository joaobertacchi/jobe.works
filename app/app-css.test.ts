import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("application styles", () => {
  it("defines the exact sans font fallback stack", () => {
    const css = readFileSync("app/app.css", "utf8");
    const fontSans = css.match(/--font-sans:\s*([^;]+);/)?.[1];

    expect(fontSans?.replace(/\s+/g, " ").trim()).toBe(
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    );
  });

  it("defines the exact serif system font stack", () => {
    const css = readFileSync("app/app.css", "utf8");
    const fontSerif = css.match(/--font-serif:\s*([^;]+);/)?.[1];

    expect(fontSerif?.replace(/\s+/g, " ").trim()).toBe(
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    );
  });
});
