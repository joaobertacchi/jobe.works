# AI-Agent Static Website Template

A reusable development harness for building localized static marketing and content websites with AI coding agents. Fork it, describe the website you need, and evolve the included examples into your own brand, pages, design system, and integrations.

This is not a website framework or a finished website. It is a production-ready technical foundation with explicit conventions, representative examples, deterministic validation, and architecture review guidance.

## What You Get

- React Router Framework Mode with TypeScript and static prerendering
- Locale-prefixed routes and typed translation dictionaries
- Explicit localized SEO metadata, canonical URLs, alternate links, sitemap, and `robots.txt`
- Tailwind CSS, semantic theme tokens, and light/dark theme support
- Reusable UI, domain, section, and site component layers
- Typed analytics events, campaign attribution, and consent-aware tracking boundaries
- Unit, component, and Playwright browser tests
- Static build validation for routes, SEO, links, and assets
- Agent instructions and an architecture-review workflow
- Provider-neutral static output that does not require Node.js in production

The template intentionally does not include a CMS, backend, deployment platform, complete design system, real contact provider, or business-specific content. Each fork supplies those only when its requirements justify them.

## Create Your Website

Fork this repository or create a repository from the template, then clone your copy. Website forks can remove the template-maintainer history before starting:

```bash
rm -rf docs/template
```

Create `docs/PRD.md` for the website's actual product requirements, then install and run the project:

```bash
nvm use
npm ci
npx playwright install chromium
npm run dev
```

`nvm use` activates Node.js 22.22.2 from `.nvmrc`. If you do not use nvm, install a Node.js version allowed by `package.json`: 22.22.2+, 24.15.0+, or 26+.

The development server prints its local URL when it starts. The initial site demonstrates the repository's patterns and is meant to be replaced, not published unchanged.

## Work With an AI Agent

Give the agent a clear website brief. OpenCode and Codex discover the shared contract in `AGENTS.md` automatically; `CLAUDE.md` imports the same contract for Claude. No instruction-file bootstrap prompt is needed.

For example:

```text
Adapt this template into a website for [organization].

Audience: [primary audience]
Goals: [business and user goals]
Pages: [required pages]
Locales: [required locales]
Brand direction: [visual and editorial direction]
Integrations: [forms, analytics, or other providers]

Reuse the existing patterns, keep production output static, and complete the
repository validation workflow before finishing.
```

Working examples are the primary procedural documentation. The complete localized page example is `app/routes/$locale.services.tsx`, with its typed copy in `app/i18n/translations/services.ts`.

## Customize the Template

Use this order as a practical starting point. A coding agent may change several of these areas together as it builds the site.

### 1. Site Identity and SEO

- Set the site name and default social image in `app/seo/site-config.server.ts`.
- Replace `public/favicon.ico` and `public/social-card.svg`.
- Set `SITE_ORIGIN` to the production HTTPS origin when building. Without it, the template uses `https://example.com`.
- Keep every public page's localized SEO data explicit. See `app/seo/metadata.ts` and the route examples.

### 2. Locales and Copy

- Configure supported locales and the default locale in `app/i18n/config.ts`.
- Replace the example copy in `app/i18n/translations/`.
- Register every translation domain for every supported locale in `app/i18n/translations/index.ts`.

User-facing page copy belongs in the typed dictionaries rather than directly in route components. TypeScript reports missing locale content.

### 3. Pages and Navigation

- Add or replace localized public pages in `app/routes/`.
- Update site navigation and chrome in `app/components/site/`.
- Reuse primitives from `app/components/ui/`, domain components from `app/components/domain/`, and reusable page regions from `app/components/sections/`.
- Add meaningful unit and browser tests for changed behavior.

Public routes must remain locale-prefixed and prerenderable. The build derives published URLs from the route structure and verifies localized siblings, internal links, and static artifacts.

### 4. Visual System and Assets

- Establish the fork's colors, typography, and theme tokens in `app/app.css`.
- Evolve the included components instead of creating parallel primitives that serve the same purpose.
- Put imported, content-hashed assets under `app/assets/` and stable public files under `public/`.

The included styles demonstrate the architecture; they are not a finished design system for every fork.

### 5. Integrations, Privacy, and Analytics

- Replace `app/integrations/example-contact/submit-example-contact.ts` with a real browser-safe provider integration if the site needs contact submission. The included implementation is intentionally a no-op.
- Adapt the privacy content in `app/i18n/translations/privacy.ts` to the site's actual data processing and legal obligations.
- Define and emit typed events through `app/analytics/`; do not call analytics providers directly from pages.
- Keep consent behavior in `app/consent/` and provider-specific code in `app/integrations/` or the existing analytics tracker boundary.
- Treat all browser-visible configuration as public. Do not put secrets in frontend code or client-exposed environment variables.

The base architecture is static. Adding a project-owned backend, serverless function, route action, or runtime server requires an explicit architectural decision for the fork.

## Before Publishing

Confirm that the fork no longer exposes template placeholders:

- `SITE_ORIGIN` is the production HTTPS origin, not `https://example.com`.
- The site name, favicon, social card, metadata, and visible branding are project-specific.
- Example pages and translation dictionaries contain the final localized content.
- Privacy and consent copy accurately describes the selected providers and data handling.
- Contact forms use a real provider or have been removed; the example provider does not submit data.
- Navigation, locale switching, themes, forms, analytics, and consent have been tested in a browser.

## Validate Changes

Run the deterministic quality gate:

```bash
npm run check
```

It checks formatting, lint, TypeScript, unit/component tests, coverage, the production build, and static-site invariants such as localized output, SEO metadata, sitemap consistency, links, and assets.

For browser-visible changes, also run:

```bash
npm run test:e2e
```

Playwright builds and serves the static site, then tests it in headless Chromium. After deterministic validation passes, ask the repository's `architecture-review` agent to review the change and fix all high and medium findings. GitHub Actions runs `npm run check` and `npm run test:e2e` for pushes to `main` and pull requests.

## Build and Deploy

Build with the canonical public origin:

```bash
SITE_ORIGIN=https://www.example.org npm run build
```

Deploy the contents of `build/client` to any conventional static web server or static hosting provider. Production does not require Node.js, React Router server packages, or an application runtime.

Configure unknown paths as normal static-server 404 responses. Do not configure an SPA fallback to `index.html`; every public route is prerendered to its own static HTML artifact.

### GitHub Pages

Pushes to `main` deploy automatically through `.github/workflows/ci.yml` once validation and browser tests pass. One-time setup:

1. Enable Pages with GitHub Actions as the source: `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`. If Pages is already enabled, use `-X PUT` instead.
2. Optionally verify the domain under the GitHub account's Settings → Pages to protect it against takeover.
3. Set the custom domain: `gh api -X PUT repos/<owner>/<repo>/pages -f cname=jobe.works`.
4. Point DNS for the apex domain to GitHub Pages (`A` 185.199.108–111.153, `AAAA` 2606:50c0:8000–8003::153). On Cloudflare, keep these records DNS only so GitHub can issue the certificate. No `www` record is required; add `www CNAME <owner>.github.io` only if `www` should redirect to the apex.
5. Enforce HTTPS once the certificate is issued: `gh api -X PUT repos/<owner>/<repo>/pages -F https_enforced=true`.

## Command Reference

| Command               | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start local development                        |
| `npm run check`       | Run the canonical deterministic quality gate   |
| `npm run test`        | Run unit and component tests                   |
| `npm run test:e2e`    | Build and test the site with headless Chromium |
| `npm run test:e2e:ui` | Open Playwright's interactive UI               |
| `npm run format`      | Write Prettier formatting                      |
| `npm run build`       | Produce the static artifact in `build/client`  |
| `npm run preview`     | Serve the built artifact locally               |

## Documentation

| Document                                           | Audience and purpose                                           |
| -------------------------------------------------- | -------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                           | Shared operational contract discovered by OpenCode and Codex   |
| [`CLAUDE.md`](CLAUDE.md)                           | Claude adapter that imports the shared agent contract          |
| [`docs/INDEX.md`](docs/INDEX.md)                   | Index of working examples, decisions, and active documentation |
| `docs/PRD.md`                                      | Fork-owned product requirements, created during adoption       |
| [`docs/decisions_list.md`](docs/decisions_list.md) | Architectural decision status                                  |
| [`docs/adrs/`](docs/adrs/)                         | Accepted architectural decisions and rationale                 |

Start with this README as the human adopter. Supported coding agents load their repository contract automatically and can use `docs/INDEX.md` when a task needs deeper context.
