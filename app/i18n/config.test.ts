import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  getLocaleFromPathname,
  isSupportedLocale,
  selectPreferredLocale,
} from "./config";

describe("locale configuration", () => {
  it.each([
    [["en"], "en"],
    [["pt-BR"], "pt-BR"],
    [["en-US"], "en"],
    [["pt-PT"], "pt-BR"],
    [["fr-FR", "en-GB"], "en"],
    [[], "pt-BR"],
  ] as const)("selects %s as %s", (languages, expected) => {
    expect(selectPreferredLocale(languages)).toBe(expected);
  });

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
