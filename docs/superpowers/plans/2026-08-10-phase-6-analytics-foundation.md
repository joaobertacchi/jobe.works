# Phase 6 Analytics Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a centralized, provider-independent analytics layer with a typed event union, consent-aware tracker dispatch, page-view tracking, a console tracker, campaign attribution parsing, and deterministic tests.

**Architecture:** Application components emit typed domain events through a single `useAnalytics()` hook. `AnalyticsProvider` (mounted at the root layout) filters tracker registrations by an explicit consent snapshot, dispatches `page_view` centrally on navigation, and parses allowlisted UTM attribution once at mount. ADR 015 defines the event model and tracker abstraction; ADR 016 consent categories are consumed but implemented in Phase 7.

**Tech Stack:** React Router Framework Mode v8, React 19, TypeScript 5.9, Vitest, React Testing Library, Playwright

---

## File Structure

- Create `app/consent/consent.ts`: shared consent category and snapshot types (full consent model lands in Phase 7).
- Create `app/analytics/types.ts`: discriminated event union, `Tracker`, `TrackerRegistration`.
- Create `app/analytics/events.type-test.ts`: type-level proof that invalid events fail type checking.
- Create `app/analytics/manager.ts`: eligibility filtering and isolated tracker dispatch.
- Create `app/analytics/trackers/console.ts`: development console tracker.
- Create `app/analytics/trackers/index.ts`: default tracker registry.
- Create `app/analytics/attribution.ts`: allowlisted UTM campaign parser.
- Create `app/analytics/analytics.tsx`: `AnalyticsProvider` + `useAnalytics()` with central page views.
- Modify `app/root.tsx`: mount `AnalyticsProvider` at the root with the disabled consent snapshot.
- Modify `app/routes/$locale._index.tsx`: emit `cta_pressed` from the hero CTA.
- Modify `app/routes/$locale.test.tsx`: wrap the memory router in `AnalyticsProvider` and test the CTA event.

### Task 1: Shared Consent Types

**Files:**
- Create: `app/consent/consent.ts`

- [ ] **Step 1: Create the shared consent type module**

```ts
export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentSnapshot = {
  analytics: boolean;
  marketing: boolean;
};
```

- [ ] **Step 2: Verify type checking**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Commit the consent type foundation**

```bash
git add app/consent/consent.ts
git commit -m "feat(consent): define consent categories"
```

### Task 2: Typed Event Model

**Files:**
- Create: `app/analytics/types.ts`
- Create: `app/analytics/events.type-test.ts`

- [ ] **Step 1: Write the failing type tests**

Create `app/analytics/events.type-test.ts`:

```ts
import type { AnalyticsCustomEvent, Tracker } from "./types";

declare const capture: (event: AnalyticsCustomEvent) => void;
declare const tracker: Tracker;

capture({ eventName: "page_view", pathname: "/en/about", locale: "en" });
capture({ eventName: "cta_pressed", ctaId: "hero-cta", context: "homepage" });
capture({ eventName: "lead_submitted", formId: "contact" });
tracker({ eventName: "page_view", pathname: "/pt-BR/", locale: "pt-BR" });

// @ts-expect-error Unknown event names are rejected.
capture({ eventName: "purchase_completed" });

// @ts-expect-error Required event properties are enforced.
capture({ eventName: "cta_pressed" });

// @ts-expect-error Events reject properties from other events.
capture({
  eventName: "cta_pressed",
  ctaId: "hero-cta",
  context: "homepage",
  formId: "contact",
});

// @ts-expect-error Property types are validated.
capture({ eventName: "cta_pressed", ctaId: 42, context: "homepage" });

// @ts-expect-error Page views require a supported locale.
capture({ eventName: "page_view", pathname: "/en/", locale: "fr" });

// @ts-expect-error Trackers only receive domain events.
tracker({ eventName: "custom", payload: 1 });
```

- [ ] **Step 2: Run type checking and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run typecheck`

Expected: FAIL because `app/analytics/types.ts` does not exist.

- [ ] **Step 3: Implement the typed event contract**

Create `app/analytics/types.ts`:

```ts
import type { ConsentCategory } from "../consent/consent";
import type { SupportedLocale } from "../i18n/config";

export type PageViewEvent = {
  eventName: "page_view";
  pathname: string;
  locale: SupportedLocale;
};

export type CtaPressedEvent = {
  eventName: "cta_pressed";
  ctaId: string;
  context: string;
};

export type LeadSubmittedEvent = {
  eventName: "lead_submitted";
  formId: string;
};

export type AnalyticsCustomEvent =
  | PageViewEvent
  | CtaPressedEvent
  | LeadSubmittedEvent;

export type Tracker = (event: AnalyticsCustomEvent) => void | Promise<void>;

export type TrackerRegistration = {
  tracker: Tracker;
  consentCategory: ConsentCategory;
};
```

- [ ] **Step 4: Run type checking and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit the typed event model**

```bash
git add app/analytics/types.ts app/analytics/events.type-test.ts
git commit -m "feat(analytics): define typed event union"
```

### Task 3: Tracker Dispatch with Failure Isolation

**Files:**
- Create: `app/analytics/manager.ts`
- Create: `app/analytics/manager.test.ts`

- [ ] **Step 1: Write the failing manager tests**

Create `app/analytics/manager.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ConsentSnapshot } from "../consent/consent";
import { dispatchEvent, isTrackerEligible } from "./manager";
import type {
  AnalyticsCustomEvent,
  Tracker,
  TrackerRegistration,
} from "./types";

const ctaEvent: AnalyticsCustomEvent = {
  eventName: "cta_pressed",
  ctaId: "hero-cta",
  context: "homepage",
};

const consentWith: (overrides?: Partial<ConsentSnapshot>) => ConsentSnapshot = (
  overrides = {},
) => ({ analytics: false, marketing: false, ...overrides });

function registration(
  tracker: Tracker,
  consentCategory: TrackerRegistration["consentCategory"],
): TrackerRegistration {
  return { tracker, consentCategory };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTrackerEligible", () => {
  it("keeps necessary trackers enabled without optional consent", () => {
    expect(
      isTrackerEligible(registration(vi.fn(), "necessary"), consentWith()),
    ).toBe(true);
  });

  it("requires analytics consent for analytics trackers", () => {
    const tracker = registration(vi.fn(), "analytics");
    expect(isTrackerEligible(tracker, consentWith())).toBe(false);
    expect(
      isTrackerEligible(tracker, consentWith({ analytics: true })),
    ).toBe(true);
  });

  it("requires marketing consent for marketing trackers", () => {
    const tracker = registration(vi.fn(), "marketing");
    expect(isTrackerEligible(tracker, consentWith())).toBe(false);
    expect(
      isTrackerEligible(tracker, consentWith({ marketing: true })),
    ).toBe(true);
  });

  it("keeps analytics and marketing eligibility independent", () => {
    const analyticsTracker = registration(vi.fn(), "analytics");
    const marketingTracker = registration(vi.fn(), "marketing");
    const consent = consentWith({ analytics: true });

    expect(isTrackerEligible(analyticsTracker, consent)).toBe(true);
    expect(isTrackerEligible(marketingTracker, consent)).toBe(false);
  });
});

describe("dispatchEvent", () => {
  it("invokes eligible trackers with the event", async () => {
    const analyticsTracker = vi.fn();
    const trackers = [
      registration(analyticsTracker, "analytics"),
      registration(vi.fn(), "marketing"),
    ];

    await dispatchEvent(trackers, ctaEvent, consentWith({ analytics: true }));

    expect(analyticsTracker).toHaveBeenCalledWith(ctaEvent);
  });

  it("does not invoke trackers before their consent category is granted", async () => {
    const analyticsTracker = vi.fn();
    const marketingTracker = vi.fn();

    await dispatchEvent(
      [
        registration(analyticsTracker, "analytics"),
        registration(marketingTracker, "marketing"),
      ],
      ctaEvent,
      consentWith(),
    );

    expect(analyticsTracker).not.toHaveBeenCalled();
    expect(marketingTracker).not.toHaveBeenCalled();
  });

  it("changes eligibility when the consent snapshot changes", async () => {
    const marketingTracker = vi.fn();
    const trackers = [registration(marketingTracker, "marketing")];

    await dispatchEvent(trackers, ctaEvent, consentWith());
    expect(marketingTracker).not.toHaveBeenCalled();

    await dispatchEvent(trackers, ctaEvent, consentWith({ marketing: true }));
    expect(marketingTracker).toHaveBeenCalledWith(ctaEvent);
  });

  it("keeps other trackers running when one tracker throws", async () => {
    const failingTracker = vi.fn(() => {
      throw new Error("Provider down");
    });
    const healthyTracker = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      dispatchEvent(
        [
          registration(failingTracker, "necessary"),
          registration(healthyTracker, "necessary"),
        ],
        ctaEvent,
        consentWith(),
      ),
    ).resolves.toBeUndefined();

    expect(healthyTracker).toHaveBeenCalledWith(ctaEvent);
    expect(consoleError).toHaveBeenCalledWith(
      "[analytics] tracker failed",
      expect.any(Error),
    );
  });

  it("keeps other trackers running when one tracker rejects", async () => {
    const failingTracker = vi.fn(() => Promise.reject(new Error("Provider down")));
    const healthyTracker = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await dispatchEvent(
      [
        registration(failingTracker, "necessary"),
        registration(healthyTracker, "necessary"),
      ],
      ctaEvent,
      consentWith(),
    );

    expect(healthyTracker).toHaveBeenCalledWith(ctaEvent);
  });

  it("suppresses tracker error reporting outside development", async () => {
    const failingTracker = vi.fn(() => {
      throw new Error("Provider down");
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.stubEnv("DEV", false);

    await dispatchEvent(
      [registration(failingTracker, "necessary")],
      ctaEvent,
      consentWith(),
    );

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("awaits asynchronous trackers before resolving", async () => {
    const order: string[] = [];
    const trackers = [
      registration(
        async () => {
          order.push("first");
        },
        "necessary",
      ),
      registration(
        () => {
          order.push("second");
        },
        "necessary",
      ),
    ];

    await dispatchEvent(trackers, ctaEvent, consentWith());

    expect(order).toEqual(["first", "second"]);
  });
});
```

- [ ] **Step 2: Run the manager test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/analytics/manager.test.ts`

Expected: FAIL because `app/analytics/manager.ts` does not exist.

- [ ] **Step 3: Implement the manager**

Create `app/analytics/manager.ts`:

```ts
import type { ConsentSnapshot } from "../consent/consent";
import type { AnalyticsCustomEvent, TrackerRegistration } from "./types";

export function isTrackerEligible(
  registration: TrackerRegistration,
  consent: ConsentSnapshot,
): boolean {
  switch (registration.consentCategory) {
    case "necessary":
      return true;
    case "analytics":
      return consent.analytics;
    case "marketing":
      return consent.marketing;
  }
}

export async function dispatchEvent(
  trackers: readonly TrackerRegistration[],
  event: AnalyticsCustomEvent,
  consent: ConsentSnapshot,
): Promise<void> {
  for (const registration of trackers) {
    if (!isTrackerEligible(registration, consent)) continue;
    try {
      await registration.tracker(event);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[analytics] tracker failed", error);
      }
    }
  }
}
```

- [ ] **Step 4: Run the manager test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/analytics/manager.test.ts`

Expected: PASS with all isolation and eligibility cases covered.

- [ ] **Step 5: Commit the manager**

```bash
git add app/analytics/manager.ts app/analytics/manager.test.ts
git commit -m "feat(analytics): dispatch typed events with isolation"
```

### Task 4: Console Tracker and Default Registry

**Files:**
- Create: `app/analytics/trackers/console.ts`
- Create: `app/analytics/trackers/index.ts`

- [ ] **Step 1: Implement the console tracker**

Create `app/analytics/trackers/console.ts`:

```ts
import type { Tracker } from "../types";

export const consoleTracker: Tracker = (event) => {
  console.debug("[analytics]", event);
};
```

- [ ] **Step 2: Implement the default registry**

Create `app/analytics/trackers/index.ts`:

```ts
import type { TrackerRegistration } from "../types";
import { consoleTracker } from "./console";

export const defaultTrackerRegistrations: readonly TrackerRegistration[] = [
  { tracker: consoleTracker, consentCategory: "analytics" },
];
```

- [ ] **Step 3: Verify type checking and lint**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 4: Commit the console tracker**

```bash
git add app/analytics/trackers/console.ts app/analytics/trackers/index.ts
git commit -m "feat(analytics): add console tracker registry"
```

### Task 5: Campaign Attribution Parser

**Files:**
- Create: `app/analytics/attribution.ts`
- Create: `app/analytics/attribution.test.ts`

- [ ] **Step 1: Write the failing attribution tests**

Create `app/analytics/attribution.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { parseCampaignAttribution } from "./attribution";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parseCampaignAttribution", () => {
  it("parses every allowlisted UTM parameter", () => {
    expect(
      parseCampaignAttribution(
        params(
          "utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_id=campaign-1&utm_term=services&utm_content=hero",
        ),
      ),
    ).toEqual({
      source: "newsletter",
      medium: "email",
      campaign: "launch",
      campaignId: "campaign-1",
      term: "services",
      content: "hero",
    });
  });

  it("returns an empty attribution when no parameters are present", () => {
    expect(parseCampaignAttribution(params(""))).toEqual({});
  });

  it("ignores parameters outside the allowlist", () => {
    expect(
      parseCampaignAttribution(
        params("utm_source=newsletter&gclid=abc123&email=user%40example.com&next=/account"),
      ),
    ).toEqual({ source: "newsletter" });
  });

  it("trims values and drops empty or whitespace-only values", () => {
    expect(
      parseCampaignAttribution(
        params("utm_source=%20newsletter%20&utm_medium=%20%20&utm_campaign="),
      ),
    ).toEqual({ source: "newsletter" });
  });

  it("does not derive attribution from unknown case variants", () => {
    expect(
      parseCampaignAttribution(params("utm_source=newsletter&UTM_MEDIUM=email")),
    ).toEqual({ source: "newsletter" });
  });

  it("uses the first value when a parameter repeats", () => {
    expect(
      parseCampaignAttribution(params("utm_source=first&utm_source=second")),
    ).toEqual({ source: "first" });
  });
});
```

- [ ] **Step 2: Run the attribution test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/analytics/attribution.test.ts`

Expected: FAIL because `app/analytics/attribution.ts` does not exist.

- [ ] **Step 3: Implement the allowlisted parser**

Create `app/analytics/attribution.ts`:

```ts
const utmParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const;

type UtmParameter = (typeof utmParameters)[number];

export type CampaignAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  campaignId?: string;
  term?: string;
  content?: string;
};

const attributionKeys: Record<UtmParameter, keyof CampaignAttribution> = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_id: "campaignId",
  utm_term: "term",
  utm_content: "content",
};

export function parseCampaignAttribution(
  searchParams: URLSearchParams,
): CampaignAttribution {
  const attribution: CampaignAttribution = {};
  for (const parameter of utmParameters) {
    const value = searchParams.get(parameter)?.trim();
    if (value) attribution[attributionKeys[parameter]] = value;
  }
  return attribution;
}
```

- [ ] **Step 4: Run the attribution test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/analytics/attribution.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the attribution parser**

```bash
git add app/analytics/attribution.ts app/analytics/attribution.test.ts
git commit -m "feat(analytics): parse allowlisted campaign attribution"
```

### Task 6: Analytics Provider, Hook, and Page Views

**Files:**
- Create: `app/analytics/analytics.tsx`
- Create: `app/analytics/analytics.test.tsx`

- [ ] **Step 1: Write the failing provider tests**

Create `app/analytics/analytics.test.tsx`:

```tsx
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { Link, MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ConsentSnapshot } from "../consent/consent";
import { AnalyticsProvider, useAnalytics } from "./analytics";
import { consoleTracker } from "./trackers/console";
import { defaultTrackerRegistrations } from "./trackers";
import type { AnalyticsCustomEvent, TrackerRegistration } from "./types";

function Harness({
  consent,
  trackers,
  children,
}: {
  consent: ConsentSnapshot;
  trackers?: readonly TrackerRegistration[];
  children?: React.ReactNode;
}) {
  return (
    <MemoryRouter initialEntries={["/en/"]}>
      <AnalyticsProvider consent={consent} trackers={trackers}>
        {children ?? <Probe />}
      </AnalyticsProvider>
    </MemoryRouter>
  );
}

function Probe() {
  const { capture, attribution } = useAnalytics();
  return (
    <div>
      <button
        onClick={() =>
          capture({ eventName: "cta_pressed", ctaId: "probe", context: "test" })
        }
      >
        Emit
      </button>
      <Link to="/en/about">About</Link>
      <span data-testid="attribution-source">{attribution.source ?? ""}</span>
    </div>
  );
}

const accepted: ConsentSnapshot = { analytics: true, marketing: true };
const rejected: ConsentSnapshot = { analytics: false, marketing: false };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAnalytics", () => {
  it("throws outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(
      "useAnalytics must be used within AnalyticsProvider",
    );
  });
});

describe("AnalyticsProvider", () => {
  it("forwards typed events to eligible trackers", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit" }));

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "cta_pressed",
        ctaId: "probe",
        context: "test",
      });
    });
  });

  it("does not forward events before consent is granted", () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit" }));

    expect(tracker).not.toHaveBeenCalled();
  });

  it("never throws when a tracker fails", async () => {
    const failingTracker = vi.fn(() => {
      throw new Error("Provider down");
    });
    const healthyTracker = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <Harness
        consent={accepted}
        trackers={[
          { tracker: failingTracker, consentCategory: "analytics" },
          { tracker: healthyTracker, consentCategory: "analytics" },
        ]}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Emit" }));
    });

    expect(healthyTracker).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[analytics] tracker failed",
      expect.any(Error),
    );
  });

  it("dispatches a page view for the current pathname on mount when consent is granted", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
  });

  it("does not dispatch a page view before analytics consent", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await act(() => Promise.resolve());

    expect(tracker).not.toHaveBeenCalled();
  });

  it("dispatches a page view after navigation", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });

    fireEvent.click(screen.getByRole("link", { name: "About" }));

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/about",
        locale: "en",
      });
    });
  });

  it("dispatches a single page view per pathname under StrictMode", async () => {
    const tracker = vi.fn();
    render(
      <StrictMode>
        <Harness
          consent={accepted}
          trackers={[{ tracker, consentCategory: "analytics" }]}
        />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
    await act(() => Promise.resolve());

    const pageViews = tracker.mock.calls.filter(
      ([event]) => event.eventName === "page_view",
    );
    expect(pageViews).toHaveLength(1);
  });

  it("dispatches a page view for the current pathname when consent becomes eligible", async () => {
    const tracker = vi.fn();
    const { rerender } = render(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );
    await act(() => Promise.resolve());
    expect(tracker).not.toHaveBeenCalled();

    rerender(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
  });

  it("dispatches a page view when a second category becomes eligible", async () => {
    const analyticsTracker = vi.fn();
    const marketingTracker = vi.fn();
    const trackers: readonly TrackerRegistration[] = [
      { tracker: analyticsTracker, consentCategory: "analytics" },
      { tracker: marketingTracker, consentCategory: "marketing" },
    ];

    const { rerender } = render(
      <Harness consent={{ analytics: true, marketing: false }} trackers={trackers} />,
    );
    await waitFor(() => {
      expect(analyticsTracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
    expect(marketingTracker).not.toHaveBeenCalled();

    rerender(
      <Harness consent={{ analytics: true, marketing: true }} trackers={trackers} />,
    );

    await waitFor(() => {
      expect(marketingTracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
  });

  it("exposes landing attribution parsed from the current URL", () => {
    window.history.replaceState(null, "", "/en/?utm_source=newsletter");

    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker: vi.fn(), consentCategory: "analytics" }]}
      />,
    );

    expect(screen.getByTestId("attribution-source")).toHaveTextContent(
      "newsletter",
    );
  });

  it("exposes an empty attribution when the URL has no allowlisted parameters", () => {
    window.history.replaceState(null, "", "/en/?gclid=abc123");

    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker: vi.fn(), consentCategory: "analytics" }]}
      />,
    );

    expect(screen.getByTestId("attribution-source")).toHaveTextContent("");
  });
});

describe("console tracker", () => {
  it("logs events through console.debug", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const event: AnalyticsCustomEvent = {
      eventName: "cta_pressed",
      ctaId: "hero-cta",
      context: "homepage",
    };

    consoleTracker(event);

    expect(debug).toHaveBeenCalledWith("[analytics]", event);
  });

  it("is registered as an analytics-consent tracker", () => {
    expect(defaultTrackerRegistrations).toContainEqual({
      tracker: consoleTracker,
      consentCategory: "analytics",
    });
  });
});
```

- [ ] **Step 2: Run the provider test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/analytics/analytics.test.tsx`

Expected: FAIL because `app/analytics/analytics.tsx` does not exist.

- [ ] **Step 3: Implement the provider**

Create `app/analytics/analytics.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";

import type { ConsentSnapshot } from "../consent/consent";
import { defaultLocale, getLocaleFromPathname } from "../i18n/config";
import {
  parseCampaignAttribution,
  type CampaignAttribution,
} from "./attribution";
import { dispatchEvent } from "./manager";
import { defaultTrackerRegistrations } from "./trackers";
import type { AnalyticsCustomEvent, TrackerRegistration } from "./types";

type AnalyticsValue = {
  capture: (event: AnalyticsCustomEvent) => void;
  attribution: CampaignAttribution;
};

const AnalyticsContext = createContext<AnalyticsValue | null>(null);

export function AnalyticsProvider({
  children,
  consent,
  trackers = defaultTrackerRegistrations,
}: {
  children: ReactNode;
  consent: ConsentSnapshot;
  trackers?: readonly TrackerRegistration[];
}) {
  const { pathname } = useLocation();
  const [attribution] = useState(() => {
    const search = typeof window === "undefined" ? "" : window.location.search;
    return parseCampaignAttribution(new URLSearchParams(search));
  });

  const capture = useCallback(
    (event: AnalyticsCustomEvent) => {
      void dispatchEvent(trackers, event, consent);
    },
    [trackers, consent],
  );

  const analyticsEligible = consent.analytics;
  const marketingEligible = consent.marketing;
  const wasAnalyticsEligible = useRef(analyticsEligible);
  const wasMarketingEligible = useRef(marketingEligible);
  const lastDispatchedPathname = useRef<string | null>(null);

  useEffect(() => {
    const analyticsBecameEligible =
      analyticsEligible && !wasAnalyticsEligible.current;
    const marketingBecameEligible =
      marketingEligible && !wasMarketingEligible.current;
    wasAnalyticsEligible.current = analyticsEligible;
    wasMarketingEligible.current = marketingEligible;
    const becameEligible = analyticsBecameEligible || marketingBecameEligible;
    if (pathname === lastDispatchedPathname.current && !becameEligible) return;
    lastDispatchedPathname.current = pathname;
    capture({
      eventName: "page_view",
      pathname,
      locale: getLocaleFromPathname(pathname) ?? defaultLocale,
    });
  }, [analyticsEligible, marketingEligible, capture, pathname]);

  const value = useMemo<AnalyticsValue>(
    () => ({ attribution, capture }),
    [attribution, capture],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsValue {
  const value = useContext(AnalyticsContext);
  if (!value) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return value;
}
```

- [ ] **Step 4: Run the provider test and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/analytics/analytics.test.tsx`

Expected: PASS with all navigation, deduplication, transition, attribution, and isolation cases covered.

- [ ] **Step 5: Commit the analytics provider**

```bash
git add app/analytics/analytics.tsx app/analytics/analytics.test.tsx
git commit -m "feat(analytics): add provider with central page views"
```

### Task 7: Mount the Analytics Provider at the Root

**Files:**
- Modify: `app/root.tsx`

The home route emits analytics events, so the provider must be mounted before that happens. Phase 6 wires `AnalyticsProvider` directly with the conservative disabled consent snapshot; Phase 7 replaces this wiring with the consent-context bridge.

- [ ] **Step 1: Wire the provider into the root layout**

In `app/root.tsx`:

- Add the import:

```tsx
import { AnalyticsProvider } from "./analytics/analytics";
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
      <AnalyticsProvider consent={{ analytics: false, marketing: false }}>
        {children}
      </AnalyticsProvider>
    </Document>
  );
}
```

- [ ] **Step 2: Run the root and route tests and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/root.test.tsx 'app/routes/$locale.test.tsx'`

Expected: PASS; the app now renders with analytics available everywhere.

- [ ] **Step 3: Commit the root wiring**

```bash
git add app/root.tsx
git commit -m "feat(analytics): mount provider at the root"
```

### Task 8: Demonstrate the Capture Pattern from a Component

**Files:**
- Modify: `app/routes/$locale._index.tsx`
- Modify: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Emit `cta_pressed` from the home hero call to action**

In `app/routes/$locale._index.tsx`:

- Add the import:

```tsx
import { useAnalytics } from "../analytics/analytics";
```

- In the `Home` component body, after `const { locale, translate } = useI18n();`, add:

```tsx
const { capture } = useAnalytics();
```

- Replace the hero `actions` prop:

```tsx
actions={
  <TextLink
    to={`/${locale}/services`}
    onClick={() =>
      capture({
        eventName: "cta_pressed",
        ctaId: "hero-cta",
        context: "homepage",
      })
    }
  >
    {translate("home.cta")}
  </TextLink>
}
```

- [ ] **Step 2: Update the localized route test harness**

In `app/routes/$locale.test.tsx`:

- Add `Outlet` to the existing `react-router` import:

```tsx
import {
  createMemoryRouter,
  isRouteErrorResponse,
  Outlet,
  RouterProvider,
  useParams,
  useRouteError,
} from "react-router";
```

- Add imports for the analytics provider and types:

```tsx
import { AnalyticsProvider } from "../analytics/analytics";
import type { TrackerRegistration } from "../analytics/types";
```

- Change the `renderLocalizedRoute` signature to accept trackers and wrap the router:

```tsx
function renderLocalizedRoute(
  pathname: string,
  validateLocale = false,
  trackers: readonly TrackerRegistration[] = [],
) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        Component: () => (
          <AnalyticsProvider
            consent={{ analytics: true, marketing: true }}
            trackers={trackers}
          >
            <Outlet />
          </AnalyticsProvider>
        ),
        children: [
          {
            path: ":locale",
            Component: LocaleLayout,
            ErrorBoundary: TestErrorBoundary,
            HydrateFallback: () => <p>Loading</p>,
            loader: validateLocale
              ? (args) =>
                  clientLoader({
                    ...args,
                    serverLoader: async () => {
                      try {
                        return getLoaderData(
                          new URL(args.request.url).pathname,
                        );
                      } catch {
                        throw new Response(null, { status: 404 });
                      }
                    },
                  } as never)
              : ({ request }) =>
                  getLoaderData(new URL(request.url).pathname),
            children: [
              { index: true, Component: Home },
              { path: "about", Component: About },
              { path: "services", Component: Services },
              { path: "privacy", Component: Privacy },
              { path: "404", Component: NotFound },
              {
                path: "*",
                Component: LocalizedCatchAll,
                handle: { languageSwitcher: false },
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [pathname] },
  );
  render(<RouterProvider router={router} />);
  return router;
}
```

- [ ] **Step 3: Add the CTA event test**

In `app/routes/$locale.test.tsx`, inside the existing "localized route layout" describe block, add:

```tsx
it("emits cta_pressed when the hero call to action is clicked", async () => {
  const tracker = vi.fn();
  renderLocalizedRoute("/en/", false, [
    { tracker, consentCategory: "analytics" },
  ]);

  fireEvent.click(
    await screen.findByRole("link", { name: "Explore the examples" }),
  );

  await vi.waitFor(() => {
    expect(tracker).toHaveBeenCalledWith({
      eventName: "cta_pressed",
      ctaId: "hero-cta",
      context: "homepage",
    });
  });
});
```

Add `fireEvent` to the existing `@testing-library/react` import in the test file.

- [ ] **Step 4: Run the route tests and verify GREEN**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- 'app/routes/$locale.test.tsx'`

Expected: PASS; the harness wrapper keeps all existing route tests green while the new CTA test passes.

- [ ] **Step 5: Commit the capture pattern demonstration**

```bash
git add app/routes/\$locale._index.tsx app/routes/\$locale.test.tsx
git commit -m "feat(analytics): emit cta_pressed from hero"
```

### Task 9: Phase 6 Validation and Review

- [ ] **Step 1: Run the full deterministic validation**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run check`

Expected: formatting, lint, type checking, unit/component tests, coverage thresholds, production build, and static validation all pass.

- [ ] **Step 2: Run the full browser suite**

Run: `npm run test:e2e`

Expected: all Chromium tests pass with no new console errors.

- [ ] **Step 3: Update the knowledge graph**

Run: `graphify update .`

Expected: graph update completes without modifying application behavior.

- [ ] **Step 4: Request architecture review**

Delegate to `architecture-review` with Phase 6 acceptance criteria (`docs/PHASES.md` Phase 6 validation list), the complete Phase 6 diff, fresh `npm run check` and `npm run test:e2e` results, and an explicit statement that Phase 7 consent UI, Phase 8 form, and later capabilities are out of scope. Resolve every high or medium finding before completion.
