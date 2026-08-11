# Phase 12 Agent Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create concise, precise repository guidance that lets AI agents locate relevant context, follow existing patterns, and validate Phase 12 work without claiming future-phase capabilities exist.

**Architecture:** Keep the root `AGENTS.md` as the small operational contract, make `docs/README.md` a task-oriented navigation layer, and leave rationale in accepted ADRs and procedures in working code. Correct only demonstrated factual drift in `docs/decisions_list.md`; do not change application behavior or `docs/PRD.md`.

**Tech Stack:** Markdown, React Router Framework project conventions, npm validation, graphify, OpenCode architecture-review subagent

---

## File Structure

- Modify `AGENTS.md`: concise always-loaded invariants, ownership map, routine-change rules, validation, architecture review, and graphify discovery.
- Create `docs/README.md`: task-oriented index to product documents, examples, ADRs, planning artifacts, and current phase boundaries.
- Modify `docs/decisions_list.md`: repair ADR references and replace obsolete next-work guidance with the phased roadmap pointer.
- Preserve `docs/PRD.md`: no demonstrated product inconsistency requires a change.
- Preserve application and test files: Phase 12 introduces documentation only.

No commits are created, per user instruction.

### Task 1: Complete the Root Agent Contract

**Files:**
- Modify: `AGENTS.md:1-38`
- Reference: `docs/PHASES.md:572-610`
- Reference: `docs/adrs/010-agent-contract.md`
- Reference: `docs/adrs/022-agent-documentation-and-architecture-review.md`
- Reference: `docs/adrs/023-dependency-policy.md`

- [ ] **Step 1: Confirm the existing instructions are still the starting point**

Read `AGENTS.md` and verify that the project purpose, static invariants, validation workflow, and graphify rules are present. Do not remove those rules; replace the file with the expanded concise contract in Step 2.

- [ ] **Step 2: Replace `AGENTS.md` with the complete concise contract**

Use this exact content:

```markdown
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
5. After deterministic validation passes, run the configured architecture-review subagent against the current change and fix all high and medium findings. Phase 13 supplies the repository-owned reviewer definition.
6. Do not weaken validation, thresholds, tests, or hooks to make changes pass.

## graphify

The project knowledge graph is in `graphify-out/`.

- Before answering architecture or codebase questions, run `graphify update .` and read `graphify-out/GRAPH_REPORT.md`.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- For cross-module relationships, prefer `graphify query`, `graphify path`, or `graphify explain` over text search.
```

- [ ] **Step 3: Check the root contract against every Phase 12 requirement**

Verify this mapping manually:

| Phase 12 requirement | Contract section |
|---|---|
| Project purpose | `Project` |
| Core invariants | `Invariants` |
| Where code belongs | `Code Map` |
| How to add pages | `Working Rules` |
| Localization expectations | `Invariants`, `Working Rules` |
| Component reuse | `Invariants`, `Working Rules` |
| Analytics/integration rules | `Invariants`, `Code Map` |
| Dependency policy | `Working Rules` |
| Validation | `Completion` |
| ADR usage | `Project`, `Working Rules` |
| Architecture review | `Completion` |

Expected: every requirement maps to concise operational guidance, and no section reproduces full ADR rationale.

### Task 2: Create the Context-Saving Documentation Index

**Files:**
- Create: `docs/README.md`
- Reference: `docs/adrs/022-agent-documentation-and-architecture-review.md:62-246`
- Reference: `app/routes/$locale.services.tsx`
- Reference: `app/i18n/translations/services.ts`
- Reference: `react-router.config.ts`
- Reference: `tests/e2e/fixtures.ts`

- [ ] **Step 1: Create `docs/README.md` as an index, not a handbook**

Use this exact content:

```markdown
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
```

- [ ] **Step 2: Verify that the index routes context instead of duplicating it**

Check that:

- each table entry links to a document, directory, or representative source file;
- no section gives a long step-by-step page, component, integration, or SEO recipe;
- all 24 accepted ADRs appear exactly once in the concern table;
- the phase-boundary section states both absent repository-owned files precisely;
- no text claims CI or the Phase 13 subagent is currently implemented.

Expected: `docs/README.md` remains primarily navigation plus short source-priority and phase-boundary guidance.

### Task 3: Correct the Decision Overview

**Files:**
- Modify: `docs/decisions_list.md:13-51`
- Reference: `docs/adrs/*.md`
- Reference: `docs/PHASES.md`

- [ ] **Step 1: Replace the stale decision table with linked, accurate ADR references**

Replace the table under `## Decision Status Summary` with:

```markdown
| ID | Decision | Status | ADR |
|---|---|---|---|
| P001 | Framework / SSG Choice | Accepted | [ADR 001](adrs/001-react-foundation.md), [ADR 003](adrs/003-static-build-output.md), [ADR 007](adrs/007-react-router-framework.md) |
| P002 | Routing and Static Generation | Accepted | [ADR 008](adrs/008-routing-and-static-generation.md) |
| P003 | Repository Reuse Model | Accepted | [ADR 009](adrs/009-reuse-model.md) |
| P004 | Styling and UI Foundation | Accepted | [ADR 012](adrs/012-tailwind-theming-and-styling-model.md) |
| P005 | Component / Design-System Architecture | Accepted | [ADR 011](adrs/011-component-design-system-architecture.md) |
| P006 | Design Tokens and Theme Model | Accepted | [ADR 012](adrs/012-tailwind-theming-and-styling-model.md) |
| P007 | Content Architecture | Accepted | [ADR 013](adrs/013-content-architecture.md) |
| P008 | Page Composition Model | Accepted | [ADR 011](adrs/011-component-design-system-architecture.md), [ADR 013](adrs/013-content-architecture.md) |
| P009 | Localization Architecture | Accepted | [ADR 014](adrs/014-localization-architecture.md) |
| P010 | Analytics Architecture | Accepted | [ADR 015](adrs/015-analytics-architecture.md) |
| P011 | Privacy and Consent Model | Accepted | [ADR 016](adrs/016-privacy-consent-and-lgpd.md) |
| P012 | Third-Party Integration Model | Accepted | [ADR 017](adrs/017-third-party-integration-architecture.md) |
| P013 | Constants and Configuration Model | Accepted | [ADR 018](adrs/018-configuration-and-constants.md) |
| P014 | SEO Architecture | Accepted | [ADR 019](adrs/019-seo-architecture.md) |
| P015 | Asset Management and Cache Strategy | Accepted | [ADR 020](adrs/020-images-assets-fonts-and-cache-invalidation.md) |
| P016 | Quality Toolchain and Validation | Accepted | [ADR 021](adrs/021-quality-toolchain-and-validation.md) |
| P017 | Agent Documentation and Architecture Review Model | Accepted | [ADR 022](adrs/022-agent-documentation-and-architecture-review.md) |
| P018 | Dependency Policy | Accepted | [ADR 023](adrs/023-dependency-policy.md) |
| P019 | Agent Documentation and Mechanical Guardrails | Covered by ADR 022 | [ADR 022](adrs/022-agent-documentation-and-architecture-review.md) |
| P020 | Agent Effectiveness Metrics and Evaluation | Accepted | [ADR 024](adrs/024-agent-effectiveness-metrics-and-evaluation.md) |
```

- [ ] **Step 2: Replace the obsolete remaining-work list**

Replace the content under `# Remaining Work` through the next horizontal rule with:

```markdown
# Implementation Status

All architectural decisions required before implementation are complete.

Use [`PHASES.md`](PHASES.md) for implementation sequence and scope. Confirm the referenced repository files before treating a planned phase or design as implemented.

---
```

- [ ] **Step 3: Verify the remainder of the decision overview is unchanged**

Run:

```bash
git diff -- docs/decisions_list.md
```

Expected: changes are limited to linked ADR corrections and the replacement of obsolete next-work guidance. The core-principles sections remain unchanged.

### Task 4: Verify Paths, Formatting, and Documentation Scope

**Files:**
- Verify: `AGENTS.md`
- Verify: `docs/README.md`
- Verify: `docs/decisions_list.md`
- Preserve: `docs/PRD.md`

- [ ] **Step 1: Confirm every newly referenced path exists**

Run:

```bash
for path in \
  app/routes/'$locale.services.tsx' \
  app/i18n/translations/services.ts \
  app/i18n/translations/index.ts \
  app/seo/metadata.ts \
  app/components/ui \
  app/components/domain \
  app/components/sections \
  app/components/site \
  app/analytics/types.ts \
  app/analytics/analytics.tsx \
  app/analytics/manager.ts \
  app/consent/consent-context.tsx \
  app/analytics/attribution.ts \
  app/components/site/consent-banner.tsx \
  app/integrations/example-contact/submit-example-contact.ts \
  app/components/domain/contact-form.tsx \
  app/routes.ts \
  app/routing/canonical-url-manifest.ts \
  react-router.config.ts \
  scripts/finalize-static-build.ts \
  app/components/domain/service-card.test.tsx \
  tests/e2e/routing.spec.ts \
  tests/e2e/fixtures.ts \
  playwright.config.ts; do
  test -e "$path" || { printf 'Missing path: %s\n' "$path"; exit 1; }
done
```

Expected: exit status `0` with no output.

- [ ] **Step 2: Confirm all ADR links target existing files**

Run:

```bash
for path in docs/adrs/{001-react-foundation,002-marketing-content-sites,003-static-build-output,004-provider-neutral-deployment,005-backend-policy,006-ai-agent-harness,007-react-router-framework,008-routing-and-static-generation,009-reuse-model,010-agent-contract,011-component-design-system-architecture,012-tailwind-theming-and-styling-model,013-content-architecture,014-localization-architecture,015-analytics-architecture,016-privacy-consent-and-lgpd,017-third-party-integration-architecture,018-configuration-and-constants,019-seo-architecture,020-images-assets-fonts-and-cache-invalidation,021-quality-toolchain-and-validation,022-agent-documentation-and-architecture-review,023-dependency-policy,024-agent-effectiveness-metrics-and-evaluation}.md; do
  test -f "$path" || { printf 'Missing ADR: %s\n' "$path"; exit 1; }
done
```

Expected: exit status `0` with no output.

- [ ] **Step 3: Confirm `docs/PRD.md` was not changed**

Run:

```bash
git diff --exit-code -- docs/PRD.md
```

Expected: exit status `0` with no diff.

- [ ] **Step 4: Format the changed documentation**

Run:

```bash
npx prettier --write AGENTS.md docs/README.md docs/decisions_list.md docs/superpowers/specs/2026-08-11-phase-12-agent-documentation-design.md docs/superpowers/plans/2026-08-11-phase-12-agent-documentation.md
```

Expected: Prettier reports the five Markdown files as formatted or unchanged.

- [ ] **Step 5: Check for whitespace errors and inspect the complete diff**

Run:

```bash
git diff --check
git diff -- AGENTS.md docs/README.md docs/decisions_list.md docs/superpowers/specs/2026-08-11-phase-12-agent-documentation-design.md docs/superpowers/plans/2026-08-11-phase-12-agent-documentation.md
```

Expected: `git diff --check` exits `0`; the diff contains only the approved design artifact, implementation plan, and three Phase 12 documentation changes.

### Task 5: Run Deterministic Validation and Architecture Review

**Files:**
- Verify only: entire repository

- [ ] **Step 1: Activate the repository Node.js version**

Run in the active shell:

```bash
source "$HOME/.nvm/nvm.sh"
nvm use
node --version
```

Expected: nvm selects the version from `.nvmrc`, and `node --version` prints `v22.22.2`.

- [ ] **Step 2: Run the canonical deterministic validation**

Run:

```bash
npm run check
```

Expected: formatting, lint, type checking, coverage, production build, and static validation all pass. Do not run Playwright because this phase changes no browser-visible behavior.

- [ ] **Step 3: Run the configured architecture-review subagent**

Provide this exact review request:

```text
Review Phase 12 agent-documentation changes only.

User request and acceptance criteria:
- Implement Phase 12 from docs/PHASES.md.
- Keep AGENTS.md concise and precise so agents preserve context.
- Create docs/README.md primarily as an index.
- Update PRD or decisions_list only for demonstrated factual inconsistencies.
- Document current capabilities without claiming future Phase 11 or Phase 13 repository files exist.

Changed files to review:
- AGENTS.md
- docs/README.md
- docs/decisions_list.md
- docs/superpowers/specs/2026-08-11-phase-12-agent-documentation-design.md
- docs/superpowers/plans/2026-08-11-phase-12-agent-documentation.md

Deterministic validation:
- npm run check: PASS
- Playwright: not run because there is no browser-visible change

Future-phase exclusion:
- Missing .github/workflows/ci.yml belongs to Phase 11 and is not a Phase 12 finding.
- Missing .opencode/agents/architecture-review.md belongs to Phase 13 and is not a Phase 12 finding.

Review for Phase 12 acceptance, ADR 010, ADR 022, ADR 023, factual accuracy, context efficiency, and unsupported implementation claims. Return structured high, medium, and low findings. High and medium findings block completion.
```

Expected: `PASS` with no high or medium findings.

- [ ] **Step 4: Resolve blocking findings and revalidate if necessary**

If the reviewer reports a high or medium finding, change only the cited documentation needed to restore Phase 12 or ADR compliance. Then rerun:

```bash
npx prettier --write AGENTS.md docs/README.md docs/decisions_list.md
npm run check
```

Rerun the same architecture-review request with the updated diff and validation result. Expected final status: `PASS` with no high or medium findings.

- [ ] **Step 5: Record final worktree status without committing**

Run:

```bash
git status --short
```

Expected: only the approved Phase 12 documentation, design, and plan files are modified or untracked. Do not stage or commit them.
