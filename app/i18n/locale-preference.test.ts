import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCALE_STORAGE_KEY,
  persistLocale,
  readPreferredLocale,
  rootLocaleRedirectScript,
  type LocaleStorage,
} from "./locale-preference";

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

function storageWith(value: string | null): LocaleStorage {
  return { getItem: vi.fn(() => value), setItem: vi.fn() };
}

const blockedStorage: LocaleStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

describe("readPreferredLocale", () => {
  it.each([
    ["en", "en"],
    ["pt-BR", "pt-BR"],
    [null, "pt-BR"],
    ["fr", "pt-BR"],
  ] as const)("reads stored %s as %s", (stored, expected) => {
    expect(readPreferredLocale(storageWith(stored))).toBe(expected);
  });

  it("falls back to the default locale when storage is blocked", () => {
    expect(readPreferredLocale(blockedStorage)).toBe("pt-BR");
  });
});

describe("persistLocale", () => {
  it("stores the locale under the preference key", () => {
    const storage = storageWith(null);
    persistLocale("en", storage);
    expect(storage.setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, "en");
  });

  it("ignores blocked storage", () => {
    expect(() => persistLocale("en", blockedStorage)).not.toThrow();
  });

  it("round-trips through browser storage", () => {
    persistLocale("en");
    expect(readPreferredLocale()).toBe("en");
  });
});

describe("rootLocaleRedirectScript", () => {
  function runScript(storage: LocaleStorage) {
    const location = { replace: vi.fn() };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("location", location);
    new Function(rootLocaleRedirectScript)();
    return location.replace;
  }

  it.each([
    ["en", "/en/"],
    ["pt-BR", "/pt-BR/"],
    [null, "/pt-BR/"],
    ["fr", "/pt-BR/"],
  ] as const)("redirects stored %s to %s", (stored, expected) => {
    expect(runScript(storageWith(stored))).toHaveBeenCalledWith(expected);
  });

  it("redirects to the default locale when storage is blocked", () => {
    expect(runScript(blockedStorage)).toHaveBeenCalledWith("/pt-BR/");
  });
});
