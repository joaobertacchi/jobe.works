# Documentation Index

This index maps the active product, architecture, implementation examples, and validation references for websites built from this repository.

## Active Documentation

| Need | Source |
|---|---|
| Adopt and customize the template | [Root README](../README.md) |
| Website product requirements | `docs/PRD.md`, created by the fork when needed |
| AI-agent operating contract | [`AGENTS.md`](../AGENTS.md) |
| Architectural decision status | [`decisions_list.md`](decisions_list.md) |
| Architectural decisions and rationale | [`adrs/`](adrs/) |

Accepted ADRs remain active after forking. Fork-specific architectural decisions join the same sequence under `docs/adrs/`.

## Working Examples

| Change | Primary example | Supporting context |
|---|---|---|
| Localized public page | [`app/routes/$locale.services.tsx`](../app/routes/$locale.services.tsx) | [`app/i18n/translations/services.ts`](../app/i18n/translations/services.ts), [`app/i18n/translations/index.ts`](../app/i18n/translations/index.ts), [`app/seo/metadata.ts`](../app/seo/metadata.ts) |
| Page composition | [`app/routes/$locale.services.tsx`](../app/routes/$locale.services.tsx) | [`app/components/ui/`](../app/components/ui/), [`app/components/domain/`](../app/components/domain/), [`app/components/sections/`](../app/components/sections/), [`app/components/site/`](../app/components/site/) |
| Typed analytics behavior | [`app/analytics/types.ts`](../app/analytics/types.ts) | [`app/analytics/analytics.tsx`](../app/analytics/analytics.tsx), [`app/analytics/manager.ts`](../app/analytics/manager.ts) |
| Consent and attribution | [`app/consent/consent-context.tsx`](../app/consent/consent-context.tsx) | [`app/analytics/attribution.ts`](../app/analytics/attribution.ts), [`app/components/site/consent-banner.tsx`](../app/components/site/consent-banner.tsx) |
| Browser-safe provider | [`app/integrations/example-contact/submit-example-contact.ts`](../app/integrations/example-contact/submit-example-contact.ts) | [`app/components/domain/contact-form.tsx`](../app/components/domain/contact-form.tsx) |
| Published URLs and static validation | [`app/routes.ts`](../app/routes.ts) | [`app/routing/canonical-url-manifest.ts`](../app/routing/canonical-url-manifest.ts), [`react-router.config.ts`](../react-router.config.ts), [`scripts/finalize-static-build.ts`](../scripts/finalize-static-build.ts) |
| Focused unit test | [`app/components/domain/service-card.test.tsx`](../app/components/domain/service-card.test.tsx) | Tests are colocated with implementations |
| Browser test | [`tests/e2e/routing.spec.ts`](../tests/e2e/routing.spec.ts) | [`tests/e2e/fixtures.ts`](../tests/e2e/fixtures.ts), [`playwright.config.ts`](../playwright.config.ts) |
| Architecture review | [`.opencode/agents/architecture-review.md`](../.opencode/agents/architecture-review.md) | [ADR 022](adrs/022-agent-documentation-and-architecture-review.md) |
| Continuous integration | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | [`package.json`](../package.json), [`playwright.config.ts`](../playwright.config.ts) |

## ADRs by Concern

| Concern | Decisions |
|---|---|
| Product and static deployment boundaries | [ADR 002](adrs/002-marketing-content-sites.md), [ADR 003](adrs/003-static-build-output.md), [ADR 004](adrs/004-provider-neutral-deployment.md), [ADR 005](adrs/005-backend-policy.md), [ADR 026](adrs/026-github-pages-deployment.md) |
| Framework, routing, and reuse | [ADR 001](adrs/001-react-foundation.md), [ADR 007](adrs/007-react-router-framework.md), [ADR 008](adrs/008-routing-and-static-generation.md), [ADR 009](adrs/009-reuse-model.md) |
| Agent and documentation model | [ADR 006](adrs/006-ai-agent-harness.md), [ADR 010](adrs/010-agent-contract.md), [ADR 022](adrs/022-agent-documentation-and-architecture-review.md), [ADR 024](adrs/024-agent-effectiveness-metrics-and-evaluation.md), [ADR 025](adrs/025-fork-documentation-lifecycle.md) |
| Components, styling, content, and localization | [ADR 011](adrs/011-component-design-system-architecture.md), [ADR 012](adrs/012-tailwind-theming-and-styling-model.md), [ADR 013](adrs/013-content-architecture.md), [ADR 014](adrs/014-localization-architecture.md), [ADR 027](adrs/027-persisted-locale-preference.md) |
| Analytics, privacy, and integrations | [ADR 015](adrs/015-analytics-architecture.md), [ADR 016](adrs/016-privacy-consent-and-lgpd.md), [ADR 017](adrs/017-third-party-integration-architecture.md) |
| Configuration, SEO, and assets | [ADR 018](adrs/018-configuration-and-constants.md), [ADR 019](adrs/019-seo-architecture.md), [ADR 020](adrs/020-images-assets-fonts-and-cache-invalidation.md) |
| Validation and dependencies | [ADR 021](adrs/021-quality-toolchain-and-validation.md), [ADR 023](adrs/023-dependency-policy.md) |

## Validation

| Concern | Implementation |
|---|---|
| Canonical local quality gate | [`package.json`](../package.json) (`npm run check`) |
| Browser validation | [`playwright.config.ts`](../playwright.config.ts) (`npm run test:e2e`) |
| Continuous integration | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Architectural judgment | [`.opencode/agents/architecture-review.md`](../.opencode/agents/architecture-review.md) |

## Template Maintenance

The reusable template repository also contains product history, implementation phases, and template-development plans under `docs/template/`. Website forks may remove that entire directory; active fork documentation and architecture do not depend on it.
