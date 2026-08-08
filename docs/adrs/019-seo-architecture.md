# ADR 019 — SEO Architecture

**Status:** Accepted

## Context

SEO is a mandatory capability of the static website harness.

Websites created from the template are expected to be:

- statically prerendered;
- localized;
- provider-neutral;
- discoverable by search engines;
- easy for AI coding agents to extend without introducing common SEO regressions.

The project already has a canonical URL manifest that represents every published localized URL and is used by routing and static-generation validation.

The SEO architecture should build on that source of truth rather than introduce another parallel representation of published URLs.

The template should enforce objective SEO correctness while avoiding subjective or overly prescriptive optimization rules.

## Decision

Use React Router's native metadata capabilities for route-level SEO metadata.

Every public page must explicitly define localized:

- `title`;
- `description`.

Infrastructure derives objective URL-related metadata such as:

- canonical URLs;
- `hreflang`;
- sitemap membership.

The project does not introduce a custom SEO framework.

## Explicit Page Metadata

Each public route is responsible for explicitly defining its SEO title and description.

Conceptually:

```ts
export function meta() {
  return [
    {
      title: translate('about.seo.title'),
    },
    {
      name: 'description',
      content: translate('about.seo.description'),
    },
  ];
}
```

The exact React Router API may evolve with the framework, but route-level metadata remains the intended convention.

## No Metadata Fallback

The template must not automatically derive SEO titles or descriptions from:

- headings;
- page text;
- route names;
- component content.

If a public page does not define the required metadata, validation fails.

This converts forgotten SEO metadata into a detectable error instead of silently producing weak output.

## Localization

SEO text belongs in the existing typed i18n dictionaries.

Conceptually:

```ts
about: {
  seo: {
    title: 'About our company',
    description: '...',
  },
}
```

Every supported locale must provide the corresponding SEO metadata.

The existing localization type system therefore helps detect incomplete localized SEO content.

## Title Policy

SEO titles are explicit full titles.

The template does not mandate a global title pattern such as:

```text
Page | Company
```

A fork may choose such a convention, but individual pages retain control over the final title.

Example:

```text
AI Software Consulting | Example Company
```

## Canonical URLs

Every indexable public page must have an absolute, self-referential canonical URL.

Canonical URLs are derived from:

```text
production origin
+
canonical URL manifest
```

Agents and page components must not manually construct canonical URLs.

This avoids disagreement between:

- route paths;
- sitemap URLs;
- canonical URLs;
- localized alternates.

## Canonical Source of Truth

The canonical URL manifest is the authoritative source for published URLs.

SEO infrastructure must not maintain a separate independent route list.

Conceptually:

```text
filesystem route patterns
        +
configured locales
        +
dynamic route data
        ↓
canonical URL manifest
        ↓
canonical links
hreflang
sitemap
SEO validation
```

## `hreflang`

Localized alternate links are generated automatically from the canonical URL manifest.

For a logical page such as:

```text
/en/services
/pt-BR/services
```

each localized version should reference:

- itself;
- the other supported localized versions.

Agents should not manually maintain `hreflang` URLs.

## `x-default`

The SEO infrastructure may expose an `x-default` alternate pointing to the configured default locale when useful.

For the current locale architecture, the default locale is:

```text
pt-BR
```

This is a derived infrastructure concern rather than page-specific metadata.

## HTML Language

Every localized page must emit an appropriate:

```html
<html lang="...">
```

value matching its route locale.

This requirement is shared with ADR 014 and is part of SEO validation.

## Sitemap

`sitemap.xml` is generated from the canonical URL manifest.

Only canonical, indexable public URLs belong in the sitemap.

The sitemap must not use a separately maintained page list.

Conceptually:

```text
canonical URL manifest
        ↓
filter indexable URLs
        ↓
sitemap.xml
```

## `robots.txt`

The base production configuration should use a simple `robots.txt`.

Conceptually:

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

The exact production URL comes from deployment configuration.

The template does not use `robots.txt` as a substitute for canonicalization or page-level `noindex`.

Non-production deployment indexing policy remains primarily a deployment concern.

## Indexability

Public routes may explicitly declare themselves non-indexable when required.

Conceptually:

```ts
index: false
```

or an equivalent route-specific convention.

A non-indexable page must emit appropriate robots metadata such as:

```html
<meta name="robots" content="noindex,follow">
```

and must be excluded from the sitemap.

Indexability must be explicit rather than inferred from route naming conventions.

## Contradictory Indexing State

Validation must reject contradictory states such as:

```text
page is noindex
+
page appears in sitemap
```

The canonical URL manifest and SEO metadata must agree on whether a page is indexable.

## Open Graph Metadata

The template supports Open Graph metadata.

Site-level defaults should provide reusable values such as:

- site name;
- default social image;
- default image metadata;
- default content type where appropriate.

Page title and description should normally feed corresponding social metadata without requiring duplicated translated strings.

## Social Image Overrides

A site-wide default social image should exist.

Individual pages may optionally provide a page-specific social image.

Conceptually:

```ts
socialImage: '/images/services-og.jpg'
```

A unique social image is not mandatory for every page.

## Twitter/X Metadata

Twitter/X card metadata should remain minimal and reuse the same semantic information used for Open Graph:

- title;
- description;
- social image.

The template does not introduce a separate elaborate Twitter-specific content model.

## Structured Data

Structured data is supported through explicit JSON-LD when a page has a genuine schema.org use case.

Examples may include:

- `Organization`;
- `ProfessionalService`;
- `Service`;
- `FAQPage`;
- `BreadcrumbList`.

The template does not introduce a generic structured-data framework.

Structured data remains:

- explicit;
- page-specific;
- optional.

Agents should not add schema markup merely because a page exists.

## Small SEO Helpers

Small helpers may be introduced for metadata that is mechanically derived or repeatedly formatted.

Examples include helpers for:

- canonical link generation;
- `hreflang`;
- absolute URL creation;
- social metadata defaults.

Such helpers must not become a parallel SEO framework.

Semantic decisions such as page title, description, structured data and social-image overrides remain visible at the route/page level.

## Page Views and SEO

Analytics page-view behavior is separate from SEO metadata.

Adding a new route should automatically receive analytics page-view tracking through ADR 015, but SEO title and description remain explicitly required from the route author.

## Broken Internal Links

Existing routing rules require internal broken links to fail validation.

SEO validation should use the same canonical URL manifest when checking internal destinations.

Internal links must:

- point to published URLs;
- use valid locale prefixes;
- avoid malformed or unsupported paths.

## Validation

The canonical `npm run check` pipeline should fail when an indexable public page has objective SEO errors.

Examples include:

```text
✓ missing localized title → fail

✓ missing localized description → fail

✓ missing canonical URL → fail

✓ canonical URL not present in canonical manifest → fail

✓ canonical URL inconsistent with route → fail

✓ duplicate canonical assigned to multiple logical pages → fail

✓ missing localized sibling → fail

✓ invalid hreflang target → fail

✓ incorrect <html lang> → fail

✓ missing indexable page from sitemap → fail

✓ noindex page included in sitemap → fail

✓ malformed absolute canonical URL → fail

✓ broken internal link → fail
```

## Subjective SEO Heuristics

The build must not fail based on subjective SEO recommendations such as:

```text
title should contain exactly N characters
description should contain exactly N characters
keyword must appear in heading
minimum keyword density
```

These may be surfaced as optional guidance or warnings later, but they are not architectural correctness rules.

Search engines may rewrite titles and descriptions, and quality cannot be reliably reduced to fixed character thresholds.

## Agent Guidance

AI agents adding or modifying public pages should:

1. explicitly add localized SEO title and description;
2. place SEO text in the typed i18n dictionaries;
3. rely on infrastructure for canonical URLs;
4. rely on infrastructure for `hreflang`;
5. not manually maintain sitemap entries;
6. use the site social-image default unless a page-specific image provides real value;
7. add structured data only when the page genuinely matches the schema;
8. use `noindex` only intentionally;
9. run the canonical validation pipeline before completion.

## Rationale

The architecture distinguishes between two kinds of SEO decisions.

### Semantic decisions

These require knowledge of the page's intent:

```text
title
description
social-image override
structured data
indexability
```

They remain explicit.

### Mechanical decisions

These can be derived deterministically:

```text
canonical URL
hreflang
absolute URL
sitemap membership
localized URL relationships
```

They are handled by infrastructure.

This reduces duplicated work and prevents agents from manually reproducing information that the project already knows.

## Consequences

### Positive

- Every public page has intentional SEO metadata.
- Missing SEO metadata becomes detectable.
- Canonical URLs remain consistent with routing.
- Localization and SEO share the same source of truth.
- Agents have a clear route-level pattern to follow.
- Sitemap and `hreflang` cannot silently drift from routing.
- Social metadata has sensible defaults.
- Structured data remains available without introducing another framework.
- Validation focuses on objective correctness.

### Negative

- Adding a new page requires explicit SEO copy in every locale.
- Agents cannot rely on automatic metadata fallback.
- Page-specific structured data still requires judgment.
- Some SEO quality concerns remain outside mechanical validation.

These costs are accepted because intentional page metadata is more valuable than silent fallback behavior.

## Rejected Alternatives

### Automatic SEO Title/Description Generation

Rejected because forgotten metadata would silently produce lower-quality output.

### Separate SEO Configuration Files

Rejected because metadata should remain close to the route it describes.

### Custom SEO Framework

Rejected as unnecessary abstraction over React Router and the canonical URL manifest.

### Manually Authored Canonical URLs

Rejected because they can drift from the route model.

### Manually Maintained `hreflang`

Rejected because localized sibling relationships already exist in the canonical URL manifest.

### Manually Maintained Sitemap

Rejected because it would introduce another source of truth.

### Mandatory Unique Social Image per Page

Rejected because a site-level default is sufficient for many marketing pages.

### Generic Structured-Data Framework

Rejected because structured data is page-specific and should be introduced only when useful.

### SEO Character-Count Build Failures

Rejected because these are heuristics rather than correctness invariants.

## Future Evolution

A fork may add stronger SEO tooling if it develops a concrete need for:

- content audits;
- SEO warnings;
- schema validation;
- richer social preview management;
- large content inventories.

Such tooling should build on the canonical URL manifest rather than replace it.
