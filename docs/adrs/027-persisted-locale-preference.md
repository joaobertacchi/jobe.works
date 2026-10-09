# ADR 027 — Persisted Locale Preference and Pre-Hydration Root Redirect

**Status:** Accepted

**Supersedes:** the "Root Route" section of ADR 008 and the "Root Locale Detection" and "Locale Persistence" sections of ADR 014.

## Context

The root `/` redirected only after the app bundle downloaded and React hydrated, so visitors saw a "Selecting language" status before the localized home appeared. It chose the locale from the browser language and never remembered the visitor's choice.

The jobe.works fork wants `/` to open immediately in the last language used, and in `pt-BR` on a first visit.

Search engines influenced the fallback. Googlebot renders with an `en-US` browser and keeps no storage between fetches. With browser-language detection, the root's link equity flowed to `/en/` while `hreflang="x-default"` declared `/pt-BR/`. A fixed `pt-BR` fallback makes the root's redirect deterministic for crawlers and consistent with `x-default`.

## Decision

- Every localized page stores its locale in `localStorage` under `locale` (`app/i18n/locale-preference.ts`). Visiting a locale, through the language switcher or a direct link, makes it the preference.
- The prerendered root document head carries an inline script, placed before stylesheets and independent of the app bundle, that calls `location.replace` to the stored locale's root, or `/pt-BR/` when nothing valid is stored or storage is blocked. Browser language is no longer consulted.
- `<noscript><meta http-equiv="refresh">` sends visitors without JavaScript to `/pt-BR/`, and the root body links to every locale root for crawlers that do not run scripts.
- The root route keeps a client effect with the same rule for in-app navigation to `/`, where the head script does not run again.
- The stored locale is a functional preference, like the theme, and is classified as necessary under ADR 016. The privacy page discloses it.

## Consequences

- `/` no longer paints a status message; the remaining cost is one HTML round trip, because GitHub Pages (ADR 026) cannot redirect server-side.
- The localized URL remains authoritative for rendering; the preference only chooses where `/` goes.
- Visitors whose browser prefers English land on `/pt-BR/` on their first visit to `/` and switch with the header control; search visitors still arrive at `/en/` URLs through `hreflang`.
