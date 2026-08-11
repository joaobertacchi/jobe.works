# Documentation Index

Load `AGENTS.md` first. Then read only the documents and examples relevant to the requested change; working code is the primary procedural documentation.

## Source Priority

Use context in this order:

1. The user request and acceptance criteria.
2. `AGENTS.md`.
3. Relevant accepted ADRs.
4. Existing implementation examples and conventions.
5. Deterministic validation results.

If sources conflict, the higher-priority source controls. A user-authorized architectural exception must be recorded in a new ADR.

## Core Documents

| Need | Source |
|---|---|
| Product goals, users, and non-goals | [`PRD.md`](PRD.md) |
| Implementation sequence and phase scope | [`PHASES.md`](PHASES.md) |
| Decision status overview | [`decisions_list.md`](decisions_list.md) |
| Architectural decisions and rationale | [`adrs/`](adrs/) |
| Approved designs and implementation plans | [`superpowers/`](superpowers/) |

Planning artifacts record intent but do not prove that a phase is implemented. Verify the referenced repository files before describing a capability as available.

## Working Examples

| Change | Start here | Supporting context |
|---|---|---|
| Add a localized public page | [`app/routes/$locale.services.tsx`](../app/routes/$locale.services.tsx) | [`app/i18n/translations/services.ts`](../app/i18n/translations/services.ts), [`app/i18n/translations/index.ts`](../app/i18n/translations/index.ts), [`app/seo/metadata.ts`](../app/seo/metadata.ts) |
| Compose a page from component layers | [`app/routes/$locale.services.tsx`](../app/routes/$locale.services.tsx) | [`app/components/ui/`](../app/components/ui/), [`app/components/domain/`](../app/components/domain/), [`app/components/sections/`](../app/components/sections/), [`app/components/site/`](../app/components/site/) |
| Add typed analytics behavior | [`app/analytics/types.ts`](../app/analytics/types.ts) | [`app/analytics/analytics.tsx`](../app/analytics/analytics.tsx), [`app/analytics/manager.ts`](../app/analytics/manager.ts) |
| Work with consent or attribution | [`app/consent/consent-context.tsx`](../app/consent/consent-context.tsx) | [`app/analytics/attribution.ts`](../app/analytics/attribution.ts), [`app/components/site/consent-banner.tsx`](../app/components/site/consent-banner.tsx) |
| Add a browser-safe provider | [`app/integrations/example-contact/submit-example-contact.ts`](../app/integrations/example-contact/submit-example-contact.ts) | [`app/components/domain/contact-form.tsx`](../app/components/domain/contact-form.tsx) |
| Understand published URLs and static validation | [`app/routes.ts`](../app/routes.ts) | [`app/routing/canonical-url-manifest.ts`](../app/routing/canonical-url-manifest.ts), [`react-router.config.ts`](../react-router.config.ts), [`scripts/finalize-static-build.ts`](../scripts/finalize-static-build.ts) |
| Add a focused unit test | [`app/components/domain/service-card.test.tsx`](../app/components/domain/service-card.test.tsx) | colocate the test with the implementation |
| Add a browser test | [`tests/e2e/routing.spec.ts`](../tests/e2e/routing.spec.ts) | [`tests/e2e/fixtures.ts`](../tests/e2e/fixtures.ts), [`playwright.config.ts`](../playwright.config.ts) |

Copy and adapt the nearest example. Do not create a parallel abstraction when an existing boundary already fits.

## ADRs by Concern

| Concern | Read |
|---|---|
| Product and static deployment boundaries | [ADR 002](adrs/002-marketing-content-sites.md), [ADR 003](adrs/003-static-build-output.md), [ADR 004](adrs/004-provider-neutral-deployment.md), [ADR 005](adrs/005-backend-policy.md) |
| Framework, routing, and reuse | [ADR 001](adrs/001-react-foundation.md), [ADR 007](adrs/007-react-router-framework.md), [ADR 008](adrs/008-routing-and-static-generation.md), [ADR 009](adrs/009-reuse-model.md) |
| Agent operating model | [ADR 006](adrs/006-ai-agent-harness.md), [ADR 010](adrs/010-agent-contract.md), [ADR 022](adrs/022-agent-documentation-and-architecture-review.md), [ADR 024](adrs/024-agent-effectiveness-metrics-and-evaluation.md) |
| Components, styling, content, and localization | [ADR 011](adrs/011-component-design-system-architecture.md), [ADR 012](adrs/012-tailwind-theming-and-styling-model.md), [ADR 013](adrs/013-content-architecture.md), [ADR 014](adrs/014-localization-architecture.md) |
| Analytics, privacy, and integrations | [ADR 015](adrs/015-analytics-architecture.md), [ADR 016](adrs/016-privacy-consent-and-lgpd.md), [ADR 017](adrs/017-third-party-integration-architecture.md) |
| Configuration, SEO, and assets | [ADR 018](adrs/018-configuration-and-constants.md), [ADR 019](adrs/019-seo-architecture.md), [ADR 020](adrs/020-images-assets-fonts-and-cache-invalidation.md) |
| Validation and dependencies | [ADR 021](adrs/021-quality-toolchain-and-validation.md), [ADR 023](adrs/023-dependency-policy.md) |

## Current Phase Boundaries

`PHASES.md` defines sequence and scope. At Phase 12:

- the Phase 11 CI workflow is designed but `.github/workflows/ci.yml` is not yet present;
- the Phase 13 architecture-review subagent is designed, but `.opencode/agents/architecture-review.md` is not yet present;
- a configured external architecture reviewer may still be used for the required post-validation review.

Update this section when those repository-owned files are introduced. Do not report missing future-phase capabilities as defects in the current phase.
