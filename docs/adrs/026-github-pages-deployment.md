# ADR 026 — GitHub Pages Deployment

**Status:** Accepted

## Context

ADR 004 requires a portable static artifact and allows provider-specific deployment as an optional convenience. The jobe.works fork needs automatic publishing on every change to `main`.

## Decision

CI deploys `build/client` to GitHub Pages with the official Pages actions after `npm run check` and `npm run test:e2e` pass on a push to `main`. Pull requests validate only.

The site is served from the custom domain `https://jobe.works`, matching the default `SITE_ORIGIN`, because the build emits root-absolute URLs.

GitHub Pages serves unknown paths with a root `404.html`. The workflow copies `pt-BR/404/index.html` to `404.html` after validation; the portable artifact produced by `finalizeStaticBuild` is unchanged.

## Consequences

- Moving to another host requires only replacing the deploy job; the build is untouched.
- GitHub Pages redirects extensionless directory URLs (for example `/en/about`) to a trailing-slash form. Any change to canonical URL shape to avoid that redirect is a separate SEO decision under ADR 019.
- Pages settings (source, custom domain, HTTPS) and DNS live outside the repository and are documented in the README.
