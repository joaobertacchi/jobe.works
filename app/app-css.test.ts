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

  it("keeps scorecard severity text at WCAG AA contrast on surfaces", () => {
    const css = readFileSync("app/app.css", "utf8");
    const [light, dark] = css.split(/^\.dark \{/m);

    for (const theme of [light, dark]) {
      const surface = readOklch(theme, "--surface");
      for (const token of ["--risk-foreground", "--gap-foreground"]) {
        expect(
          contrast(readOklch(theme, token), surface),
          token,
        ).toBeGreaterThanOrEqual(5);
      }
    }
    expect(css).toMatch(
      /\.rs-severity-tag \{[^}]*color: var\(--rs-tone-text\)/,
    );
  });
});

function readOklch(css: string, token: string): [number, number, number] {
  const match = css.match(
    new RegExp(`${token}: oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`),
  );
  if (!match) throw new Error(`Missing oklch token ${token}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luminance([lightness, chroma, hue]: [number, number, number]): number {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const red = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const green = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const blue = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(
  foreground: [number, number, number],
  background: [number, number, number],
) {
  const [high, low] = [luminance(foreground), luminance(background)].sort(
    (x, y) => y - x,
  );
  return (high + 0.05) / (low + 0.05);
}
