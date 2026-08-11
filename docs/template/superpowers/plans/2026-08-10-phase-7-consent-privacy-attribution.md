# Phase 7 Consent, Privacy, and Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add versioned persisted consent (necessary/analytics/marketing), a localized consent banner with accept/reject/customize, a persistent cookie-settings entry point, an expanded localized privacy page, a sample form privacy-notice pattern, and browser-level validation of all Phase 7 invariants.

**Architecture:** `ConsentProvider` (root) owns versioned localStorage consent and exposes `acceptAll`, `rejectNonEssential`, `updatePreferences`, and dialog state. The consent banner and customize dialog self-localize from the URL locale and consume the context; the footer's Cookie settings button reopens the dialog. `AnalyticsProvider` (Phase 6) consumes the consent snapshot as a prop, so eligibility changes immediately when consent changes. ADR 016 defines the model; the design spec `docs/template/superpowers/specs/2026-08-10-phases-6-7-analytics-consent-design.md` is authoritative.

**Tech Stack:** React Router Framework Mode v8, React 19, TypeScript 5.9, Vitest, React Testing Library, Playwright

---

## File Structure

- Modify `app/consent/consent.ts`: add stored-consent model, version, storage helpers, strict validation.
- Create `app/consent/consent.test.ts`: storage and validation coverage.
- Create `app/consent/consent-context.tsx`: `ConsentProvider` + `useConsent()`.
- Create `app/consent/consent-context.test.tsx`: consent flow coverage.
- Create `app/i18n/translations/consent.ts`: localized banner/dialog copy.
- Modify `app/i18n/translations/index.ts` and `app/i18n/types.ts`: register the consent dictionary.
- Create `app/components/site/consent-banner.tsx`: banner + customize dialog.
- Create `app/components/site/consent-banner.test.tsx`: banner/dialog behavior coverage.
- Modify `app/root.tsx`: mount `ConsentProvider` + analytics bridge + banner.
- Modify `app/components/site/site-footer.tsx`: cookie settings button.
- Modify `app/root.test.tsx` and `app/components/site/site-components.test.tsx`: provider-wrapped tests.
- Modify `app/i18n/translations/privacy.ts` and `app/routes/$locale.privacy.tsx`: expanded privacy sections.
- Create `app/components/domain/form-privacy-notice.tsx` + test.
- Modify `tests/e2e/routing.spec.ts`: seed stored consent so the footer link stays clickable.
- Create `tests/e2e/privacy-consent.spec.ts`: browser validation of Phase 7 invariants.

### Task 1: Consent Model and Storage

**Files:**
- Modify: `app/consent/consent.ts`
- Create: `app/consent/consent.test.ts`

- [ ] **Step 1: Write the failing storage and validation tests**

Create `app/consent/consent.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the consent test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/consent/consent.test.ts`

Expected: FAIL because `readConsent`/`writeConsent`/`isStoredConsent`/`createStoredConsent`/`defaultConsent`/`CONSENT_VERSION`/`CONSENT_STORAGE_KEY` do not exist.

- [ ] **Step 3: Implement the consent model and storage**

Replace the contents of `app/consent/consent.ts` with:

```ts
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
```

- [ ] **Step 4: Run the consent test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/consent/consent.test.ts`

Expected: PASS with all validation cases covered.

- [ ] **Step 5: Commit the consent model**

```bash
git add app/consent/consent.ts app/consent/consent.test.ts
git commit -m "feat(consent): persist versioned consent state"
```

### Task 2: Consent Context

**Files:**
- Create: `app/consent/consent-context.tsx`
- Create: `app/consent/consent-context.test.tsx`

- [ ] **Step 1: Write the failing context tests**

Create `app/consent/consent-context.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./consent";
import { ConsentProvider, useConsent } from "./consent-context";

function Probe() {
  const {
    consent,
    hasConsentDecision,
    acceptAll,
    rejectNonEssential,
    updatePreferences,
    settingsOpen,
    openSettings,
    closeSettings,
  } = useConsent();
  return (
    <div>
      <span data-testid="analytics">{String(consent.analytics)}</span>
      <span data-testid="marketing">{String(consent.marketing)}</span>
      <span data-testid="decision">{String(hasConsentDecision)}</span>
      <span data-testid="settings-open">{String(settingsOpen)}</span>
      <button onClick={acceptAll}>Accept</button>
      <button onClick={rejectNonEssential}>Reject</button>
      <button
        onClick={() => updatePreferences({ analytics: true, marketing: false })}
      >
        Custom
      </button>
      <button onClick={openSettings}>Open</button>
      <button onClick={closeSettings}>Close</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <ConsentProvider>
      <Probe />
    </ConsentProvider>,
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe("ConsentProvider", () => {
  it("defaults to no decision with optional categories disabled", () => {
    renderProbe();

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("false");
    expect(screen.getByTestId("settings-open")).toHaveTextContent("false");
  });

  it("accept all enables both optional categories and persists", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    expect(screen.getByTestId("marketing")).toHaveTextContent("true");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
    const persisted = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    expect(persisted).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
    });
  });

  it("reject non-essential persists both optional categories disabled", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
    const persisted = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    expect(persisted).toMatchObject({
      version: CONSENT_VERSION,
      analytics: false,
      marketing: false,
    });
  });

  it("update preferences persists exactly the supplied categories", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Custom" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
  });

  it("loads a stored decision shortly after mount", async () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        analytics: true,
        marketing: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    renderProbe();

    await waitFor(() => {
      expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
  });

  it("treats a stored consent from an older version as unresolved", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        analytics: true,
        marketing: true,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    renderProbe();

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("false");
  });

  it("treats malformed stored records as unresolved", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: CONSENT_VERSION, analytics: "yes" }),
    );

    renderProbe();

    expect(screen.getByTestId("decision")).toHaveTextContent("false");
  });

  it("treats unparsable stored records as unresolved", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "{not json");

    renderProbe();

    expect(screen.getByTestId("decision")).toHaveTextContent("false");
  });

  it("exposes settings dialog state", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByTestId("settings-open")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("settings-open")).toHaveTextContent("false");
  });
});
```

- [ ] **Step 2: Run the context test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/consent/consent-context.test.tsx`

Expected: FAIL because `app/consent/consent-context.tsx` does not exist.

- [ ] **Step 3: Implement the consent context**

The provider starts with the same conservative unresolved state used during prerendering (no `window` exists there), then applies stored consent in a client effect. This keeps the initial prerendered and hydrated trees identical, avoiding hydration mismatches on returning visits. The analytics transition dispatch guarantees trackers still observe the landing page view once stored consent is applied.

Create `app/consent/consent-context.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createStoredConsent,
  defaultConsent,
  readConsent,
  writeConsent,
  type ConsentSnapshot,
  type StoredConsent,
} from "./consent";

type ConsentValue = {
  consent: ConsentSnapshot;
  hasConsentDecision: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  updatePreferences: (snapshot: ConsentSnapshot) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredConsent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const loaded = readConsent();
    if (loaded) setStored(loaded);
  }, []);

  const persist = useCallback((snapshot: ConsentSnapshot) => {
    const next = createStoredConsent(snapshot);
    setStored(next);
    writeConsent(next);
  }, []);

  const acceptAll = useCallback(
    () => persist({ analytics: true, marketing: true }),
    [persist],
  );
  const rejectNonEssential = useCallback(
    () => persist({ analytics: false, marketing: false }),
    [persist],
  );
  const updatePreferences = useCallback(
    (snapshot: ConsentSnapshot) => persist(snapshot),
    [persist],
  );
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo<ConsentValue>(
    () => ({
      consent: stored ?? defaultConsent,
      hasConsentDecision: stored !== null,
      acceptAll,
      rejectNonEssential,
      updatePreferences,
      settingsOpen,
      openSettings,
      closeSettings,
    }),
    [
      stored,
      settingsOpen,
      acceptAll,
      rejectNonEssential,
      updatePreferences,
      openSettings,
      closeSettings,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentValue {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used within ConsentProvider");
  return value;
}
```

- [ ] **Step 4: Run the context test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/consent/consent-context.test.tsx`

Expected: PASS with all flows covered.

- [ ] **Step 5: Commit the consent context**

```bash
git add app/consent/consent-context.tsx app/consent/consent-context.test.tsx
git commit -m "feat(consent): add consent context provider"
```

### Task 3: Localized Consent Copy

**Files:**
- Create: `app/i18n/translations/consent.ts`
- Modify: `app/i18n/translations/index.ts`
- Modify: `app/i18n/types.ts`

- [ ] **Step 1: Create the consent translation dictionary**

Create `app/i18n/translations/consent.ts`:

```ts
import type { SupportedLocale } from "../config";

export type ConsentTranslation = {
  banner: {
    label: string;
    message: string;
    acceptAll: string;
    rejectNonEssential: string;
    customize: string;
  };
  dialog: {
    title: string;
    description: string;
    necessary: string;
    necessaryDescription: string;
    analytics: string;
    analyticsDescription: string;
    marketing: string;
    marketingDescription: string;
    save: string;
    cancel: string;
  };
  cookieSettings: string;
};

export const consentTranslations = {
  en: {
    banner: {
      label: "Cookie preferences",
      message:
        "We use cookies and similar technologies to understand how the site is used and, with your consent, to measure campaigns. You can accept all, reject non-essential technologies, or customize your choices.",
      acceptAll: "Accept all",
      rejectNonEssential: "Reject non-essential",
      customize: "Customize",
    },
    dialog: {
      title: "Cookie settings",
      description:
        "Choose which categories of technologies you allow. Necessary technologies always stay enabled.",
      necessary: "Necessary",
      necessaryDescription: "Required for the website to work.",
      analytics: "Analytics",
      analyticsDescription: "Helps us understand how the site is used.",
      marketing: "Marketing",
      marketingDescription: "Used to measure and personalize advertising.",
      save: "Save preferences",
      cancel: "Cancel",
    },
    cookieSettings: "Cookie settings",
  },
  "pt-BR": {
    banner: {
      label: "Preferências de cookies",
      message:
        "Usamos cookies e tecnologias semelhantes para entender como o site é usado e, com seu consentimento, medir campanhas. Você pode aceitar tudo, recusar tecnologias não essenciais ou personalizar suas escolhas.",
      acceptAll: "Aceitar tudo",
      rejectNonEssential: "Recusar não essenciais",
      customize: "Personalizar",
    },
    dialog: {
      title: "Configurações de cookies",
      description:
        "Escolha quais categorias de tecnologias você permite. As tecnologias necessárias permanecem sempre habilitadas.",
      necessary: "Necessárias",
      necessaryDescription: "Exigidas para o funcionamento do site.",
      analytics: "Analytics",
      analyticsDescription: "Ajuda a entender como o site é usado.",
      marketing: "Marketing",
      marketingDescription: "Usada para medir e personalizar anúncios.",
      save: "Salvar preferências",
      cancel: "Cancelar",
    },
    cookieSettings: "Configurações de cookies",
  },
} satisfies Record<SupportedLocale, ConsentTranslation>;
```

- [ ] **Step 2: Register the consent dictionary**

In `app/i18n/translations/index.ts`:

- Add the import:

```ts
import { consentTranslations } from "./consent";
```

- Add `consent: consentTranslations.en,` to the `en` object and `consent: consentTranslations["pt-BR"],` to the `pt-BR` object.

In `app/i18n/types.ts`:

- Add the import:

```ts
import type { ConsentTranslation } from "./translations/consent";
```

- Add `consent: ConsentTranslation;` to the `Translation` type.

- [ ] **Step 3: Verify type checking and lint**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run typecheck && npm run lint`

Expected: PASS; the exhaustive registry (`satisfies Record<SupportedLocale, Translation>`) enforces both locales.

- [ ] **Step 4: Commit the consent translations**

```bash
git add app/i18n/translations/consent.ts app/i18n/translations/index.ts app/i18n/types.ts
git commit -m "feat(i18n): add localized consent copy"
```

### Task 4: Consent Banner and Customize Dialog

**Files:**
- Create: `app/components/site/consent-banner.tsx`
- Create: `app/components/site/consent-banner.test.tsx`

- [ ] **Step 1: Write the failing banner tests**

Create `app/components/site/consent-banner.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { SupportedLocale } from "../../i18n/config";
import { ConsentProvider, useConsent } from "../../consent/consent-context";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "../../consent/consent";
import { ConsentBanner } from "./consent-banner";

function SettingsOpener() {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings}>
      Open settings
    </button>
  );
}

function renderBanner(
  locale: SupportedLocale = "en",
  withSettingsOpener = false,
) {
  return render(
    <ConsentProvider>
      <ConsentBanner locale={locale} />
      {withSettingsOpener ? <SettingsOpener /> : null}
    </ConsentProvider>,
  );
}

function storedConsent() {
  return JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null");
}

afterEach(() => {
  window.localStorage.clear();
});

describe("ConsentBanner", () => {
  it("renders a localized banner with comparable actions before a decision", () => {
    renderBanner("en");

    expect(
      screen.getByRole("region", { name: "Cookie preferences" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Accept all" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Reject non-essential" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Customize" })).toBeVisible();
  });

  it("renders the Portuguese banner in the pt-BR locale", () => {
    renderBanner("pt-BR");

    expect(
      screen.getByRole("region", { name: "Preferências de cookies" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Aceitar tudo" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Recusar não essenciais" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Personalizar" })).toBeVisible();
  });

  it("renders nothing when the locale is unknown", () => {
    render(
      <ConsentProvider>
        <ConsentBanner locale={null} />
      </ConsentProvider>,
    );

    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("accept all persists consent and hides the banner", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));

    expect(storedConsent()).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
    });
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("reject non-essential persists optional categories disabled", () => {
    renderBanner("en");

    fireEvent.click(
      screen.getByRole("button", { name: "Reject non-essential" }),
    );

    expect(storedConsent()).toMatchObject({
      analytics: false,
      marketing: false,
    });
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("customize opens the dialog with the current choices", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    const dialog = screen.getByRole("dialog", { name: "Cookie settings" });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Necessary" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Necessary" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Analytics" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Marketing" })).not.toBeChecked();
  });

  it("saving custom preferences persists them and closes the dialog", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Analytics" }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(storedConsent()).toMatchObject({
      analytics: true,
      marketing: false,
    });
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("cancel closes the dialog without persisting a choice", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Marketing" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
    expect(
      screen.getByRole("region", { name: "Cookie preferences" }),
    ).toBeVisible();
  });

  it("escape closes the dialog without persisting", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Cookie settings" }), {
      key: "Escape",
    });

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
  });

  it("reopens the dialog with stored choices after a decision", () => {
    renderBanner("en", true);

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    const dialog = screen.getByRole("dialog", { name: "Cookie settings" });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Analytics" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Marketing" })).toBeChecked();
  });

  it("restores stored choices when the dialog is reopened after cancel", () => {
    renderBanner("en", true);

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Marketing" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    expect(screen.getByRole("checkbox", { name: "Marketing" })).toBeChecked();
  });

  it("focuses the first optional toggle when the dialog opens", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    expect(screen.getByRole("checkbox", { name: "Analytics" })).toHaveFocus();
  });

  it("closes the dialog when clicking outside the content", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("dialog", { name: "Cookie settings" }));

    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run the banner test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/components/site/consent-banner.test.tsx`

Expected: FAIL because `app/components/site/consent-banner.tsx` does not exist.

- [ ] **Step 3: Implement the banner and dialog**

The customize screen uses the native `<dialog>` element with its native modal lifecycle (`showModal` in browsers). jsdom does not implement `showModal`, so the open effect falls back to setting the `open` attribute in that environment; the dialog's content and handlers are identical in both.

Create `app/components/site/consent-banner.tsx`:

```tsx
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import type { SupportedLocale } from "../../i18n/config";
import { I18nProvider, useI18n } from "../../i18n/i18n";
import { useConsent } from "../../consent/consent-context";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

function ConsentDialog() {
  const { consent, settingsOpen, closeSettings, updatePreferences } =
    useConsent();
  const { translate } = useI18n();
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const analyticsToggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    } else if (dialog) {
      dialog.setAttribute("open", "");
    }
    analyticsToggleRef.current?.focus();
  }, [settingsOpen, consent]);

  if (!settingsOpen) return null;

  function savePreferences() {
    updatePreferences({ analytics, marketing });
    closeSettings();
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeSettings();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") closeSettings();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="consent-dialog-title"
      className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 backdrop:bg-background/80"
      onClick={handleDialogClick}
      onClose={closeSettings}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Heading as="h2" id="consent-dialog-title" level="section">
            {translate("consent.dialog.title")}
          </Heading>
          <Text tone="muted">{translate("consent.dialog.description")}</Text>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col gap-1">
              <Text as="span">{translate("consent.dialog.necessary")}</Text>
              <Text tone="muted">
                {translate("consent.dialog.necessaryDescription")}
              </Text>
            </span>
            <input
              aria-label={translate("consent.dialog.necessary")}
              checked
              disabled
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col gap-1">
              <Text as="span">{translate("consent.dialog.analytics")}</Text>
              <Text tone="muted">
                {translate("consent.dialog.analyticsDescription")}
              </Text>
            </span>
            <input
              aria-label={translate("consent.dialog.analytics")}
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              ref={analyticsToggleRef}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col gap-1">
              <Text as="span">{translate("consent.dialog.marketing")}</Text>
              <Text tone="muted">
                {translate("consent.dialog.marketingDescription")}
              </Text>
            </span>
            <input
              aria-label={translate("consent.dialog.marketing")}
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={closeSettings}>
            {translate("consent.dialog.cancel")}
          </Button>
          <Button onClick={savePreferences}>
            {translate("consent.dialog.save")}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function ConsentBannerContent() {
  const { hasConsentDecision, acceptAll, rejectNonEssential, openSettings } =
    useConsent();
  const { translate } = useI18n();

  return (
    <>
      {hasConsentDecision ? null : (
        <div
          role="region"
          aria-label={translate("consent.banner.label")}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface"
        >
          <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Text>{translate("consent.banner.message")}</Text>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={acceptAll}>
                {translate("consent.banner.acceptAll")}
              </Button>
              <Button size="sm" variant="secondary" onClick={rejectNonEssential}>
                {translate("consent.banner.rejectNonEssential")}
              </Button>
              <Button size="sm" variant="secondary" onClick={openSettings}>
                {translate("consent.banner.customize")}
              </Button>
            </div>
          </Container>
        </div>
      )}
      <ConsentDialog />
    </>
  );
}

export function ConsentBanner({
  locale,
}: {
  locale: SupportedLocale | null;
}) {
  if (locale === null) return null;
  return (
    <I18nProvider locale={locale}>
      <ConsentBannerContent />
    </I18nProvider>
  );
}
```

- [ ] **Step 4: Run the banner test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/components/site/consent-banner.test.tsx`

Expected: PASS; jsdom exercises the `open`-attribute fallback while browsers use the native modal path. Verify the accessible name assertions (`getByRole("dialog", { name: "Cookie settings" })`) resolve through the implicit dialog role and `aria-labelledby`.

- [ ] **Step 5: Commit the consent banner**

```bash
git add app/components/site/consent-banner.tsx app/components/site/consent-banner.test.tsx
git commit -m "feat(consent): add banner and customize dialog"
```

### Task 5: Root Integration and Footer Entry Point

**Files:**
- Modify: `app/root.tsx`
- Modify: `app/components/site/site-footer.tsx`
- Modify: `app/root.test.tsx`
- Modify: `app/components/site/site-components.test.tsx`

- [ ] **Step 1: Update the root layout**

In `app/root.tsx`:

- Add imports:

```tsx
import { AnalyticsProvider } from "./analytics/analytics";
import { ConsentBanner } from "./components/site/consent-banner";
import { ConsentProvider, useConsent } from "./consent/consent-context";
```

- Add the analytics bridge component above `Layout` (replacing the direct `AnalyticsProvider` wiring added in Phase 6):

```tsx
function ConsentAwareAnalytics({ children }: { children: React.ReactNode }) {
  const { consent } = useConsent();
  return <AnalyticsProvider consent={consent}>{children}</AnalyticsProvider>;
}
```

- Replace the `Layout` body:

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const locale =
    getLocaleFromPathname(pathname) ??
    (pathname.split("/")[1] ? null : defaultLocale);
  return (
    <Document locale={locale}>
      <ConsentProvider>
        <ConsentAwareAnalytics>
          {children}
          <ConsentBanner locale={locale} />
        </ConsentAwareAnalytics>
      </ConsentProvider>
    </Document>
  );
}
```

- [ ] **Step 2: Add the footer cookie settings button**

In `app/components/site/site-footer.tsx`:

- Add imports:

```tsx
import { useConsent } from "../../consent/consent-context";
import { Button } from "../ui/button";
```

- In the component body, after `const { locale, translate } = useI18n();`, add `const { openSettings } = useConsent();`.

- Inside the `<nav>`, after the Privacy `TextLink`, add:

```tsx
<Button size="sm" variant="secondary" onClick={openSettings}>
  {translate("consent.cookieSettings")}
</Button>
```

- [ ] **Step 3: Update the site-components test harness**

In `app/components/site/site-components.test.tsx`:

- Add the import:

```tsx
import { ConsentProvider } from "../../consent/consent-context";
```

- Wrap `renderWithRouter`:

```tsx
function renderWithRouter(
  component: React.ReactNode,
  locale: SupportedLocale,
  pathname: string,
) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <ConsentProvider>
        <I18nProvider locale={locale}>{component}</I18nProvider>
      </ConsentProvider>
    </MemoryRouter>,
  );
}
```

- In the `SiteFooter` describe block, extend the localized test to also assert the cookie settings button; add a new test:

```tsx
it("exposes a cookie settings button that opens the customize dialog", () => {
  renderWithRouter(<SiteFooter />, "en", "/en/about");

  fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));

  expect(screen.getByRole("dialog", { name: "Cookie settings" })).toBeVisible();
});
```

Note: `ConsentBanner` renders the dialog, so this test must render the footer together with the banner:

```tsx
it("exposes a cookie settings button that opens the customize dialog", () => {
  render(
    <MemoryRouter initialEntries={["/en/about"]}>
      <ConsentProvider>
        <I18nProvider locale="en">
          <SiteFooter />
          <ConsentBanner locale="en" />
        </I18nProvider>
      </ConsentProvider>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));

  expect(screen.getByRole("dialog", { name: "Cookie settings" })).toBeVisible();
});
```

Add `ConsentBanner` to the test file imports.

- [ ] **Step 4: Add a root layout test**

In `app/root.test.tsx`:

- Add imports:

```tsx
import { MemoryRouter } from "react-router";
```

and:

```tsx
import { Layout } from "./root";
```

- Add a test inside the "root document" describe block:

```tsx
it("wraps page content with consent providers and renders the banner", () => {
  window.localStorage.clear();
  render(
    <MemoryRouter initialEntries={["/en/"]}>
      <Layout>
        <p>Page content</p>
      </Layout>
    </MemoryRouter>,
  );

  expect(screen.getByText("Page content")).toBeVisible();
  expect(
    screen.getByRole("region", { name: "Cookie preferences" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Accept all" })).toBeVisible();
});
```

- [ ] **Step 5: Run the affected tests and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/root.test.tsx app/components/site/site-components.test.tsx app/components/site/consent-banner.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit root and footer integration**

```bash
git add app/root.tsx app/components/site/site-footer.tsx app/root.test.tsx app/components/site/site-components.test.tsx
git commit -m "feat(consent): integrate providers and cookie settings entry"
```

### Task 6: Privacy Page Expansion

**Files:**
- Modify: `app/i18n/translations/privacy.ts`
- Modify: `app/routes/$locale.privacy.tsx`
- Modify: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Extend the privacy translation contract**

In `app/i18n/translations/privacy.ts`:

- Add a shared section type and expand the `sections` shape:

```ts
export type PrivacySection = { title: string; body: string };

export type PrivacyTranslation = {
  seo: { title: string; description: string };
  title: string;
  introduction: string;
  formNotice: {
    body: string;
    marketingOptIn: string;
  };
  sections: {
    data: PrivacySection;
    purpose: PrivacySection;
    storage: PrivacySection;
    rights: PrivacySection;
    consent: PrivacySection;
    cookies: PrivacySection;
    analytics: PrivacySection;
    marketing: PrivacySection;
    attribution: PrivacySection;
    contactForms: PrivacySection;
  };
};
```

- Keep the existing four sections verbatim and add these English sections:

```ts
consent: {
  title: "Consent choices",
  body: "The site stores your consent choice for analytics and marketing technologies in this browser, versioned so a change in practices can request a new choice. Replace this text with your fork-specific explanation.",
},
cookies: {
  title: "Cookies and similar technologies",
  body: "Non-essential analytics and marketing technologies are disabled until you accept them. You can change your choice at any time from the Cookie settings control in the footer.",
},
analytics: {
  title: "Analytics",
  body: "When analytics consent is given, the site may measure how pages are used. Document the analytics providers and what they receive in your fork.",
},
marketing: {
  title: "Advertising and marketing technologies",
  body: "Marketing consent is separate from analytics. Accepting analytics does not enable advertising technologies. Document marketing providers and purposes in your fork.",
},
attribution: {
  title: "Campaign attribution",
  body: "Only explicitly allowlisted campaign parameters (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) may be used, kept in memory for the current visit and never persisted. No arbitrary URL parameters are collected.",
},
contactForms: {
  title: "Contact forms",
  body: "Forms collect only what is needed to respond to your request. Consent to optional promotional communication is always separate from submitting the form and never preselected.",
},
formNotice: {
  body: "We use the information provided to respond to your inquiry. See our Privacy Notice for more information.",
  marketingOptIn: "I would like to receive occasional updates and offers.",
},
```

- Add the matching Portuguese sections:

```ts
consent: {
  title: "Escolhas de consentimento",
  body: "O site armazena neste navegador sua escolha de consentimento para tecnologias de analytics e marketing, com versão, para que uma mudança de práticas possa solicitar nova escolha. Substitua este texto pela explicação específica do seu fork.",
},
cookies: {
  title: "Cookies e tecnologias semelhantes",
  body: "Tecnologias não essenciais de analytics e marketing permanecem desabilitadas até que você as aceite. Você pode alterar sua escolha a qualquer momento pelo controle de Configurações de cookies no rodapé.",
},
analytics: {
  title: "Analytics",
  body: "Com o consentimento de analytics, o site pode medir como as páginas são usadas. Documente no seu fork os provedores de analytics e o que eles recebem.",
},
marketing: {
  title: "Tecnologias de publicidade e marketing",
  body: "O consentimento de marketing é separado do de analytics. Aceitar analytics não habilita tecnologias de publicidade. Documente no seu fork os provedores de marketing e suas finalidades.",
},
attribution: {
  title: "Atribuição de campanhas",
  body: "Apenas parâmetros de campanha explicitamente permitidos (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) podem ser usados, mantidos em memória na visita atual e nunca persistidos. Nenhum parâmetro arbitrário de URL é coletado.",
},
contactForms: {
  title: "Formulários de contato",
  body: "Formulários coletam apenas o necessário para responder à sua solicitação. O consentimento para comunicação promocional opcional é sempre separado do envio do formulário e nunca pré-selecionado.",
},
formNotice: {
  body: "Usamos as informações fornecidas para responder à sua solicitação. Consulte o Aviso de Privacidade para mais informações.",
  marketingOptIn: "Gostaria de receber atualizações e ofertas ocasionais.",
},
```

- [ ] **Step 2: Render the sections from the dictionary**

Replace the body of `app/routes/$locale.privacy.tsx` with:

```tsx
import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import {
  privacyTranslations,
  type PrivacyTranslation,
} from "../i18n/translations/privacy";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.privacy";

const privacySectionKeys: readonly (keyof PrivacyTranslation["sections"])[] = [
  "data",
  "purpose",
  "storage",
  "consent",
  "cookies",
  "analytics",
  "marketing",
  "attribution",
  "contactForms",
  "rights",
];

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...privacyTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function Privacy() {
  const { translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="flex flex-col gap-6">
            <Heading as="h1" level="display">
              {translate("privacy.title")}
            </Heading>
            <Text tone="muted">{translate("privacy.introduction")}</Text>
          </div>
          {privacySectionKeys.map((key) => (
            <section key={key} className="flex flex-col gap-3">
              <Heading as="h2" level="section">
                {translate(`privacy.sections.${key}.title`)}
              </Heading>
              <Text>{translate(`privacy.sections.${key}.body`)}</Text>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Update the privacy route test**

In `app/routes/$locale.test.tsx`, change the heading-count assertion from `toHaveLength(4)` to `toHaveLength(10)` in the "renders localized Privacy content for %s" test.

- [ ] **Step 4: Run the route tests and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- 'app/routes/$locale.test.tsx' && npm run typecheck`

Expected: PASS; typed template-literal scopes for `privacy.sections.<key>.title` compile against the translation registry.

- [ ] **Step 5: Commit the privacy expansion**

```bash
git add app/i18n/translations/privacy.ts 'app/routes/$locale.privacy.tsx' 'app/routes/$locale.test.tsx'
git commit -m "feat(privacy): expand localized privacy content"
```

### Task 7: Form Privacy Notice Pattern

**Files:**
- Create: `app/components/domain/form-privacy-notice.tsx`
- Create: `app/components/domain/form-privacy-notice.test.tsx`

- [ ] **Step 1: Write the failing component test**

Create `app/components/domain/form-privacy-notice.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { I18nProvider } from "../../i18n/i18n";
import { FormPrivacyNotice } from "./form-privacy-notice";

function renderNotice(
  marketingOptIn = false,
  onMarketingOptInChange = vi.fn(),
) {
  return render(
    <I18nProvider locale="en">
      <FormPrivacyNotice
        marketingOptIn={marketingOptIn}
        onMarketingOptInChange={onMarketingOptInChange}
      />
    </I18nProvider>,
  );
}

describe("FormPrivacyNotice", () => {
  it("renders the contextual privacy notice", () => {
    renderNotice();

    expect(
      screen.getByText("We use the information provided to respond to your inquiry. See our Privacy Notice for more information."),
    ).toBeVisible();
  });

  it("renders the marketing opt-in unchecked and never preselected", () => {
    renderNotice();

    expect(
      screen.getByRole("checkbox", {
        name: "I would like to receive occasional updates and offers.",
      }),
    ).not.toBeChecked();
  });

  it("reports opt-in changes to the caller", () => {
    const onChange = vi.fn();
    renderNotice(false, onChange);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders the Portuguese localization", () => {
    render(
      <I18nProvider locale="pt-BR">
        <FormPrivacyNotice
          marketingOptIn={false}
          onMarketingOptInChange={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Gostaria de receber atualizações e ofertas ocasionais.",
      }),
    ).not.toBeChecked();
    expect(
      screen.getByText(
        "Usamos as informações fornecidas para responder à sua solicitação. Consulte o Aviso de Privacidade para mais informações.",
      ),
    ).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/components/domain/form-privacy-notice.test.tsx`

Expected: FAIL because `app/components/domain/form-privacy-notice.tsx` does not exist.

- [ ] **Step 3: Implement the form privacy notice**

Create `app/components/domain/form-privacy-notice.tsx`:

```tsx
import { useI18n } from "../../i18n/i18n";
import { Text } from "../ui/text";

type FormPrivacyNoticeProps = {
  marketingOptIn: boolean;
  onMarketingOptInChange: (checked: boolean) => void;
};

export function FormPrivacyNotice({
  marketingOptIn,
  onMarketingOptInChange,
}: FormPrivacyNoticeProps) {
  const { translate } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <Text tone="muted">{translate("privacy.formNotice.body")}</Text>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => onMarketingOptInChange(event.target.checked)}
        />
        <Text as="span">{translate("privacy.formNotice.marketingOptIn")}</Text>
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Run the component test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/components/domain/form-privacy-notice.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the form privacy notice pattern**

```bash
git add app/components/domain/form-privacy-notice.tsx app/components/domain/form-privacy-notice.test.tsx
git commit -m "feat(privacy): add form privacy notice pattern"
```

### Task 8: Browser Validation

**Files:**
- Modify: `tests/e2e/routing.spec.ts`
- Create: `tests/e2e/privacy-consent.spec.ts`

- [ ] **Step 1: Seed consent in the routing spec**

The consent banner overlays the bottom of the viewport, which can cover the footer Privacy link that `routing.spec.ts` clicks. At the top of `tests/e2e/routing.spec.ts`, replace the existing import:

```ts
import { expect, test } from "./fixtures";
```

with:

```ts
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "../../app/consent/consent";
import { expect, test as base } from "./fixtures";

const test = base.extend<{ consented: void }>({
  consented: [
    async ({ page }, use) => {
      await page.addInitScript(
        ({ key, version }) => {
          localStorage.setItem(
            key,
            JSON.stringify({
              version,
              analytics: true,
              marketing: true,
              updatedAt: "2026-01-01T00:00:00.000Z",
            }),
          );
        },
        { key: CONSENT_STORAGE_KEY, version: CONSENT_VERSION },
      );
      await use();
    },
    { auto: true },
  ],
});
```

- [ ] **Step 2: Write the Phase 7 browser tests**

Create `tests/e2e/privacy-consent.spec.ts`:

```ts
import type { Page } from "@playwright/test";

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../../app/consent/consent";
import { expect, test } from "./fixtures";

const acceptedConsent = {
  version: CONSENT_VERSION,
  analytics: true,
  marketing: true,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

async function setStoredConsent(page: Page, value: unknown) {
  await page.addInitScript(
    ({ key, value }) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else if (typeof value === "string") {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
    { key: CONSENT_STORAGE_KEY, value },
  );
}

function collectAnalyticsMessages(page: Page) {
  const messages: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "debug" && message.text().startsWith("[analytics]"))
      messages.push(message.text());
  });
  return messages;
}

function hasPageView(messages: string[], pathname: string): boolean {
  return messages.some(
    (message) =>
      message.includes('"eventName":"page_view"') && message.includes(pathname),
  );
}

function pageViewMessages(messages: string[]): string[] {
  return messages.filter((message) =>
    message.includes('"eventName":"page_view"'),
  );
}

function storedConsent(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), CONSENT_STORAGE_KEY);
}

async function expectBanner(page: Page) {
  const banner = page.getByRole("region", { name: "Cookie preferences" });
  await expect(banner).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Accept all" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Reject non-essential" }),
  ).toBeVisible();
  await expect(banner.getByRole("button", { name: "Customize" })).toBeVisible();
}

test("shows the consent banner and keeps analytics idle before a choice", async ({
  page,
}) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await expectBanner(page);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  expect(pageViewMessages(messages)).toHaveLength(0);
});

test("accept all enables analytics and logs page views", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);
  expect(hasPageView(messages, "/en/")).toBe(true);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  expect(hasPageView(messages, "/en/about")).toBe(true);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({
    version: CONSENT_VERSION,
    analytics: true,
    marketing: true,
  });
});

test("reject non-essential keeps analytics disabled", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Reject non-essential" }).click();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  expect(pageViewMessages(messages)).toHaveLength(0);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: false, marketing: false });
});

test("customize enables only the selected categories", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Customize" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("checkbox", { name: "Necessary" }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("checkbox", { name: "Analytics" }),
  ).not.toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: "Marketing" }),
  ).not.toBeChecked();

  await dialog.getByRole("checkbox", { name: "Analytics" }).check();
  await dialog.getByRole("button", { name: "Save preferences" }).click();

  await expect(dialog).toHaveCount(0);
  expect(hasPageView(messages, "/en/")).toBe(true);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: true, marketing: false });
});

test("cookie settings remain accessible after dismissal and update consent", async ({
  page,
}) => {
  await setStoredConsent(page, null);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);

  const footer = page.getByRole("contentinfo");
  await footer.getByRole("button", { name: "Cookie settings" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("checkbox", { name: "Analytics" }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: "Marketing" }),
  ).toBeChecked();

  await dialog.getByRole("checkbox", { name: "Marketing" }).uncheck();
  await dialog.getByRole("button", { name: "Save preferences" }).click();

  await expect(dialog).toHaveCount(0);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: true, marketing: false });
});

test("consent persists across reloads", async ({ page }) => {
  await setStoredConsent(page, null);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await page.reload();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("contentinfo").getByRole("button", {
      name: "Cookie settings",
    }),
  ).toBeVisible();
});

test("a stored consent from an older version shows the banner again", async ({
  page,
}) => {
  await setStoredConsent(page, {
    version: CONSENT_VERSION - 1,
    analytics: true,
    marketing: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
  });

  await page.goto("/en/");
  await expectBanner(page);
});

test("malformed stored consent is treated as unresolved", async ({ page }) => {
  await setStoredConsent(
    page,
    JSON.stringify({
      version: CONSENT_VERSION,
      analytics: "yes",
      marketing: false,
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
  );

  await page.goto("/en/");
  await expectBanner(page);
});

test("escape closes the customize dialog without persisting", async ({
  page,
}) => {
  await setStoredConsent(page, null);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Customize" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(dialog).toHaveCount(0);
  expect(await storedConsent(page)).toBeNull();
  await expectBanner(page);
});

test("hero call to action emits cta_pressed after consent", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await page.getByRole("link", { name: "Explore the examples" }).click();

  await expect(page).toHaveURL("/en/services");
  expect(
    messages.some(
      (message) =>
        message.includes('"eventName":"cta_pressed"') &&
        message.includes("hero-cta"),
    ),
  ).toBe(true);
});

test("renders the Portuguese consent banner", async ({ page }) => {
  await setStoredConsent(page, null);

  await page.goto("/pt-BR/");

  const banner = page.getByRole("region", {
    name: "Preferências de cookies",
  });
  await expect(banner).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Aceitar tudo" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Recusar não essenciais" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Personalizar" }),
  ).toBeVisible();
});
```

- [ ] **Step 3: Run the focused Playwright tests**

Run: `npm run test:e2e -- tests/e2e/privacy-consent.spec.ts`

Expected: PASS with no console or page errors.

- [ ] **Step 4: Run the full deterministic validation**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run check`

Expected: formatting, lint, type checking, unit/component tests, coverage thresholds, production build, and static validation all pass.

- [ ] **Step 5: Run the full browser suite**

Run: `npm run test:e2e`

Expected: all Chromium tests pass, including the seeded routing spec.

- [ ] **Step 6: Update the knowledge graph**

Run: `graphify update .`

Expected: graph update completes without modifying application behavior.

- [ ] **Step 7: Request architecture review**

Delegate to `architecture-review` with Phase 7 acceptance criteria (`docs/template/PHASES.md` Phase 7 validation list), the complete Phase 6+7 diff, fresh `npm run check` and `npm run test:e2e` results, and an explicit statement that Phase 8 form/integration and later capabilities are out of scope. Resolve every high or medium finding before completion.

- [ ] **Step 8: Commit the browser evidence**

```bash
git add tests/e2e/routing.spec.ts tests/e2e/privacy-consent.spec.ts
git commit -m "test(consent): verify consent behavior in the browser"
```
