# ADR 014 — Localization Architecture

**Status:** Accepted

## Context

Localization is a mandatory capability of the static website harness.

The architecture must support:

- multiple locales;
- fully prerendered localized pages;
- compile-time detection of missing translations;
- SEO metadata per locale;
- `hreflang`;
- localized 404 behavior;
- language switching;
- compatibility with static hosting;
- a small conceptual surface for AI coding agents.

The project already uses:

- locale-prefixed routes;
- TypeScript translation dictionaries;
- page/feature-scoped translation files;
- a generic typed translation API;
- a canonical URL manifest.

## Decision

Use a route-driven, statically rendered localization architecture.

Each public URL includes an explicit locale prefix.

Examples:

```text
/en/about
/pt-BR/about
```

Each logical page has one React implementation and is prerendered once for every configured locale.

## Locale Configuration

Supported locales are defined centrally using a rich typed configuration object.

Conceptually:

```ts
export const locales = {
  en: {
    label: 'English',
    htmlLang: 'en',
  },
  'pt-BR': {
    label: 'Português',
    htmlLang: 'pt-BR',
  },
} as const;

export type SupportedLocale = keyof typeof locales;

export const defaultLocale: SupportedLocale = 'pt-BR';
```

The exact metadata may evolve, but the central config is the source of truth for supported locales.

## Default Locale

The default locale is:

```text
pt-BR
```

When browser locale detection does not produce a supported locale, the user is redirected to the `pt-BR` version.

> Superseded by [ADR 027](027-persisted-locale-preference.md).

## Root Locale Detection

> Superseded by [ADR 027](027-persisted-locale-preference.md): `/` redirects to the stored locale, or `pt-BR`, before hydration.

The root route:

```text
/
```

performs client-side browser-locale detection.

Behavior:

```text
/
↓
detect browser locale
↓
supported?
├── yes → redirect to matching localized root
└── no  → redirect to /pt-BR/
```

Locale preference is not persisted.

The URL remains the authoritative locale state after navigation.

## Route Model

Every public content route is locale-prefixed.

Examples:

```text
/en/services
/pt-BR/services
```

The same slug is used across locales.

Localized slugs such as:

```text
/en/about
/pt-BR/sobre
```

are outside the base architecture.

This keeps route generation, links, switching, SEO metadata, and agent behavior simpler.

## One Logical Page per Route

Localized pages do not have separate React implementations.

For example:

```text
AboutPage
    +
locale=en
    ↓
/en/about

AboutPage
    +
locale=pt-BR
    ↓
/pt-BR/about
```

The locale changes the translation data, not the page implementation.

## Translation Storage

Translation dictionaries are written in TypeScript.

They are organized by page or feature rather than as one large monolithic locale file.

Conceptually:

```text
app/i18n/locales/
  en/
    common.ts
    about.ts
    services.ts

  pt-BR/
    common.ts
    about.ts
    services.ts
```

This reduces context size for both developers and AI agents.

## Translation Schema

Each translation scope has a predefined TypeScript structure.

Every locale dictionary must satisfy the complete translation schema.

Conceptually:

```ts
const en = {
  // ...
} satisfies Translation;

const ptBR = {
  // ...
} satisfies Translation;
```

The locale registry must also be exhaustive:

```ts
const translations = {
  en,
  'pt-BR': ptBR,
} satisfies Record<SupportedLocale, Translation>;
```

Missing translations therefore become TypeScript errors.

## Typed Translation Paths

Valid translation scopes are derived automatically from the `Translation` type.

Conceptually:

```ts
type Paths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Plural
    ? `${Prefix}${K & string}`
    : T[K] extends Record<string, any>
      ? Paths<T[K], `${Prefix}${K & string}.`>
      : `${Prefix}${K & string}`;
}[keyof T];

export type LocaleScope = Paths<Translation>;
```

This ensures calls such as:

```ts
translate('about.title');
```

are type-safe.

Invalid paths fail type checking.

## Pluralization

Plural values use the following shape:

```ts
type Plural = {
  zero: string;
  one: string;
  other: string;
};
```

`Plural` is treated as a terminal translation node by `Paths<T>`.

Therefore:

```ts
translate('cart.items', { count: 3 });
```

is valid, while callers do not reference internal plural keys directly.

Plural selection is handled by the translation layer.

## Translation API

Use one generic typed translation API.

The public React-facing API is exposed through localization context.

Conceptually:

```tsx
const { translate } = useI18n();

translate('about.title');
translate('cart.items', { count: 3 });
```

Page-specific translation hooks are not required.

The goal is to keep the localization surface small and predictable.

## Translator State

Do not use one mutable global translator instance whose locale is changed during rendering.

Instead, create or bind the translator to the current locale and expose it through React context.

Conceptually:

```text
localized route
      ↓
locale
      ↓
locale-bound translator
      ↓
I18n context
      ↓
components
```

This avoids shared mutable state and potential conflicts during concurrent prerendering of multiple locales.

## Translation Loading

Initially, all configured translation dictionaries are imported by the application.

The base template does not introduce dynamic translation chunking or per-page locale loading.

This favors:

- implementation simplicity;
- predictable behavior;
- smaller agent conceptual surface.

Optimization may be introduced later if bundle size becomes a real problem.

## Client-Side Translation Availability

The active locale's complete translation dictionary remains available after hydration.

Interactive components can therefore use the same `useI18n()` API as prerendered components.

The architecture does not have separate server-only and browser-only translation APIs.

## Translation Fallback

There is no cross-locale content fallback for configured pages.

For example, `/pt-BR/about` must not silently render an English string because a Portuguese translation is missing.

Missing translations must be caught through TypeScript or build validation.

The only locale fallback is at root browser-locale selection:

```text
unsupported browser locale → pt-BR
```

This is routing fallback, not translation fallback.

> Superseded by [ADR 027](027-persisted-locale-preference.md).

## Language Switcher

The language switcher must preserve the logical page.

Example:

```text
/en/about
    ↓
/pt-BR/about
```

The canonical URL manifest provides the localized sibling URL rather than the switcher manually rewriting paths.

Because published logical pages must exist in every configured locale, language switching should be deterministic.

## Locale Persistence

> Superseded by [ADR 027](027-persisted-locale-preference.md): the last visited locale is stored and used by `/`.

Explicit locale selection is not persisted in local storage or cookies.

The selected localized URL is authoritative.

Future visits to `/` perform browser-locale detection again.

This avoids maintaining a second locale-preference state.

## HTML Language Attribute

Every localized page must emit the appropriate HTML `lang` value.

Example:

```html
<html lang="pt-BR">
```

The value is derived from the central locale configuration.

Generated HTML must be validated to ensure the attribute matches the route locale.

## SEO Integration

Localization integrates with the canonical URL manifest.

For every logical page, the manifest knows its localized URLs.

Example:

```text
about

en     → /en/about
pt-BR  → /pt-BR/about
```

This relationship is used for:

- canonical URL validation;
- `hreflang`;
- sitemap generation;
- locale switching;
- prerender completeness;
- SEO validation.

Each localized page is canonical to itself.

## Unsupported Locale URLs

Unsupported locale URLs must result in a static 404.

Example:

```text
/fr/about
```

must not:

- redirect to `pt-BR`;
- silently render `pt-BR`;
- fall back to English.

The fallback-to-`pt-BR` behavior applies only when choosing a locale from `/`.

## Missing Localized Pages

All published logical pages must exist for every configured locale.

If a required localized page or its content cannot be produced, the build fails.

The base architecture does not permit partially localized public route sets.

## Localized 404 Pages

Each supported locale must have localized 404 content.

Examples:

```text
/en/404
/pt-BR/404
```

The static hosting environment may map unresolved requests to these artifacts as appropriate.

## Validation

The canonical validation pipeline should verify at least:

```text
✓ every supported locale is registered
✓ every locale implements the complete Translation schema
✓ every translation scope used in code is valid
✓ every logical page exists for every locale
✓ every localized URL is prerendered
✓ every localized page has the correct <html lang>
✓ every hreflang target exists
✓ every language-switch target exists
✓ unsupported locales are not published
✓ no localized page depends on cross-locale translation fallback
```

## Rationale

The architecture prioritizes:

- compile-time safety;
- fully static localized output;
- simple page implementations;
- predictable AI-agent behavior;
- SEO correctness;
- low runtime complexity.

Using TypeScript dictionaries avoids introducing additional localization file formats or schema-generation pipelines.

Keeping locale state route-driven avoids hidden application state.

Using a locale-bound translation context preserves a simple generic translation API without relying on unsafe mutable global state.

## Consequences

### Positive

- Missing translations fail early.
- Translation keys are type-safe.
- Pages have one implementation across locales.
- Localized HTML is fully prerendered.
- SEO metadata can be generated deterministically.
- Language switching is straightforward.
- Agent-facing localization APIs remain small.
- No runtime translation fetching is required.
- Static deployment remains unaffected.

### Negative

- All translation dictionaries are initially included in the application bundle.
- TypeScript translation files may become verbose on content-heavy sites.
- Every logical page must currently exist in every locale.
- Localized URL slugs are not supported.
- Locale preference is not remembered across visits to `/`.

## Rejected Alternatives

### Browser Locale as Runtime Page State

Rejected because public URLs must explicitly represent locale and pages must be statically prerendered.

### Mutable Global Translation Singleton

Rejected because concurrent locale prerendering could mutate shared locale state.

### JSON Translation Dictionaries

Rejected in favor of TypeScript dictionaries with direct structural type checking.

### Monolithic Locale Files

Rejected because page/feature-scoped dictionaries reduce context size and improve maintainability.

### Silent Translation Fallback

Rejected because it can hide incomplete localization.

### Persisted Locale Preference

Rejected for the base template because the localized URL already represents the selected locale.

> Superseded by [ADR 027](027-persisted-locale-preference.md).

### Localized Slugs

Rejected for the base architecture to reduce routing and agent complexity.

### Per-Page Translation Bundles

Deferred until bundle size demonstrates a real need.
