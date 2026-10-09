import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  getLocaleFromPathname,
  isSupportedLocale,
} from "./config";

describe("locale configuration", () => {
  it("uses the accepted default locale", () => {
    expect(defaultLocale).toBe("pt-BR");
  });

  it("recognizes only configured canonical locale keys", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("pt-BR")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });

  it.each([
    ["/en/about", "en"],
    ["/pt-BR/services", "pt-BR"],
    ["/fr/about", undefined],
    ["/", undefined],
  ] as const)("reads the locale from %s", (pathname, expected) => {
    expect(getLocaleFromPathname(pathname)).toBe(expected);
  });
});
