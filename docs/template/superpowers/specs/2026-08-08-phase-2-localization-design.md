# Phase 2 Localization Architecture Design

## Scope

Phase 2 completes the localization architecture defined by `docs/template/PRD.md`, ADR 013, ADR 014, and ADR 023. It extends the localization slice introduced during Phase 1 without changing the accepted route model, static output model, or canonical URL manifest.

The phase provides a rich typed central locale configuration, exhaustive page-scoped TypeScript dictionaries, typed translation paths, pluralization, a locale-bound React API, manifest-driven language switching, and validation of every published locale. It does not add localized slugs, runtime translation loading, locale persistence, cross-locale content fallback, or SEO features scheduled for a later phase.

## Chosen Approach

Use `i18n-js` 4.5.3 as the runtime translation engine behind the repository's typed localization boundary. Keep `app/i18n/` as the only application-facing localization API. Components consume `useI18n()` and do not import or configure `i18n-js` directly.

The library handles nested lookup, interpolation, and the required `zero`, `one`, and `other` plural selection. Project-owned TypeScript types continue to enforce exhaustive locale dictionaries and valid translation paths because `i18n-js` accepts arbitrary string scopes and does not provide those compile-time guarantees itself.

## Dependency Decision

The runtime needs nested translation lookup, interpolation, plural selection, and strict missing-translation behavior. A local implementation is possible, but adopting the established `i18n-js` package centralizes these behaviors in a mature library with direct support for English and Brazilian Portuguese plural forms.

The package remains an implementation detail behind `useI18n()`. It does not change the route-driven localization architecture or create a second public localization API. The wrapper is still required for typed keys and locale binding, but it is small and focused on repository-specific contracts rather than reimplementing translation-engine behavior. This satisfies ADR 023's build-versus-buy policy without introducing a new application-wide abstraction.

## Locale Configuration

`app/i18n/config.ts` remains the source of truth for supported locales. It defines:

- `en`, labeled English, with `htmlLang: "en"`;
- `pt-BR`, labeled Portuguese, with `htmlLang: "pt-BR"`;
- `pt-BR` as the default locale;
- an exhaustive `SupportedLocale` union derived from the configuration;
- helpers for route validation, browser-language selection, and route-locale extraction.

Browser locale detection remains limited to `/`. It checks exact locale matches before base-language matches and falls back to `pt-BR`. Locale preference is not stored. Once navigation reaches a localized URL, the route is the authoritative locale state.

## Translation Storage and Schema

Translations remain page or feature scoped under `app/i18n/translations/`. The representative scopes are `common`, `home`, `about`, `services`, and `notFound`. Each scope exports its structural type and an exhaustive dictionary for every `SupportedLocale`.

The scope dictionaries are assembled into one registry satisfying:

```ts
Record<SupportedLocale, Translation>;
```

This registry is the only translation store passed to `i18n-js`. Omitting a locale, scope, or required copy produces a TypeScript error. The incomplete parallel scaffold under `app/locales/` is removed so the repository has one localization system.

## Typed Translation API

The shared translation schema supports strings and plural terminal nodes:

```ts
type Plural = {
  zero: string;
  one: string;
  other: string;
};
```

Recursive path types derive valid terminal scopes from `Translation`. A plural object is treated as a terminal translation rather than exposing `.zero`, `.one`, or `.other` as callable keys. The public translator distinguishes plain paths from plural paths so calls have these contracts:

```ts
translate("about.title");
translate("home.exampleCount", { count: 3 });
```

Invalid paths fail type checking. Plural paths require a numeric `count`, and plain paths do not require plural options. The return type exposed to components is `string`.

## Locale-Bound Runtime

`I18nProvider` creates or binds an `i18n-js` instance to the route locale. The instance uses the complete translation registry and is configured with:

- the active supported locale;
- `pt-BR` as the default locale;
- fallback disabled;
- missing translations treated as errors.

The instance is not exported as mutable global state. The provider exposes only the active locale and typed `translate` function through React context. The complete active translation capability remains available after hydration, so prerendered and interactive components use the same `useI18n()` API.

## Language Switching

The language switcher preserves logical page identity through the canonical URL manifest. It finds the manifest entry matching the current pathname and links each alternate locale to that entry's sibling URL.

For example, `/en/about` maps to `/pt-BR/about`, while `/en/services` maps to `/pt-BR/services`. The switcher does not manually replace path segments, create localized slugs, persist a locale preference, or perform a runtime redirect.

All published logical pages already require a complete locale sibling set. Failure to resolve a switch target therefore indicates an architectural error and is covered by manifest validation rather than hidden with a fallback URL.

## HTML Language

The root document derives `<html lang>` from the locale segment and central locale configuration. Localized build artifacts must contain the exact configured value. The root infrastructure route uses the default locale until browser-locale detection redirects on the client.

## Failure Behavior

Unsupported locale URLs remain unpublished and return a static 404. They do not select the default locale. Missing translation keys fail type checking where statically expressible and throw during runtime lookup rather than rendering guessed or fallback content. Missing locale dictionaries and incomplete logical-page sibling sets fail validation.

## Testing and Validation

Implementation follows test-driven development.

Compile-time fixtures verify that:

- invalid translation keys fail;
- plural internals cannot be addressed directly;
- plural keys require `count`;
- missing locale dictionaries fail;
- missing localized copy fails.

Unit and component tests verify:

- locale-bound translation in English and Brazilian Portuguese;
- `zero`, `one`, and `other` plural selection;
- strict missing-translation behavior;
- provider requirements and hydrated component access;
- logical-page sibling URL resolution;
- language-switch links for every representative route.

Build and browser validation verify:

- all logical pages are prerendered for both locales;
- every localized artifact has the correct `<html lang>`;
- every language-switch target is published;
- switching languages preserves Home, About, Services, and 404 identity;
- no locale preference is written to browser storage or cookies;
- no browser console or page errors occur.

## Acceptance Criteria

Phase 2 is complete when:

- central locale configuration is rich, typed, and uses `pt-BR` as default;
- page-scoped dictionaries exhaustively implement `Translation` for every locale;
- typed translation paths reject invalid and incomplete usage;
- plural translation supports `zero`, `one`, and `other` through `i18n-js`;
- `useI18n()` exposes a locale-bound translator before and after hydration;
- no mutable global locale state exists;
- language switching uses canonical manifest siblings and preserves page identity;
- locale preference is not persisted;
- every localized artifact has the correct `<html lang>`;
- the obsolete parallel locale scaffold is removed;
- `npm run check` passes;
- `npm run test:e2e` passes; and
- an ADR-focused architecture review has no high or medium findings.
