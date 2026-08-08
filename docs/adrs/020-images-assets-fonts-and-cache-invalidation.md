# ADR 020 — Images, Assets, Fonts, and Cache Invalidation

**Status:** Accepted

## Context

The project builds static websites that are deployed as HTML, CSS, JavaScript, and other static assets.

Production deployment is expected to use a static server such as nginx, potentially behind a CDN such as Cloudflare.

The asset architecture must support:

- simple authoring;
- reliable production cache invalidation;
- long-lived caching of immutable assets;
- static deployment;
- straightforward behavior for AI coding agents;
- minimal custom infrastructure.

The project does not require an image optimization service or a custom image component abstraction.

React Router Framework uses Vite for its production asset pipeline, so assets imported through the application module graph can benefit from Vite's build-time asset processing and hashed filenames.

## Decision

Use normal HTML image elements and Vite-managed asset imports.

The default approach is:

```text
application asset
      ↓
imported from source code
      ↓
Vite build pipeline
      ↓
content-hashed production filename
```

Use `public/` only for files that intentionally need a stable public URL.

## Images

Direct use of `<img>` is allowed.

The template does not require a custom `Image` primitive.

Example:

```tsx
import heroImage from '~/assets/images/hero.webp';

export function Hero() {
  return (
    <img
      src={heroImage}
      alt="..."
    />
  );
}
```

Accessibility requirements such as meaningful `alt` text still apply.

## Asset Location

Application assets should normally live under the application source tree.

Conceptually:

```text
app/
  assets/
    images/
    icons/
    fonts/
```

The exact organization may evolve by fork.

The important distinction is whether an asset participates in the build pipeline.

## Imported Assets

Assets referenced through JavaScript, TypeScript, TSX, or CSS imports should go through Vite's module graph.

For example:

```ts
import heroImage from '~/assets/images/hero.webp';
```

A production build may emit an asset such as:

```text
/assets/hero.Cf9x2ab1.webp
```

The filename changes when the asset content changes.

This is the default strategy for production cache invalidation.

## Cache Invalidation

Content-hashed assets are considered immutable.

When an asset changes:

```text
hero.Cf9x2ab1.webp
        ↓
content changes
        ↓
hero.Kd72mPq4.webp
```

The generated HTML references the new URL.

Existing cached copies of the previous asset do not need to be explicitly invalidated.

This avoids manual cache-busting query parameters and reduces the need for CDN purges.

## JavaScript and CSS

The same principle applies to generated JavaScript and CSS bundles.

Production assets emitted by the Vite build should use content-derived filenames.

These may therefore receive aggressive immutable caching.

## `public/` Directory

Files in `public/` are copied to the output with stable names.

They do not receive the same content-hashed naming behavior as imported assets.

Examples may include:

```text
public/
  favicon.ico
  robots.txt
  manifest.webmanifest
```

The `public/` directory should therefore be reserved for assets that intentionally require stable URLs.

## Avoid Stable URLs for Frequently Changed Assets

Frequently changed application assets should not normally be referenced like:

```tsx
<img src="/images/hero.webp" />
```

when `hero.webp` is stored in `public/`.

Doing so keeps the same URL across deployments and may lead to stale browser or CDN caches.

Prefer:

```tsx
import heroImage from '~/assets/images/hero.webp';

<img src={heroImage} alt="..." />
```

for normal application imagery.

## Stable Public Files

Stable filenames are appropriate where external systems or web standards expect a known URL.

Examples include:

- `robots.txt`;
- favicon files;
- web manifests;
- verification files;
- other assets whose pathname is externally defined.

These files should use an appropriate cache policy rather than immutable caching.

## Production Cache Policy

Production hosting should distinguish between hashed assets, HTML, and stable public files.

Conceptually:

```text
Hashed assets
/assets/*.hash.js
/assets/*.hash.css
/assets/*.hash.webp
    ↓
long cache lifetime
immutable

HTML
/en/index.html
/pt-BR/services/index.html
    ↓
short cache lifetime or revalidation

Stable public files
/robots.txt
/favicon.ico
    ↓
appropriate shorter/revalidation policy
```

## Hashed Asset Caching

Hashed assets may use a production policy similar to:

```http
Cache-Control: public, max-age=31536000, immutable
```

because any content change creates a different URL.

The exact nginx or CDN configuration remains a deployment concern.

## HTML Caching

HTML must not be treated as permanently immutable.

A new deployment may produce new HTML that references new hashed assets.

HTML should therefore use conservative caching or revalidation.

This ensures visitors receive current references after deployment.

## CDN Behavior

The architecture should not require explicit CDN cache purges for normal changes to:

- JavaScript;
- CSS;
- imported images;
- imported fonts;
- other hashed build assets.

A CDN such as Cloudflare may cache these aggressively because their URLs are content-addressed by filename.

HTML and stable-name files may still require ordinary cache revalidation behavior.

## Image Optimization

The base template does not include:

- an image optimization server;
- an image CDN;
- automatic runtime resizing;
- framework-specific responsive image infrastructure.

Images should be prepared appropriately for the website.

Individual forks may add optimization tooling when actual image volume or performance requirements justify it.

## Responsive Images

Standard browser features may be used directly when necessary.

For example:

```tsx
<img
  src={heroImage}
  srcSet={...}
  sizes={...}
  alt="..."
/>
```

The template does not introduce a custom responsive-image abstraction by default.

## SVG

SVG assets may be used as:

- imported files;
- inline SVG markup;
- React components where useful.

No single SVG representation is required globally.

The implementation should favor the simplest approach for the actual use case.

## Social Preview Images

Open Graph and social preview images should be static assets.

The base template does not require dynamic social-image generation.

A default site-level social image may be imported or otherwise emitted as a production asset.

Pages may override it when needed, as defined by ADR 019.

## Fonts

The base template should use a system font stack by default.

This avoids:

- external font dependencies;
- additional network requests;
- layout shifts caused by remote font loading;
- privacy dependencies on third-party font providers.

## Custom Fonts

When a fork requires custom fonts, prefer self-hosted font files.

Font assets should normally be imported through the build pipeline so that production filenames are hashed.

Conceptually:

```text
app/assets/fonts/
  brand-regular.woff2
  brand-bold.woff2
```

with CSS references participating in the Vite build.

## Remote Font Providers

Runtime font loading from providers such as Google Fonts is not the default architecture.

A fork may use a remote provider if its requirements justify it, but should consider:

- privacy;
- availability;
- performance;
- caching;
- external network dependency.

Self-hosting remains the preferred custom-font approach.

## Font Preloading

Critical self-hosted fonts may be preloaded when doing so produces measurable performance benefit.

The base template does not require aggressive font-preload configuration by default.

Avoid preloading every font variant.

## Asset Naming in Source

Source filenames should remain descriptive.

For example:

```text
hero.webp
company-logo.svg
brand-regular.woff2
```

Developers and AI agents should not manually append version hashes to source filenames.

The production build pipeline owns cache-busting filenames.

## Query-String Cache Busting

Do not use manual version query parameters as the normal cache invalidation strategy.

Avoid patterns such as:

```text
hero.webp?v=17
```

for imported application assets.

Content-hashed build filenames already solve this problem more reliably.

## Agent Guidance

AI agents modifying a fork should:

1. use normal `<img>` elements where appropriate;
2. place application assets under the source tree;
3. import normal images, fonts, and assets so they pass through Vite;
4. use `public/` only when a stable URL is genuinely required;
5. not manually create cache-busting filenames or query parameters;
6. provide appropriate `alt` text for meaningful images;
7. prefer system fonts unless the website design requires a custom font;
8. prefer self-hosted custom fonts over runtime third-party font dependencies;
9. avoid introducing an image optimization service without a concrete need;
10. preserve static deployment behavior.

## Validation

Mechanical checks may verify simple invariants where reliable.

Examples may include:

```text
✓ production build succeeds

✓ referenced imported assets exist

✓ required stable public files exist

✓ generated public URLs are valid
```

The template does not need custom linting to prohibit every direct `/public` asset reference.

Examples and documentation should establish the preferred behavior.

## Rationale

Vite already provides the asset behavior the project needs.

Imported assets receive build-managed filenames suitable for immutable caching.

Introducing another asset abstraction would duplicate existing tooling and increase the conceptual surface for developers and AI agents.

Allowing ordinary `<img>` usage keeps browser APIs visible and familiar.

The distinction between:

```text
imported asset → hashed URL

public asset → stable URL
```

is sufficient for the project's production caching requirements.

## Consequences

### Positive

- Automatic cache invalidation for normal application assets.
- Long-lived CDN/browser caching is safe for hashed files.
- No custom asset pipeline.
- No framework-specific image component required.
- Simple browser-native `<img>` usage.
- Static hosting remains straightforward.
- Custom fonts can use the same cache-busting model.
- Normal deployments usually do not require asset cache purges.

### Negative

- No automatic image resizing or compression service.
- Developers remain responsible for appropriate image dimensions and formats.
- Files placed in `public/` require more careful cache policy.
- Responsive image variants require explicit browser markup when needed.
- HTML caching must be configured differently from immutable assets.

These tradeoffs are accepted for a static marketing/content website harness.

## Rejected Alternatives

### Mandatory Custom `Image` Component

Rejected because the browser's `<img>` element is sufficient for the base template.

### Image Optimization Server

Rejected because it conflicts with the simple static deployment model and is unnecessary for the current use case.

### All Assets in `public/`

Rejected because stable filenames make cache invalidation more difficult.

### Manual Asset Versioning

Rejected because Vite content hashing provides automatic cache invalidation.

### Query-String Cache Busting

Rejected as unnecessary for build-managed assets.

### Remote Fonts by Default

Rejected because system fonts or self-hosted fonts provide simpler performance and privacy characteristics.

### Custom Asset Manifest

Rejected because the existing build system already manages production asset URLs.

## Future Evolution

A fork may introduce additional asset infrastructure if justified by real requirements such as:

- large image libraries;
- automated responsive-image generation;
- AVIF/WebP conversion pipelines;
- image CDNs;
- dynamic social image generation;
- extensive font subsetting.

Such additions should preserve the distinction between immutable hashed assets and intentionally stable public URLs.
