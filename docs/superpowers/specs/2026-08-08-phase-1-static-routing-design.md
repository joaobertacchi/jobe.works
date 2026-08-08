# Phase 1 Static Routing and Prerendering Design

## Scope

Phase 1 implements the routing and static-generation foundation defined by `docs/PRD.md`, ADR 003, ADR 004, ADR 007, ADR 008, ADR 014, and ADR 021. It replaces the generated single-page demonstration with a small localized vertical slice that proves the accepted architecture through working code.

The published placeholder pages are Home, About, Services, and a localized 404 utility page. They demonstrate locale roots, nested routes, shared page implementations, localized content completeness, and nested static output without introducing business content. Dynamic content routes, SEO metadata, sitemap generation, production hosting configuration, and application-level redirect management remain outside Phase 1.

## Chosen Approach

Use React Router's official filesystem-route convention as the source of route patterns and add one thin canonical URL manifest generator. The generator expands static localized patterns for every configured locale and preserves logical-page relationships. Its concrete URL inventory is reused by prerender configuration and static artifact validation.

This approach follows ADR 008 without maintaining a separate explicit route table or implementing a project-owned filesystem scanner. The official filesystem-route package is justified because it implements the framework convention selected by the accepted ADR and avoids duplicating framework filename parsing.

## Route Architecture

`app/routes.ts` delegates route discovery to React Router's filesystem convention. Route modules provide these route patterns:

- `/` for browser-locale detection;
- `/:locale/` for localized Home;
- `/:locale/about` for localized About;
- `/:locale/services` for localized Services;
- `/:locale/404` for a localized 404 artifact;
- structural error handling for client-side navigation failures.

All localized pages use one implementation per logical page. Locale changes select typed translation data rather than selecting a different component or slug. The same lowercase slug is used in every locale.

The root URL is infrastructure rather than a normal content page. It is prerendered, but it is not a localized canonical content URL. Localized 404 URLs are published utility artifacts and are distinguishable from ordinary indexable content so later SEO consumers can exclude them.

## Locale Configuration

Supported locales live in one typed configuration module:

- `en`, with HTML language `en`;
- `pt-BR`, with HTML language `pt-BR`.

The default locale is `pt-BR`.

The root route selects a locale from the browser's ordered language preferences. It checks exact configured locale values first, then matches by base language:

- `en-*` selects `en`;
- `pt-*` selects `pt-BR`;
- any other value selects the default `pt-BR`.

The route replaces `/` with the selected localized root and does not persist locale preference. Once redirected, the URL is the authoritative locale state.

## Localization Slice

Phase 1 introduces only the minimum ADR 014-compliant localization behavior required by the routing slice. Page-scoped TypeScript dictionaries provide placeholder copy for Home, About, Services, and 404. Both locales must satisfy the same typed structures, so omitted localized copy fails type checking or build validation. A locale-bound context exposes one generic typed translation function; page-specific translation hooks and mutable global translator state are not introduced.

The locale route binds translation data to the current locale without mutable global state. Localized pages emit the configured `<html lang>` value. Full business content, pluralization examples, and translation-bundle optimization are not introduced.

## Canonical URL Manifest

The manifest is generated from publishable filesystem route patterns and locale configuration. Infrastructure routes such as `/` and structural error routes are explicitly excluded from canonical content entries. Each entry records:

- a stable logical page identifier derived from the locale-independent static path;
- whether the URL is ordinary content or a utility page;
- the complete map of supported locales to concrete URLs.

For example, the About entry relates `/en/about` and `/pt-BR/about`. The concrete published URL inventory is derived from these entries rather than manually repeated.

Phase 1 has only static route patterns. A discovered public pattern containing an unresolved dynamic parameter other than the locale parameter fails generation. Dynamic content expansion will be added only when a concrete content source is introduced.

Manifest generation rejects duplicate URLs, duplicate logical page identifiers, malformed paths, non-lowercase non-locale segments, duplicate slashes, `.html` paths, unsupported or non-canonical locale prefixes, and incomplete locale sibling sets. Configured locale segments retain their canonical representation, including the uppercase region in `pt-BR`.

## Prerendering and Static Output

React Router remains configured with `ssr: false`. Prerendering consumes the manifest's concrete URLs plus `/`, producing native nested output such as:

```text
build/client/en/index.html
build/client/en/about/index.html
build/client/en/services/index.html
build/client/en/404/index.html
build/client/pt-BR/index.html
build/client/pt-BR/about/index.html
build/client/pt-BR/services/index.html
build/client/pt-BR/404/index.html
```

No normal public route may depend on an SPA fallback. The deployable artifact contains no server directory and no SPA fallback file after finalization.

## Unsupported and Missing Routes

Unsupported locale URLs such as `/fr/about` are never included in the manifest and never produce HTML. Unknown paths likewise have no generated artifact. A generic static server without history fallback therefore returns a real HTTP 404 rather than redirecting or rendering another locale.

The explicit `/en/404` and `/pt-BR/404` artifacts provide localized pages that a deployment may select through host-specific 404 mapping. Phase 1 does not add provider-specific nginx or hosting configuration.

Client-side navigation to an invalid route uses the route error structure. A supported locale may render its localized 404 copy, while an unsupported locale must not render supported-locale content under the invalid URL.

## Static Validation

The Phase 0 artifact finalizer evolves into manifest-based static validation. A production build fails unless:

- every manifest URL has its expected nested `index.html` artifact;
- `/` has a prerendered entry artifact;
- every logical page has one URL for every supported locale;
- every localized artifact has the expected `<html lang>` value;
- all statically inspectable internal links target manifest URLs and include supported locale prefixes;
- no unsupported locale directory is published;
- no project server artifact remains;
- no SPA fallback remains in the deployable artifact;
- every generated URL satisfies normalization rules.

SEO-only checks such as canonical tags, `hreflang`, and sitemap consistency are deferred until their corresponding Phase introduces those outputs. They will consume the same manifest rather than reimplement URL logic.

## Testing

Implementation follows test-driven development.

Unit tests cover:

- exact, base-language, and default locale selection;
- static pattern expansion and normalized URL generation;
- logical-page locale sibling relationships;
- duplicate, malformed, dynamic, unsupported, and incomplete manifest failures.

Component tests cover:

- root redirect behavior;
- shared localized page rendering;
- localized 404 rendering;
- locale-specific HTML language behavior where it can be tested meaningfully in the component harness.

Build and static-validator tests use temporary fixture artifacts to verify success and each important failure mode. Playwright runs against the production static server and verifies:

- localized Home, About, and Services pages in both locales;
- navigation among known manifest URLs;
- base-language browser detection and default fallback;
- localized 404 artifacts;
- real HTTP 404 responses for unsupported locales and unknown paths;
- absence of browser console and page errors.

## Acceptance Criteria

Phase 1 is complete when:

- ordinary route modules are discovered through React Router filesystem conventions;
- `/en/...` and `/pt-BR/...` placeholder routes are prerendered;
- `/` redirects client-side according to the approved locale matching policy;
- unsupported locale URLs are absent from published output and return static 404 responses;
- localized 404 artifacts exist for both locales;
- missing localized content or locale siblings fail validation;
- the canonical manifest is the sole concrete published-URL inventory used by prerendering and static validation;
- no public route depends on SPA fallback behavior;
- production output contains expected nested static HTML and requires no Node.js runtime;
- `npm run check` passes;
- `npm run test:e2e` passes; and
- an ADR-focused implementation review has no blocking findings.
