import { describe, expect, it, vi } from "vitest";

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  createStoredConsent,
  defaultConsent,
  isStoredConsent,
  readConsent,
  writeConsent,
} from "./consent";

function stored(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    version: CONSENT_VERSION,
    analytics: true,
    marketing: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("consent constants", () => {
  it("uses a conservative default with optional categories disabled", () => {
    expect(defaultConsent).toEqual({ analytics: false, marketing: false });
  });

  it("defines a stable storage key and initial version", () => {
    expect(CONSENT_STORAGE_KEY).toBe("consent");
    expect(CONSENT_VERSION).toBe(1);
  });
});

describe("isStoredConsent", () => {
  it("accepts a well-formed stored consent", () => {
    expect(isStoredConsent(stored())).toBe(true);
  });

  it("rejects null, arrays, and non-objects", () => {
    expect(isStoredConsent(null)).toBe(false);
    expect(isStoredConsent([stored()])).toBe(false);
    expect(isStoredConsent("consent")).toBe(false);
    expect(isStoredConsent(42)).toBe(false);
  });

  it("rejects a consent from a different version", () => {
    expect(isStoredConsent(stored({ version: 0 }))).toBe(false);
    expect(isStoredConsent(stored({ version: CONSENT_VERSION + 1 }))).toBe(
      false,
    );
  });

  it("rejects non-boolean consent fields", () => {
    expect(isStoredConsent(stored({ analytics: "yes" }))).toBe(false);
    expect(isStoredConsent(stored({ marketing: 1 }))).toBe(false);
    expect(isStoredConsent(stored({ analytics: undefined }))).toBe(false);
  });

  it("rejects a missing, non-string, or empty updatedAt", () => {
    expect(isStoredConsent(stored({ updatedAt: undefined }))).toBe(false);
    expect(isStoredConsent(stored({ updatedAt: 123 }))).toBe(false);
    expect(isStoredConsent(stored({ updatedAt: "" }))).toBe(false);
  });
});

describe("createStoredConsent", () => {
  it("stamps the current version and an ISO timestamp", () => {
    const consent = createStoredConsent({ analytics: true, marketing: true });

    expect(consent).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
    });
    expect(Number.isNaN(Date.parse(consent.updatedAt))).toBe(false);
  });
});

describe("readConsent", () => {
  it("returns null when nothing is stored", () => {
    const storage = { getItem: vi.fn(() => null) };

    expect(readConsent(storage)).toBeNull();
    expect(storage.getItem).toHaveBeenCalledWith(CONSENT_STORAGE_KEY);
  });

  it("returns a parsed valid stored consent", () => {
    const storage = { getItem: vi.fn(() => JSON.stringify(stored())) };

    expect(readConsent(storage)).toEqual(stored());
  });

  it("returns null for invalid JSON", () => {
    const storage = { getItem: vi.fn(() => "{not json") };

    expect(readConsent(storage)).toBeNull();
  });

  it("returns null for malformed records", () => {
    const storage = {
      getItem: vi.fn(() =>
        JSON.stringify({ version: CONSENT_VERSION, analytics: "yes" }),
      ),
    };

    expect(readConsent(storage)).toBeNull();
  });

  it("returns null when storage access throws", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("Storage unavailable");
      }),
    };

    expect(readConsent(storage)).toBeNull();
  });
});

describe("writeConsent", () => {
  it("persists the consent as JSON under the storage key", () => {
    const storage = { setItem: vi.fn() };
    const consent = stored() as never;

    writeConsent(consent, storage);

    expect(storage.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      JSON.stringify(consent),
    );
  });

  it("swallows storage write failures", () => {
    const storage = {
      setItem: vi.fn(() => {
        throw new Error("Storage unavailable");
      }),
    };

    expect(() => writeConsent(stored() as never, storage)).not.toThrow();
  });
});
