# ADR 008 — Routing and Static Generation

**Status:** Accepted

## Context

The project uses React Router Framework with prerendering to generate static marketing and content websites.

The routing architecture must optimize for:

- minimal boilerplate;
- convention over configuration;
- predictable AI-agent behavior;
- full static prerendering;
- localization;
- SEO correctness;
- provider-neutral deployment;
- deterministic validation.

All public pages are localized. Even ordinary static pages such as About or Services must exist in every configured locale.

Dynamic routes such as blog posts are supported, but they are not the primary use case.

## Decision

Use React Router Framework file-convention routing as the source of route patterns.

Every public route is locale-prefixed and must be prerendered into a static HTML artifact.

A generated canonical URL manifest is the source of truth for the concrete URLs published by the site.

The canonical manifest is generated from:

- React Router filesystem route patterns;
- configured locales;
- dynamic content sources when applicable.

The manifest is then consumed by prerendering and SEO-related tooling.

## Locale Routing

All public routes must contain an explicit locale prefix.

Examples:

```text
/en/about
/pt-BR/about

/en/services
/pt-BR/services
```

The same slug is used across languages.

Localized slugs such as:

```text
/en/about
/pt-BR/sobre
```

are intentionally not supported by the base harness.

This reduces routing complexity and the amount of localization knowledge required from AI agents.

## Root Route

The root URL:

```text
/
```

must not represent a normal content page.

It performs client-side browser-locale detection and redirects the visitor to the appropriate localized root, for example:

```text
/ → /en/
/ → /pt-BR/
```

If the detected browser locale is not supported, the configured default locale is used.

## File-Conventional Routing

Use React Router Framework filesystem route conventions rather than maintaining a separate explicit route table.

The goal is to minimize routing boilerplate.

Creating an ordinary page should require primarily creating the route module itself.

Routing conventions must remain framework-native rather than introducing a custom routing DSL.

## Static Output Convention

Follow React Router's native prerender output conventions.

Do not introduce post-processing solely to generate flattened files such as:

```text
about.html
```

A public URL such as:

```text
/en/about
```

may therefore be represented by an artifact such as:

```text
build/client/en/about/index.html
```

The public URL must not expose `index.html` or `.html`.

## Prerendering

Every known public URL must be prerendered.

SPA-only public routes are forbidden.

React Router may internally provide an SPA fallback artifact, but no normal public route may depend on it.

The build must fail if a URL represented in the canonical manifest does not have a corresponding prerendered HTML artifact.

## Static Routes

Because every route includes a locale parameter, concrete localized paths must be generated at build time.

For example, the logical page:

```text
/about
```

combined with:

```text
en
pt-BR
```

produces:

```text
/en/about
/pt-BR/about
```

This expansion is generated automatically by the harness.

An agent should not manually register every locale-specific route.

## Dynamic Routes

Dynamic routes are supported primarily for content collections such as:

```text
/:locale/blog/:slug
/:locale/case-studies/:slug
```

Concrete paths must be known at build time.

Dynamic route values are derived from the corresponding content source.

For example:

```text
blog content:
- first-post
- second-post
```

combined with configured locales produces:

```text
/en/blog/first-post
/en/blog/second-post
/pt-BR/blog/first-post
/pt-BR/blog/second-post
```

Dynamic route URLs must not be discovered only through client-side navigation or runtime APIs.

## Canonical URL Manifest

The harness generates a canonical URL manifest containing every concrete public URL.

React Router filesystem routing remains the source of truth for:

> Which route patterns exist?

The canonical manifest is the source of truth for:

> Which concrete URLs does this site publish?

Conceptually:

```text
React Router routes
        +
configured locales
        +
dynamic content
        ↓
Canonical URL Manifest
```

The manifest is generated rather than manually maintained.

## Manifest Consumers

The canonical URL manifest must be reused by:

- React Router prerender configuration;
- static artifact completeness validation;
- sitemap generation;
- canonical URL generation and validation;
- `hreflang` generation and validation;
- internal-link validation;
- locale-prefix validation;
- SEO validation.

The same public-URL logic must not be independently reimplemented by each subsystem.

## SEO Relationships

The manifest must preserve the logical relationship between localized versions of the same page.

For example:

```text
logical page: about

en     → /en/about
pt-BR  → /pt-BR/about
```

This relationship is used to generate and validate `hreflang` metadata.

Each localized page remains canonical to its own localized URL.

## Unsupported Locales

Requests for unsupported locales must resolve to a static 404.

Example:

```text
/fr/about
```

must not silently:

- fall back to English;
- redirect to English;
- render English content under an unsupported locale URL.

## Missing Localized Content

All configured locales must have the required content for a published logical page.

If localized content is missing, the build fails.

The base architecture does not silently omit a locale or fall back to another locale's content.

## 404 Pages

Localized 404 pages are required.

Examples:

```text
/en/404
/pt-BR/404
```

The hosting configuration may map unknown URLs to the appropriate static 404 behavior.

The exact nginx configuration is deployment-specific and outside the routing framework itself.

## Redirects and Aliases

Application-level redirect management is outside the scope of the base harness.

Legacy URLs and aliases are not represented as application routes.

If required for a specific deployment, they should be handled at the web-server or infrastructure level, such as nginx configuration.

Route aliases are not allowed in the application routing model.

## SPA Routes

SPA-only routes are forbidden in the base harness.

Every public application route must correspond to prerendered HTML.

If a future project requires an SPA-only section, introducing it requires an explicit architectural exception rather than an agent choosing it opportunistically.

## Internal-Link Validation

Build validation must fail when an internal link:

- points to a URL not present in the canonical manifest;
- references an unsupported locale;
- omits the required locale prefix;
- targets an invalid or nonexistent localized page.

This validation applies to both navigation components and ordinary content links where they can be statically inspected.

## URL Normalization

Public URLs must follow a deterministic normalization policy.

At minimum:

- paths are lowercase;
- duplicate slashes are forbidden;
- `.html` must not appear in public URLs;
- locale prefixes must use their configured canonical representation;
- malformed path variants must fail validation rather than become additional canonical routes.

The harness should normalize generated URLs and reject invalid manually-authored URLs.

## Validation Invariants

The canonical validation pipeline must verify at least:

```text
✓ every configured static logical page expands to every configured locale
✓ every dynamic URL is known at build time
✓ every canonical-manifest URL produces static HTML
✓ no normal public URL depends on SPA fallback
✓ every internal link points to a known manifest URL
✓ every internal link contains a valid locale prefix
✓ every canonical URL points to a known manifest URL
✓ every hreflang target exists in the manifest
✓ sitemap entries correspond to known indexable URLs
✓ unsupported locales are not published
✓ missing localized content fails the build
✓ public URLs follow normalization rules
```

## Rationale

This design combines framework-native conventions with deterministic static-site guarantees.

File-conventional routing minimizes boilerplate for the main use case.

The generated canonical URL manifest adds a thin compile-time layer without replacing React Router's routing responsibilities.

This model is particularly suitable for AI agents because:

- ordinary pages require little routing configuration;
- locale expansion happens automatically;
- repeated URL logic is centralized;
- dynamic-route complexity is isolated to cases that actually need it;
- routing and SEO errors are caught mechanically;
- agents do not need to manually keep prerender, sitemap, canonical URLs and `hreflang` in sync.

## Consequences

### Positive

- Low boilerplate for ordinary pages.
- One route implementation per logical page.
- Full static HTML generation for every localized route.
- Strong SEO compatibility.
- Deterministic URL inventory.
- Sitemap, canonical and `hreflang` logic remain consistent.
- Dynamic routes scale without becoming the dominant architecture.
- Broken routing and localization assumptions can fail before deployment.
- Deployment remains compatible with generic static web servers.

### Negative

- The harness must implement canonical-manifest generation.
- React Router's route conventions remain framework-specific knowledge.
- Locale-prefixed routes mean all concrete URLs require build-time expansion.
- Dynamic content sources must expose their concrete slugs at build time.
- Localized slugs are intentionally unsupported by the base architecture.
- Application-level redirect management is intentionally excluded.

## Rejected or Deferred Alternatives

### Explicit Central Route Table

Rejected in favor of filesystem conventions because it adds boilerplate for the dominant static-page use case.

### Manually Maintained Prerender URL List

Rejected because locale expansion and content growth would create duplication and synchronization risk.

### Link Crawling as the Source of Published URLs

Rejected because route existence should not depend on whether a page happens to be linked from another page.

Link crawling may still be used as validation.

### Separate Build Per Locale

Rejected because React Router can represent locale-prefixed routes within one routing/build model.

Multiple independent builds would add unnecessary harness complexity.

### Localized Slugs

Deferred/out of scope.

Using the same slug across locales reduces routing and agent complexity.

### SPA-Only Pages

Rejected for the base harness because the primary use case requires SEO-ready prerendered marketing/content pages.

### Application-Level Redirects

Out of scope.

Deployment-specific redirects and aliases should be handled by nginx or equivalent infrastructure.
