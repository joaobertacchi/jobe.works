# ADR 028 — PostHog Analytics Provider

**Status:** Accepted

**Refines:** ADR 015 (provider configuration and optional providers) and ADR 016 (script loading) for the jobe.works fork.

## Context

The jobe.works fork needs product analytics on top of the typed event model from ADR 015. Before this decision the only tracker was the development console tracker, so consented page views and conversion events reached no provider.

ADR 015 already names PostHog and the `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` variables. This ADR records the fork's choices: provider, SDK, region, which SDK features run, and how the key is supplied without committing it.

## Decision

- Use PostHog Cloud US (`https://us.i.posthog.com`) through the `posthog-js` SDK, implemented as an analytics-consent tracker in `app/analytics/trackers/posthog.ts`.
- The tracker is registered only when `VITE_POSTHOG_KEY` is non-empty. `VITE_POSTHOG_HOST` overrides the US host.
- The SDK is loaded with a dynamic `import()` on the first eligible event, so its chunk is neither downloaded nor evaluated before analytics consent (ADR 016, Script Loading).
- Only the typed events from ADR 015 are sent. Autocapture, automatic pageviews and page leaves, session recording, heatmaps, dead clicks, exception and performance capture, surveys, product tours, conversations, web experiments, feature flags/remote config, and external script loading are disabled.
- `page_view` maps to PostHog's `$pageview`; other events keep their internal names, with properties in snake_case.
- `save_campaign_params` is disabled, so the SDK does not extract campaign parameters or advertising click identifiers (`gclid`, `fbclid`, ...) from URLs. The tracker instead reads the landing URL once at app start and attaches only ADR 015's six allowlisted `utm_*` parameters to each event, using the allowlist in `app/analytics/attribution.ts`.
- A `before_send` hook reduces every URL-like property (`$current_url`, `$referrer`, initial values in `$set`/`$set_once`) to origin, path, and the same allowlisted parameters. `mask_personal_data_properties` is also enabled.
- `TrackerRegistration` gains an optional `onConsentChange(granted)` callback that `AnalyticsProvider` calls when eligibility changes. On withdrawal, PostHog calls `opt_out_capturing()`. With `opt_out_persistence_by_default`, this also stops persistence. The next eligible event opts back in without emitting `$opt_in`.
- To close measurement gaps without autocapture, the event union gains `contact_link_pressed`, `lead_submit_failed`, `locale_switched`, and `scorecard_step_answered`. None carries answers or form contents.

## Configuration

- The project key is public once compiled into the bundle (ADR 018), but it is still kept out of the repository. Developers put it in the git-ignored `.env` (see `.env.example`), and CI reads the GitHub Actions repository variables `POSTHOG_KEY` and `POSTHOG_HOST`.
- CI builds the deploy artifact in a dedicated step after the browser tests. The Playwright server builds with a fake key and an intercepted host (`tests/e2e/posthog-host.ts`), and Vitest blanks the variables, so test runs never send events to a real project.

## Build vs Buy

`posthog-js` is used instead of hand-written calls to PostHog's capture API. The SDK provides distinct and session identifiers, batching, retry, consent/opt-out persistence, and bot filtering. Re-implementing these would cost more than the dependency, whose cost is confined to a lazily loaded chunk after consent.

## Consequences

- Visitors who accept analytics receive a PostHog identifier in a cookie and in `localStorage`. The privacy notice discloses the provider, the international transfer to the United States, what is sent, and that withdrawal stops collection.
- PostHog filters automated browsers. The e2e suite presents a regular browser to observe requests, and production keeps the filter.
- Discarding client IP addresses is a PostHog project setting, outside the repository.
- Adding autocapture, session replay, or another PostHog feature later requires revisiting this ADR and the privacy notice.
