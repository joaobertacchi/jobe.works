# Architecture Review Input Packet

## User request and acceptance criteria

Request: adapt the static-website-template repository into the JOBE marketing website (jobe.works), following the user's confirmed brief:

- The site is for JOBE's customers (founders and technical leaders of startups/SMBs), not for template consumers.
- Preserve the repository architecture and follow accepted ADRs; existing template components and pages are examples only and were replaced.
- The visual direction is the category standard (canon), chosen by the owner; composition comp-a was approved on 2026-08-15 (see PRODUCT.md, DESIGN.md, and the direction contract comment in app/root.tsx).
- Locales: en + pt-BR (default pt-BR); domain jobe.works; contact joao@jobe.works.
- No new dependencies; no backend, serverless function, route action, local API, or runtime server.

## Changed files to review (the JOBE site change)

Modified (tracked):
- app/app.css, app/root.tsx (theme tokens; direction contract comment)
- app/seo/site-config.server.ts (JOBE, origin https://jobe.works)
- app/components/ui/heading.tsx, app/components/ui/text-link.tsx
- app/components/sections/hero-section.tsx, app/components/domain/service-card.tsx
- app/components/site/site-header.tsx, app/components/site/primary-navigation.tsx, app/components/site/site-footer.tsx
- app/components/domain/contact-form.tsx (keys moved to contact.*)
- app/i18n/translations/{common,home,services,about,privacy}.ts, app/i18n/translations/index.ts, app/i18n/types.ts
- app/routes/$locale._index.tsx, $locale.about.tsx, $locale.services.tsx
- public/social-card.svg
- Tests: app/components/**/*.test.tsx, app/routes/$locale.test.tsx, app/routes/seo-meta.test.tsx, app/seo/metadata.test.ts, app/seo/site-config.server.test.ts, app/i18n/i18n.test.tsx, app/i18n/types.type-test.ts, app/app-css.test.ts, scripts/finalize-static-build.test.ts, scripts/seo-static.test.ts, tests/e2e/*.spec.ts
- Deleted: app/assets/images/about-workflow.svg (orphaned after about-page rewrite)

New (untracked):
- app/components/domain/isometric-motif.tsx
- app/components/sections/case-band.tsx, app/components/sections/funnel-section.tsx
- app/routes/$locale.case.tsx, app/routes/$locale.contact.tsx
- app/i18n/translations/case.ts, app/i18n/translations/contact.ts
- public/favicon.svg
- PRODUCT.md, DESIGN.md, .impeccable/design.json (documentation, per AGENTS.md/impeccable flow)
- .codex/agents/architecture-review.toml (this agent's definition)

Out of scope (pre-existing user changes, not part of this request): .agents/, .claude/, .codex/ (pre-existing contents), .opencode/skills/, .opencode/agents/architecture-review.md modifications, eslint.config.js/.prettierignore modifications, .impeccable/ config.

## Deterministic validation results

- npm run check: PASS (format, lint, typecheck, coverage with thresholds, static build + full prerender of all public routes in both locales).
- Unit tests: 326 passed.
- Browser tests (Playwright): 38/38 passed.
- Design detector: no findings. Finish review: fix -> all findings resolved (verdict pass).
- Direction contract seed (7ecc6614) verified present in built HTML.

## Follow-up round (verify the fixes)

The previous review returned NEEDS_CHANGES with two medium findings, both fixed:

1. Contact page no longer renders the no-op example form: the page now offers the mailto booking path (app/routes/$locale.contact.tsx; keys in app/i18n/translations/contact.ts). The ContactForm component, FormPrivacyNotice, and the example integration remain in the codebase as the documented provider-boundary pattern with unit tests, but are not rendered on any public page.
2. The header wordmark, primary navigation, and footer links now use the TextLink UI primitive (new nav/wordmark variants with NavLink active support in app/components/ui/text-link.tsx) instead of raw React Router links with duplicated styles.

Validation after fixes: npm run check PASS; 326 unit tests PASS; 37/37 Playwright tests PASS.

Please re-review the change (same scope and sources) and return the YAML contract.
