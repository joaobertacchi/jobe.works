# Agent Instructions

## Project

This repository is an AI-agent harness for localized static marketing and content websites. Start with `docs/README.md`; `docs/PRD.md` defines the product and accepted ADRs under `docs/adrs/` are authoritative for architecture.

## Invariants

- Use React Router Framework Mode with TypeScript.
- Keep `ssr: false` and prerender every public route.
- Keep production output static and deployable without Node.js.
- Do not add a backend, serverless function, route action, local API, or runtime server without explicit user authorization and a documenting ADR.
- Keep user-facing page copy in typed localization dictionaries and SEO metadata explicit and localized.
- Reuse existing components and patterns before adding abstractions or dependencies.
- Emit typed analytics events through `app/analytics/`; do not call providers from pages or arbitrary components.
- Keep consent handling in `app/consent/` and vendor-specific code in `app/integrations/` or the established analytics tracker boundary.
- Treat browser-visible configuration as public and never expose secrets in frontend code.

## Code Map

| Concern | Location |
|---|---|
| Public pages and layouts | `app/routes/` |
| Locale configuration and typed copy | `app/i18n/` |
| Primitives, domain UI, sections, and site chrome | `app/components/ui/`, `app/components/domain/`, `app/components/sections/`, `app/components/site/` |
| SEO metadata and site configuration | `app/seo/` |
| Canonical routes and localized paths | `app/routing/` |
| Analytics, consent, and attribution | `app/analytics/`, `app/consent/` |
| Third-party providers | `app/integrations/` |
| Static build validation | `scripts/`, `react-router.config.ts` |
| Browser tests and shared error fixture | `tests/e2e/` |

## Working Rules

- Inspect and adapt the nearest working example before creating a new pattern.
- To add a public page, add a locale-prefixed route module, register typed copy for every locale, define explicit localized SEO metadata, update links or navigation when required, and add meaningful tests. Use `app/routes/$locale.services.tsx` and `app/i18n/translations/services.ts` as the complete example.
- Reuse `app/components/ui/` primitives. Add domain components for feature semantics, sections for reusable page regions, and site components for site-wide chrome. Keep unique page composition in its route until reuse is demonstrated.
- Before adding a dependency, check the platform, React Router, and installed packages; record the build-vs-buy reason. A dependency that changes primary architecture requires an ADR.
- Read only ADRs relevant to the changed area. If a requirement conflicts with an accepted ADR, obtain explicit user authorization and document the exception in a new ADR.

## Completion

1. Activate the Node.js version in `.nvmrc` before installing dependencies or running validation.
2. Add or update meaningful tests for behavior changes.
3. Run `npm run check` and fix root causes.
4. Run `npm run test:e2e` for browser-visible changes.
5. After deterministic validation passes, run the repository's `architecture-review` subagent against the current change and fix all high and medium findings.
6. Do not weaken validation, thresholds, tests, or hooks to make changes pass.

## graphify

The project knowledge graph is in `graphify-out/`.

- Before answering architecture or codebase questions, run `graphify update .` and read `graphify-out/GRAPH_REPORT.md`.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- For cross-module relationships, prefer `graphify query`, `graphify path`, or `graphify explain` over text search.
