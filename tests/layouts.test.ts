import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { layouts } from "./e2e/layouts";

const rootFontSize = 16;

function cssBreakpoints(): number[] {
  const css = readFileSync(join(process.cwd(), "app/app.css"), "utf8");
  const widths = [
    ...css.matchAll(/@media[^{]*\((?:min|max)-width:\s*([\d.]+)rem\)/g),
  ].map((match) => Number(match[1]) * rootFontSize);
  return [...new Set(widths)].sort((a, b) => a - b);
}

describe("e2e layouts", () => {
  it("names one layout per responsive tier in app/app.css", () => {
    expect(layouts).toHaveLength(cssBreakpoints().length + 1);
  });

  it("places each layout inside its own tier, narrowest first", () => {
    const breakpoints = cssBreakpoints();
    layouts.forEach(({ name, viewport }, tier) => {
      const lower = tier === 0 ? 0 : breakpoints[tier - 1];
      const upper = breakpoints[tier] ?? Number.POSITIVE_INFINITY;
      expect(viewport.width, name).toBeGreaterThan(lower);
      expect(viewport.width, name).toBeLessThan(upper);
    });
  });
});
