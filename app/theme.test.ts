import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyTheme,
  persistTheme,
  readTheme,
  resolveTheme,
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  themeInitializationScript,
  type ThemeStorage,
} from "./theme";

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.style.colorScheme = "";
});

describe("readTheme", () => {
  it.each(["light", "dark"] as const)("reads stored %s", (theme) => {
    expect(readTheme(storageWith(theme))).toBe(theme);
  });

  it.each([null, "invalid"])("falls back to system for %s", (value) => {
    expect(readTheme(storageWith(value))).toBe("system");
  });

  it("falls back to system when storage throws", () => {
    expect(
      readTheme({
        getItem() {
          throw new Error("Storage unavailable");
        },
        setItem() {},
        removeItem() {},
      }),
    ).toBe("system");
  });

  it("resolves browser storage when called without storage", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    expect(readTheme()).toBe("dark");
  });

  it("does not access browser storage during SSR", () => {
    vi.stubGlobal("window", undefined);

    expect(readTheme()).toBe("system");
  });
});

describe("resolveTheme", () => {
  it.each([
    ["light", false, "light"],
    ["light", true, "light"],
    ["dark", false, "dark"],
    ["dark", true, "dark"],
    ["system", false, "light"],
    ["system", true, "dark"],
  ] as const)(
    "resolves %s with prefersDark=%s to %s",
    (theme, prefersDark, expected) => {
      expect(resolveTheme(theme, prefersDark)).toBe(expected);
    },
  );
});

describe("persistTheme", () => {
  it.each(["light", "dark"] as const)("stores %s", (theme) => {
    const storage = recordingStorage();

    persistTheme(theme, storage);

    expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, theme);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("removes the stored preference for system", () => {
    const storage = recordingStorage();

    persistTheme("system", storage);

    expect(storage.removeItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("swallows storage errors", () => {
    const storage: ThemeStorage = {
      getItem: vi.fn(),
      setItem() {
        throw new Error("Storage unavailable");
      },
      removeItem() {
        throw new Error("Storage unavailable");
      },
    };

    expect(() => persistTheme("dark", storage)).not.toThrow();
    expect(() => persistTheme("system", storage)).not.toThrow();
  });
});

describe("applyTheme", () => {
  it("applies and removes dark mode while setting the color scheme", () => {
    const root = document.createElement("html");

    applyTheme("dark", root);
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");

    applyTheme("light", root);
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
  });
});

describe("themeInitializationScript", () => {
  it.each([
    ["light", true, "light"],
    ["dark", false, "dark"],
    [null, false, "light"],
    [null, true, "dark"],
    ["invalid", false, "light"],
    ["invalid", true, "dark"],
  ] as const)(
    "initializes stored=%s and prefersDark=%s as %s",
    (stored, prefersDark, expected) => {
      executeInitializationScript(storageWith(stored), prefersDark);

      expect(document.documentElement.classList.contains("dark")).toBe(
        expected === "dark",
      );
      expect(document.documentElement.style.colorScheme).toBe(expected);
    },
  );

  it("follows the OS when storage throws", () => {
    executeInitializationScript(
      {
        getItem() {
          throw new Error("Storage unavailable");
        },
        setItem() {},
        removeItem() {},
      },
      true,
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("defaults to light when matchMedia is unavailable", () => {
    executeInitializationScript(storageWith(null));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("removes an existing dark class when light is effective", () => {
    document.documentElement.classList.add("dark");

    executeInitializationScript(storageWith("light"), true);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

function storageWith(value: string | null): ThemeStorage {
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
}

function recordingStorage() {
  return {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  } satisfies ThemeStorage;
}

function executeInitializationScript(
  storage: ThemeStorage,
  prefersDark?: boolean,
) {
  const matchMedia =
    prefersDark === undefined
      ? undefined
      : vi.fn((query: string) => ({
          matches: query === THEME_MEDIA_QUERY && prefersDark,
        }));
  const execute = new Function(
    "document",
    "localStorage",
    "matchMedia",
    themeInitializationScript,
  );

  execute(document, storage, matchMedia);
}
