export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentSnapshot = {
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = ConsentSnapshot & {
  version: number;
  updatedAt: string;
};

export const CONSENT_STORAGE_KEY = "consent";
export const CONSENT_VERSION = 1;

export const defaultConsent: ConsentSnapshot = {
  analytics: false,
  marketing: false,
};

export function isStoredConsent(value: unknown): value is StoredConsent {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === CONSENT_VERSION &&
    typeof record.analytics === "boolean" &&
    typeof record.marketing === "boolean" &&
    typeof record.updatedAt === "string" &&
    record.updatedAt.length > 0
  );
}

export function createStoredConsent(snapshot: ConsentSnapshot): StoredConsent {
  return {
    ...snapshot,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function readConsent(
  storage?: Pick<Storage, "getItem">,
): StoredConsent | null {
  try {
    const target =
      storage ??
      (typeof window === "undefined" ? undefined : window.localStorage);
    const raw = target?.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredConsent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(
  consent: StoredConsent,
  storage?: Pick<Storage, "setItem">,
): void {
  try {
    const target =
      storage ??
      (typeof window === "undefined" ? undefined : window.localStorage);
    target?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Storage may be blocked by browser privacy settings.
  }
}
