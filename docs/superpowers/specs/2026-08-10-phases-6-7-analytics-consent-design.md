# Design — Phases 6 and 7: Analytics Foundation and Consent, Privacy, and Attribution

**Date:** 2026-08-10

**Status:** Approved

## Scope

Implement Phase 6 (centralized analytics architecture) and Phase 7 (centralized consent handling, campaign attribution, privacy content) of `docs/PHASES.md`, following ADR 015 (Analytics Architecture) and ADR 016 (Privacy, Consent, and LGPD Architecture).

Future capabilities (third-party form/CRM integration, contact form, provider adapters) belong to later phases and are out of scope.

## Architecture

```text
React component
      ↓
capture(event)                 useAnalytics()
      ↓
AnalyticsProvider
      ↓
consent + attribution          ConsentProvider (root)
      ↓
eligible tracker adapters      registration: { tracker, consentCategory }
      ↓
console tracker (dev + e2e)    future GA4 / PostHog / etc.
```

Providers mount at the root `Layout`, above `Outlet`, so consent and analytics apply to every page including localized 404 pages.

## Decisions

### D1 — Root-mounted providers with self-localizing banner

`ConsentProvider` → `AnalyticsProvider` → `ConsentBanner` mount in root `Layout` inside `Document`'s body, wrapping `children`. The banner derives its locale from the URL pathname (same pattern as `Document`) and wraps itself in its own `I18nProvider`, mirroring the route `ErrorBoundary` pattern. The banner is hidden only when no locale can be derived (language-neutral 404 pages).

### D2 — Typed event union with central page views

```ts
type PageViewEvent = { eventName: 'page_view'; pathname: string; locale: SupportedLocale };
type CtaPressedEvent = { eventName: 'cta_pressed'; ctaId: string; context: string };
type LeadSubmittedEvent = { eventName: 'lead_submitted'; formId: string };
type AnalyticsCustomEvent = PageViewEvent | CtaPressedEvent | LeadSubmittedEvent;
```

`page_view` is dispatched centrally by `AnalyticsProvider` on initial load and on every route change (deduplicated per pathname so dev double-fires and repeated navigations to the same route produce one event). Routes never emit page views. `cta_pressed` is demonstrated from the home hero CTA. `lead_submitted` exists in the union now and gains an emitter in Phase 8.

Because a `page_view` dispatched before consent never reaches an ineligible tracker, the provider additionally dispatches one `page_view` for the current pathname whenever consent transitions from ineligible to eligible (e.g., accepting all on the landing page). This transition dispatch is not subject to pathname deduplication and matches the expectation that accepting all yields a page-view log.

### D3 — Console tracker classified as analytics

The development console tracker (`console.debug("[analytics]", event)`) declares `consentCategory: 'analytics'`, exactly like any other tracker. It never sends data anywhere; classifying it honestly means it only logs after analytics consent, which also makes consent gating observable in dev and in Playwright. `necessary` remains reserved for genuine functionality and is not used to bypass consent.

### D4 — Dispatch-time eligibility

`dispatchEvent(trackers, event, consent)` filters registrations by the current consent state, passed explicitly as a snapshot argument so the manager has no hidden global state. Changing consent therefore immediately changes tracker eligibility. Per-tracker try/catch isolates failures: one failing tracker never blocks other trackers or the caller, and `capture` never throws. Tracker errors are reported via `console.error` only in development.

### D5 — Allowlisted landing attribution in memory

`parseCampaignAttribution(searchParams)` reads only the six allowlisted UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_id`, `utm_term`, `utm_content`), trims values, drops empty ones, and ignores everything else. It is parsed once at provider mount (landing/current-visit attribution), kept in memory, and exposed through the analytics context for later consumers (Phase 8 lead form). It is never auto-injected into events or persisted.

### D6 — Consent model

```ts
type ConsentCategory = 'necessary' | 'analytics' | 'marketing';
type StoredConsent = { version: number; analytics: boolean; marketing: boolean; updatedAt: string };
```

`CONSENT_VERSION = 1`. Defaults: `necessary` enabled, `analytics` and `marketing` disabled. Stored in `localStorage` under a single `consent` key with the same try/catch guarding used by `theme.ts`. Reads are strictly validated at runtime: the record must be an object whose `version` equals `CONSENT_VERSION` (number), whose `analytics` and `marketing` are booleans, and whose `updatedAt` is a non-empty string. Any missing, malformed, wrong-version, or unparsable record is treated as unresolved (banner shows again) — never as affirmative consent.

### D7 — Consent UI

- Fixed banner with three comparable actions: **Accept all**, **Reject non-essential**, **Customize**.
- Customize screen is a native `<dialog>` with independent analytics/marketing toggles and a save action. Necessary is always enabled.
- The site footer exposes a persistent **Cookie settings** button that reopens the customize dialog, providing the withdrawal/change path.
- No new dependencies; no vendor scripts load anywhere in the template (no providers configured).

### D8 — Provider registration point

The default tracker registry (console tracker) lives in one obvious location (`app/analytics/trackers/index.ts`). Forks add provider adapters to this registry. There is no runtime registration API; unit tests exercise `dispatchEvent` with fake trackers directly.

## Components and Files

### Phase 6 — `app/analytics/`

- `types.ts` — event union, `Tracker`, `TrackerRegistration`, `ConsentCategory` import.
- `manager.ts` — `dispatchEvent(trackers, event, consent)` with isolation and dev-only error reporting.
- `attribution.ts` — `parseCampaignAttribution(searchParams)`.
- `trackers/console.ts` — console tracker.
- `trackers/index.ts` — default registry.
- `analytics.tsx` — `AnalyticsProvider` + `useAnalytics()`; page-view dispatch; attribution state.
- `events.type-test.ts` — `@ts-expect-error` proofs for invalid event names and payloads.
- Tests: `manager.test.ts`, `attribution.test.ts`, `analytics.test.tsx`.

### Phase 7 — `app/consent/` and UI

- `consent.ts` — types, `CONSENT_VERSION`, defaults, localStorage read/persist helpers.
- `consent-context.tsx` — `ConsentProvider` + `useConsent()` with `acceptAll()`, `rejectNonEssential()`, `updatePreferences()`, banner and dialog state.
- `components/site/consent-banner.tsx` — banner + customize dialog, self-localized.
- `components/domain/form-privacy-notice.tsx` — sample contextual privacy notice with separate unchecked marketing opt-in.
- Modified: `app/root.tsx` (providers + banner), `app/components/site/site-footer.tsx` (cookie settings button), `app/i18n/translations/` (consent dictionary + privacy expansion), `app/i18n/translations/index.ts`, `app/routes/$locale.privacy.tsx` (new placeholder sections), home route/hero (`cta_pressed` emission).
- Tests: `consent.test.ts`, `consent-context.test.tsx`, `consent-banner.test.tsx`, updated `root.test.tsx`/`$locale.test.tsx` where touched, `tests/e2e/privacy-consent.spec.ts`.

## Data Flow

1. Page loads → `ConsentProvider` reads `localStorage["consent"]`; unresolved (missing, malformed, or wrong version) ⇒ banner visible, only `necessary` trackers eligible.
2. User choice → state updates, persisted with version, banner closes, eligibility recomputed at next dispatch. If the change makes analytics (or marketing) trackers newly eligible, one `page_view` for the current pathname is dispatched so trackers observe the landing page.
3. Route change → `AnalyticsProvider` effect emits `page_view` via `dispatchEvent`, filtered by consent.
4. Component CTA → `capture({ eventName: 'cta_pressed', ... })` → same dispatch path.
5. Tracker failure → caught per tracker; other trackers still run; application unaffected.

## Error Handling

- Storage read/write failures are swallowed (browser privacy settings), like `theme.ts`.
- Tracker exceptions are caught in `dispatchEvent`; dev-only `console.error`.
- `capture` never throws regardless of tracker behavior.

## Testing

- **Unit:** manager isolation and eligibility by consent category (explicit consent snapshot); consent storage round-trips, version mismatch, malformed records and invalid JSON treated as unresolved; attribution allowlist (known UTM parsed, unknown params ignored, trimming); type-test file.
- **Component:** banner renders in both locales, actions call context handlers, dialog toggles, footer cookie-settings button; provider emits page views on navigation and exposes attribution; consent transition dispatches a page view for the current pathname; failing tracker does not break capture.
- **E2E (`tests/e2e/privacy-consent.spec.ts`):** banner appears without stored consent; accept all produces `[analytics]` page-view debug logs; reject non-essential produces none; customize analytics-only enables analytics but not marketing; cookie settings reopens after dismissal; consent persists across reload; stale consent version shows the banner again; no console errors.

## Out of Scope

- Contact/lead form (Phase 8).
- Real provider adapters and vendor script loading.
- Consent persistence beyond the single `consent` key.
- Attribution persistence across sessions.
