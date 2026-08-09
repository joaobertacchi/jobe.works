import { describe, expect, it } from "vitest";

import { isCanonicalLocalizedPathname } from "./localized-pathname";

describe("canonical localized pathname syntax", () => {
  it.each([
    "/en/",
    "/pt-BR/",
    "/en/about",
    "/pt-BR/services",
    "/en/release.data",
  ])("accepts %s", (pathname) => {
    expect(isCanonicalLocalizedPathname(pathname)).toBe(true);
  });

  it.each([
    "/en",
    "/pt-BR",
    "/en/about/",
    "/pt-BR/about/",
    "/en/About",
    "/pt-BR/About",
    "/EN/about",
    "/pt-br/about",
    "/fr/about",
    "/en//about",
  ])("rejects %s", (pathname) => {
    expect(isCanonicalLocalizedPathname(pathname)).toBe(false);
  });
});
