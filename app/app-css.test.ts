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

  it("defines scorecard severity tokens for light and dark themes", () => {
    const css = readFileSync("app/app.css", "utf8");
    const [light, dark] = css.split(/^\.dark \{/m);

    for (const token of ["--risk:", "--gap:", "--unknown:"]) {
      expect(light).toContain(token);
      expect(dark).toContain(token);
    }
    expect(css).toContain("--color-risk: var(--risk);");
  });

  it("disables scorecard motion for reduced-motion users", () => {
    const css = readFileSync("app/app.css", "utf8");
    const reduced = css.slice(
      css.lastIndexOf("@media (prefers-reduced-motion: reduce)"),
    );

    expect(reduced).toContain(".rs-reveal");
    expect(reduced).toContain(".rs-ring-arc");
  });
});
