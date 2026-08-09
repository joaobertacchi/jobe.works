# Phases 4-5 Example Pages and SEO Design

## Scope

This design implements Phase 5 SEO infrastructure before Phase 4 example pages so every new page must satisfy the final SEO contract when it is introduced. It builds on the accepted static routing, localization, component, and theming architecture without adding a runtime server, backend, custom SEO framework, or new dependency.

The finished example site contains localized Home, About, Services, Privacy, and 404 pages. The pages remain generic and replaceable. Their purpose is to teach future agents the repository's route, localization, component, styling, accessibility, and SEO conventions through working code.

Capabilities assigned to Phase 6 and later, including analytics, consent, deployment configuration, and CI, remain out of scope.

## Implementation Order

Phase 5 is implemented first:

1. Add build-time site configuration and SEO types.
2. Add route-level metadata to the existing Home, About, Services, and 404 routes.
3. Generate and validate canonical links, localized alternates, social metadata, sitemap, robots, JSON-LD support, indexability, and internal links.
4. Integrate all objective SEO checks into the existing production-build validation used by `npm run check`.

Phase 4 follows:

1. Polish Home, About, Services, and the localized 404.
2. Add the localized Privacy route and typed dictionary.
3. Add only the shared components justified by these pages.
4. Expand component and browser tests for the final responsive, accessible, localized, themed pages.

This order proves that a newly added route cannot pass validation without complete localized metadata and avoids retrofitting SEO after page creation.

## Site Configuration

A small typed server-side site configuration owns the mechanical values shared by SEO output:

- production origin;
- site name;
- default social-image pathname;
- whether `x-default` is emitted.

`SITE_ORIGIN` is read at build time. The template default is `https://example.com`. Validation requires an absolute HTTPS origin with no credentials, query, fragment, or non-root path and normalizes away the trailing slash. Forks can replace the default through the build environment.

The default social image uses the intentional stable public pathname `/social-card.svg`. It is a generic template asset and may be replaced by a fork. `x-default` is enabled and points to the configured default-locale sibling, currently `pt-BR`.

Site configuration is supplied through prerendered loader data. No secret or runtime environment value is exposed, and serving the production output does not require Node.js.

## Route-Level SEO Contract

React Router Framework Mode's native `meta()` export remains the page-level API. Each public route explicitly selects its localized:

- full title;
- description;
- indexability;
- optional social-image override;
- optional JSON-LD value.

SEO copy lives in the existing page-scoped typed TypeScript dictionaries. Missing metadata for either locale therefore fails type checking. Titles and descriptions are never inferred from headings, route names, or body copy.

The localized parent loader returns the canonical sibling URL map and non-secret site configuration already needed by all child routes. Each child `meta()` function combines its explicit semantic values with that parent data through one small descriptor builder.

The descriptor builder emits:

- `<title>`;
- description metadata;
- one absolute self-referential canonical link;
- one alternate link for every supported locale;
- optional `x-default` pointing to the default locale;
- robots metadata;
- Open Graph type, site name, URL, title, description, locale, alternate locales, and image;
- minimal Twitter card, title, description, and image metadata;
- optional React Router `script:ld+json` metadata.

This follows React Router v8's native metadata descriptor support. The helper formats repeated mechanical descriptors but does not own page titles, descriptions, indexability decisions, or structured-data semantics.

Home demonstrates explicit `Organization` JSON-LD using generic template values. Other pages omit structured data because no additional schema is justified. The support remains available as an optional helper input.

## Indexability

Normal localized content pages are explicitly indexable. The localized 404 route explicitly emits `noindex,follow` and is excluded from the sitemap. The root `/` locale-selection route is redirect infrastructure rather than canonical content; it also emits `noindex,follow` and has no canonical or alternate expectations.

Indexability is read from rendered robots metadata during static finalization. Sitemap generation therefore combines the canonical manifest with each rendered page's explicit route metadata rather than introducing a separate page registry or inferring policy from route names.

## Static SEO Generation

The production build remains the single static validation stage. After React Router prerenders all known URLs, build finalization:

1. Reads every canonical HTML artifact from the canonical manifest.
2. Validates its route metadata and determines indexability.
3. Generates `sitemap.xml` from canonical manifest URLs whose rendered pages are indexable.
4. Generates `robots.txt` with `User-agent: *`, `Allow: /`, and the absolute sitemap URL.
5. Validates sitemap and robots output against the same manifest and rendered metadata.
6. Performs the existing static-purity checks and removes build-only server and SPA-fallback artifacts.

Generated `sitemap.xml` contains only absolute canonical URLs. It does not maintain an independent route list. Generated `robots.txt` and the default social image use stable public paths because external systems require known URLs.

## Deterministic Validation

Static validation rejects:

- missing or empty localized title;
- missing or empty localized description;
- missing, relative, malformed, duplicated, or non-self-referential canonical URLs;
- canonical URLs absent from the canonical manifest;
- missing, duplicated, malformed, or incorrect locale alternates;
- missing localized siblings;
- invalid or incorrect `x-default`;
- `<html lang>` values that do not match the route locale;
- missing or contradictory robots metadata;
- indexable pages absent from the sitemap;
- noindex pages included in the sitemap;
- sitemap URLs absent from the canonical manifest;
- malformed sitemap or robots URLs;
- broken internal links;
- internal links with unsupported, missing, or noncanonical locale prefixes.

Validation focuses on objective correctness. It does not enforce title lengths, keyword density, heading keywords, or other subjective SEO heuristics.

Errors identify the artifact and invariant, for example `Missing canonical in en/privacy/index.html`.

## Example Pages

### Home

Home receives a stronger hero, a concise principles or feature section, and a localized call to action. It demonstrates section composition, primitives, responsive layout, explicit metadata, default social metadata, and page-level JSON-LD.

### About

About becomes a readable secondary content page explaining the generic template's agent-first and static-first principles. It demonstrates structured semantic content and shared content-section composition without becoming product documentation.

### Services

Services retains the existing three-card domain example and improves its introduction, hierarchy, and responsive layout. It continues to demonstrate a domain component composed from UI primitives.

### Privacy

Privacy is a generic practical privacy notice built in TSX with all prose in a typed page-scoped dictionary. It uses semantic sections and headings to demonstrate longer localized content without Markdown, MDX, CMS, or content-collection infrastructure.

The notice remains intentionally generic and does not claim that later-phase analytics or consent behavior already exists.

### Localized 404

The 404 becomes a polished recovery page with a localized canonical Home link. The explicit `/en/404` and `/pt-BR/404` utility artifacts remain available for static hosting but emit `noindex,follow` and stay out of the sitemap.

## Components and Styling

The implementation reuses `Container`, `Heading`, `Text`, `Card`, `HeroSection`, and `ServiceCard`. New components are limited to demonstrated reuse:

- a semantic link/button primitive for calls to action;
- a reusable content-section pattern only where Home and About share meaningful structure;
- a site footer with localized navigation and Privacy access.

The existing warm-neutral and teal semantic color tokens, system font stacks, light/dark/system behavior, and Tailwind standard scales remain intact. Polish comes from improved hierarchy, spacing, responsive grids, borders, and restrained decorative composition rather than a new brand or finished design system.

Higher-level components use Tailwind primarily for structure. Visual variants remain owned by UI primitives. All pages preserve one clear `h1`, logical heading order, semantic landmarks, visible keyboard focus, sufficient contrast, and mobile layouts without horizontal overflow.

The shared shell adds the footer below route content. Primary navigation includes Home, About, and Services; Privacy is linked from the footer to keep the header concise. Every localized link is constructed from the active locale or canonical sibling URLs.

## Error Handling

Invalid build-time site configuration fails the build before artifacts are accepted. Missing parent SEO data or a pathname absent from the canonical manifest is an architectural error and is not hidden with fallback metadata.

Unsupported locales retain the neutral static 404 behavior and do not receive localized SEO content under an invalid locale URL. Localized catch-all behavior remains unchanged except for the improved 404 presentation.

No metadata fallback derives semantic content from another locale or another page. A missing translation, sibling, route metadata field, or static artifact fails type checking or build validation.

## Testing

Unit tests cover:

- origin validation and normalization;
- absolute canonical and social-image URLs;
- metadata descriptors and locale alternates;
- `x-default` behavior;
- indexable and noindex descriptors;
- optional social-image override;
- optional JSON-LD descriptors;
- sitemap and robots serialization.

Static-build tests mutate representative artifacts and manifests to reproduce every required Phase 5 validation failure, including missing metadata, malformed and duplicated canonicals, invalid alternates, missing siblings, wrong document language, sitemap drift, noindex inclusion, broken links, and invalid locale-prefixed links.

Route and component tests cover localized page copy, Privacy, footer navigation, 404 recovery, metadata selection, and structured-data output where meaningful.

Playwright covers rendered head metadata, sitemap and robots availability, route and language navigation, semantic headings, keyboard accessibility, responsive layouts, light/dark behavior, and absence of horizontal overflow. Existing routing and theming behavior remains protected.

The completion gate is:

```text
npm run check
npm run test:e2e
architecture review scoped to Phases 4-5
```

The knowledge graph is updated after code changes.

## Acceptance Criteria

The work is complete when:

- Home, About, Services, Privacy, and localized 404 pages are polished, responsive, accessible, localized, and theme-aware;
- examples demonstrate the accepted route, dictionary, component-layer, and Tailwind conventions without speculative abstractions;
- every content route defines explicit localized title and description through React Router-native metadata;
- canonical, alternate, `x-default`, Open Graph, Twitter, social-image, noindex, and JSON-LD support follow this design;
- sitemap and robots files are generated deterministically from the canonical manifest and rendered indexability;
- every Phase 5 validation case is mechanically enforced by `npm run check`;
- static production output remains provider-neutral and requires no Node.js runtime;
- all unit, component, build, coverage, and browser validation passes; and
- the Phase 4-5 architecture review has no blocking findings.
