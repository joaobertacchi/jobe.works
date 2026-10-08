# ADR 026 — GitHub Pages Deployment

**Status:** Accepted

## Context

ADR 004 requires a portable static artifact and allows provider-specific deployment as an optional convenience. The jobe.works fork needs automatic publishing on every change to `main`.

## Decision

CI deploys `build/client` to GitHub Pages with the official Pages actions after `npm run check` and `npm run test:e2e` pass on a push to `main`. Pull requests validate only.

The site is served from the custom domain `https://jobe.works`, matching the default `SITE_ORIGIN`, because the build emits root-absolute URLs.

After validation, `scripts/stage-github-pages.ts` adapts the artifact to GitHub Pages hosting conventions; the portable artifact produced by `finalizeStaticBuild` is unchanged:

- GitHub Pages answers `/en/about` with a `301` to `/en/about/` when the page is stored as `en/about/index.html`, and the client router treats trailing-slash inner paths as not found. Each inner page is therefore moved to `<locale>/<page>.html`, which Pages serves at the canonical extensionless URL. Root and locale home pages keep their `index.html`, matching their trailing-slash canonical URLs.
- GitHub Pages serves unknown paths with a root `404.html`, copied from the `pt-BR` not-found page.

## Consequences

- Moving to another host requires only replacing the deploy job; the build is untouched.
- Nested inner pages (for example `/en/guides/setup`) would make flattening ambiguous; the staging script fails the deploy until that case is designed.
- Unknown paths under `/en/` render the Portuguese not-found page, because GitHub Pages supports one root `404.html`.
- Pages settings (source, custom domain, HTTPS) and DNS live outside the repository and are documented in the README.
