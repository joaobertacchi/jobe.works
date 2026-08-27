# Architecture Review Result — Homepage Redesign (Systems Wayfinding)

Review mode: inline (degraded). The shipped arch-review subagent was unreachable this session (provider usage limit: "try again at 6:37 PM"), so the review was run inline from `docs/adrs/022-agent-documentation-and-architecture-review.md`, evaluating the uncommitted change against AGENTS.md and the relevant ADRs. Disclosure noted in the final report.

## Conformance assessment

- **Static purity (AGENTS.md / ADR-022):** PASS. `react-router.config.ts` keeps `ssr: false` and prerenders every public route. No backend, serverless function, route action, local API, or runtime server was added. The new dependency `@fontsource/barlow-condensed` is a build-time static font import (no CDN, no runtime server) and is a justified, non-architectural dependency recorded in `package.json`.
- **Localization (ADR-014):** PASS. All new user-facing copy lives in the typed `home.ts` dictionary with both `en` and `pt-BR`; the topology labels, founder statement, evidence status, and every CTA are localized. No hardcoded user-facing strings in the route.
- **SEO (ADR-019):** PASS. The route's `meta` still emits explicit localized metadata and Organization JSON-LD; nothing was dropped.
- **Analytics / consent (ADR-015, ADR-017):** PASS. CTAs emit typed `cta_pressed` events through `app/analytics/`; the consent banner stays in `app/consent/`; no provider calls from pages; no secrets exposed.
- **Design-system reuse (ADR-011):** PASS. The redesign reuses the existing `Button` and `TextLink` UI primitives (updating their variants) rather than introducing a parallel button/link abstraction. The new `SystemsTopology` is a single domain component (not an abstraction library) confined to the homepage surface. The `system-topology` classes are used only by `app/routes/$locale._index.tsx` and `systems-topology.tsx`; no bleed into other routes.
- **Static data truth (documented requirement):** PASS. No fabricated evidence. The ScoreCard renders empty tracks, the pending `SC–00` marker, and no invented metric, score, customer, credential, or outcome. The topology is a routing diagram, not a measured diagram.
- **Agent-friendliness / project consistency:** PASS. The design world is intentionally out-of-distribution (per the user's explicit `$impeccable shape` brief), not architectural drift. Patterns stay in the established structure (routes, domain components, typed i18n, primitives).

## Findings

```yaml
status: PASS
findings: []
```

Advisory only (non-blocking, not architecture findings): the design detector reports `design-system-font-size` advisories for intentional micro-typography in the SVG topology label rendering (17px/15px) and utility chrome (0.75rem/0.8125rem). These are deliberate and now documented in the regenerated DESIGN.md type character; they are not architectural drift and do not block completion.

Deterministic validation (run during the build): `npm run check` and `npm run test:e2e` both passed (328 unit tests, 38 Playwright tests). A final re-run is performed after the documenter write.
