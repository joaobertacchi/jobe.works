# PROMPT.md — Phased Implementation of the AI-Agent Static Website Template

You are implementing this repository as the reusable AI-agent static website template defined by:

- `docs/PRD.md`
- `docs/decisions_list.md`
- all accepted ADRs under `docs/adrs/`
- `AGENTS.md`, once created

These documents are authoritative.

Do not redesign the architecture based on personal preference.

If an implementation detail is not explicitly defined, choose the simplest solution consistent with the existing decisions, ecosystem conventions, and the goal of keeping the repository easy for AI agents to understand.

Do not introduce speculative abstractions.

Do not weaken validation to make implementation easier.

Do not add a backend or server runtime unless explicitly authorized.

---

# Objective

Implement the template incrementally until the repository provides a complete, production-quality harness that an AI coding agent can fork and use to create localized static marketing/content websites.

The result should demonstrate the architecture through working code rather than through excessive documentation.

---

# Implementation Strategy

Work in phases.

For each phase:

1. Read the relevant ADRs before implementation.
2. Inspect the current repository state.
3. Implement only the scope of the current phase.
4. Add or update tests for the behavior introduced.
5. Run the validation available at that stage.
6. Fix all failures before continuing.
7. Review the implementation against the relevant ADRs.
8. Commit the phase as a coherent unit when appropriate.

Do not postpone known architectural violations to later phases.

Prefer a working vertical slice over large amounts of disconnected scaffolding.

---

# Phase 0 — Repository and Toolchain Foundation

Establish the minimum project foundation.

Implement:

- React Router Framework project;
- TypeScript;
- Tailwind CSS;
- ESLint;
- Prettier;
- Vitest;
- React Testing Library;
- Playwright;
- pre-commit hook infrastructure;
- basic npm scripts.

Create the initial directory structure required by the ADRs without over-creating unused folders.

Establish at least:

```text
app/
docs/
```

and add architectural directories only as they become needed by subsequent phases.

Create the first form of:

```text
npm run check
```

with the checks that are meaningful at this stage.

Do not implement the complete static validator yet unless required by the initial framework setup.

## Phase 0 validation

At minimum verify:

- project installs successfully;
- type checking passes;
- lint passes;
- formatting passes;
- unit test runner works;
- production build works;
- Playwright can launch Chromium headlessly.

---

# Phase 1 — Static Routing and Prerendering Foundation

Implement the routing and static-generation architecture.

Implement:

- React Router Framework static configuration;
- filesystem-based route conventions;
- locale-prefixed public routes;
- initial locales:
  - `en`
  - `pt-BR`
- root `/` locale detection and redirect;
- unsupported locale behavior;
- localized 404 structure;
- prerendering of all known public routes;
- no public route dependency on SPA fallback.

Create placeholder pages sufficient to demonstrate routing.

Do not add real business content.

Introduce the canonical URL manifest model.

The manifest should become the source for concrete published URLs.

## Phase 1 validation

Verify:

- `/en/...` and `/pt-BR/...` routes are prerendered;
- unsupported locale routes are not published;
- missing localized pages fail validation;
- public routes do not depend on SPA fallback;
- production build emits expected nested static HTML output.

---

# Phase 2 — Localization Architecture

Implement the localization system defined by the ADRs.

Implement:

- rich typed central locale configuration;
- `pt-BR` as default locale;
- page/feature-scoped TypeScript dictionaries;
- exhaustive locale registry;
- typed translation paths;
- plural support using:
  - `zero`
  - `one`
  - `other`
- locale-bound translator/context;
- `useI18n()`;
- client-side availability after hydration;
- `<html lang>` derived from route locale;
- language switcher preserving the logical route;
- no locale persistence.

Avoid mutable global locale state.

Add placeholder translated content to the sample pages.

## Phase 2 validation

Verify:

- invalid translation keys fail type checking;
- missing locale dictionaries fail;
- missing localized copy fails;
- both locales prerender correctly;
- language switcher preserves page identity;
- `<html lang>` matches route locale.

---

# Phase 3 — Component and Styling Foundation

Implement the component architecture and theme model.

Create the component layers defined by the ADRs:

```text
app/components/
  ui/
  domain/
  sections/
  site/
```

Do not fill these directories with speculative components.

Create only enough representative components to demonstrate the intended architecture.

Include useful examples such as:

- `Button`;
- `Heading`;
- `Text`;
- `Card`;
- layout/composition example;
- site header/navigation;
- language switcher;
- theme switcher.

Implement:

- Tailwind-based styling;
- standard Tailwind scales by default;
- small semantic color token layer;
- CSS custom properties for theme-sensitive values;
- light theme;
- dark theme;
- system preference;
- pre-hydration theme initialization to avoid incorrect-theme flash.

Use direct `<img>` where images are needed.

## Phase 3 validation

Verify:

- light mode works;
- dark mode works;
- system mode works;
- theme persists according to the accepted theme behavior;
- no visible incorrect-theme flash in normal browser tests;
- components demonstrate semantic variants without over-abstracting Tailwind.

---

# Phase 4 — Example Pages as Agent Documentation

Build a small set of polished placeholder pages that demonstrate the correct architecture.

The examples should act as local training material for future AI agents.

At minimum include:

- homepage;
- secondary marketing/content page;
- privacy page;
- localized 404 page.

Each example should demonstrate, where relevant:

- typed i18n;
- route conventions;
- sections;
- design-system primitives;
- Tailwind layout;
- responsive behavior;
- explicit SEO metadata;
- light/dark support;
- accessible semantic HTML.

Keep the pages generic and clearly replaceable by forks.

Do not create a large demo website.

The objective is to teach patterns.

---

# Phase 5 — SEO Infrastructure

Implement the SEO architecture.

Implement:

- explicit localized title and description per public page;
- React Router-native metadata handling;
- canonical URLs from canonical URL manifest;
- localized `hreflang`;
- optional `x-default`;
- sitemap generation;
- `robots.txt`;
- indexability support;
- `noindex` behavior;
- default Open Graph metadata;
- default social image support;
- optional page-level social image override;
- minimal Twitter/X metadata;
- explicit page-level JSON-LD support.

Do not introduce a custom SEO framework.

## Phase 5 validation

Create deterministic validation for:

- missing localized title;
- missing localized description;
- invalid canonical;
- duplicate canonical;
- invalid `hreflang`;
- missing localized sibling;
- incorrect `<html lang>`;
- sitemap inconsistency;
- `noindex` page included in sitemap;
- broken internal links;
- invalid locale-prefixed links.

Integrate these checks into `npm run check`.

---

# Phase 6 — Analytics Foundation

Implement the centralized analytics architecture.

Create:

- typed analytics event union;
- `Tracker` contract;
- centralized tracker execution;
- `useAnalytics()`;
- optional provider registration;
- development console tracker;
- automatic page-view handling;
- provider failure isolation.

Add only a minimal example event taxonomy suitable for the template, such as:

- `cta_pressed`;
- `lead_submitted`.

Do not create a large generic taxonomy.

Add representative provider adapters only if necessary to demonstrate the architecture.

Do not make an external analytics provider mandatory.

## Phase 6 validation

Verify:

- invalid event names fail type checking;
- incorrect event payloads fail type checking;
- one failing tracker does not break another tracker;
- analytics failure does not break application behavior;
- route navigation triggers expected page-view behavior.

---

# Phase 7 — Consent, Privacy, and Attribution

Implement the privacy architecture.

Create centralized consent handling for:

```text
necessary
analytics
marketing
```

Implement:

- analytics and marketing disabled by default;
- accept all;
- reject non-essential;
- customize;
- versioned persisted consent;
- ability to reopen cookie settings;
- withdrawal/change of consent;
- tracker eligibility based on consent category;
- no direct provider consent logic in page components.

Implement campaign parsing for the approved UTM allowlist:

```text
utm_source
utm_medium
utm_campaign
utm_id
utm_term
utm_content
```

Keep attribution in memory by default.

Do not automatically collect arbitrary query parameters.

Create localized privacy-page placeholder content sufficient to show where fork-specific legal text belongs.

Create a sample contact-form privacy notice pattern.

## Phase 7 validation

Verify:

- analytics tracker does not run before analytics consent;
- marketing tracker does not run before marketing consent;
- reject non-essential keeps both disabled;
- changing consent changes tracker eligibility;
- consent version is respected;
- cookie settings remain accessible after dismissal;
- campaign parser ignores unknown parameters.

Use Playwright tests where browser behavior is required.

---

# Phase 8 — Third-Party Integration Example

Implement one representative browser-safe third-party integration pattern.

The purpose is to demonstrate architecture, not prescribe a specific provider.

Follow the integration ADR:

- centralize provider-specific code;
- do not create a generic provider interface without need;
- treat client-visible environment variables as public;
- do not introduce secrets;
- do not create a backend.

A contact/lead form is the preferred example because it exercises:

- form state;
- validation;
- privacy notice;
- analytics;
- campaign attribution;
- third-party integration;
- error handling.

Use a mock/example provider if necessary to keep the base template provider-neutral.

Do not require credentials for the repository to build or test.

## Phase 8 validation

Verify:

- form validates;
- success behavior works;
- failure behavior is usable;
- external integration can be mocked;
- site does not globally fail if provider call fails;
- analytics event is emitted only according to consent rules;
- campaign attribution is only attached from the allowlisted model.

---

# Phase 9 — Assets, Fonts, and Production Build Behavior

Implement representative asset handling.

Use:

```text
app/assets/
  images/
  fonts/
  icons/
```

only where actual examples require them.

Demonstrate:

- imported image through Vite;
- content-hashed production asset;
- stable `public/` asset only where stable URL is intentional;
- direct `<img>`;
- default system font stack;
- optional self-hosted font example only if necessary.

Do not add image optimization infrastructure.

Validate that the production build behaves correctly with hashed assets.

Document cache expectations briefly where needed, but do not turn deployment into template scope.

---

# Phase 10 — Complete Quality Gate

Finalize the quality tooling.

Ensure `npm run check` includes:

```text
format:check
lint
typecheck
test
coverage
complexity
build
validate:static
```

Use the accepted thresholds:

```text
Statements: 80%
Branches:   75%
Functions:  80%
Lines:      80%
```

Maximum cyclomatic complexity:

```text
10
```

Configure the pre-commit hook to run exactly:

```bash
npm run check
```

Do not include Playwright in the pre-commit hook.

Agents must not bypass checks or lower thresholds to make code pass.

---

# Phase 11 — Complete Playwright and CI Feedback Loop

Finalize Playwright as the browser-level agent feedback system.

Configure:

- Chromium only;
- headless by default;
- trace retained on failure;
- screenshot on failure;
- video retained on failure;
- unexpected `console.error` failure;
- unexpected `pageerror` failure.

Provide:

```bash
npm run test:e2e
npm run test:e2e:ui
```

CI must run:

```text
npm run check
+
npm run test:e2e
```

Include browser tests for representative infrastructure behavior:

- homepage renders;
- localized routes work;
- language switch works;
- theme switching works;
- consent behavior works;
- navigation works;
- privacy page renders;
- no unexpected browser runtime errors.

Avoid creating excessive E2E coverage for placeholder content.

---

# Phase 12 — Agent Documentation

Create the agent-facing repository documentation.

Implement:

```text
AGENTS.md
docs/README.md
```

Update:

```text
docs/PRD.md
docs/decisions_list.md
```

only if implementation reveals factual inconsistencies.

`AGENTS.md` must remain concise.

It should explain:

- project purpose;
- core invariants;
- where code belongs;
- how to add pages;
- localization expectations;
- component reuse;
- analytics/integration rules;
- dependency decision policy;
- validation requirements;
- ADR usage;
- architecture-review requirement.

Do not reproduce full ADR content.

`docs/README.md` should primarily act as an index.

---

# Phase 13 — Architecture Review Subagent

Define the dedicated architecture-review subagent described by ADR 022.

Its review contract must prioritize:

1. user request / acceptance criteria;
2. `AGENTS.md`;
3. relevant accepted ADRs;
4. existing examples and conventions;
5. deterministic validation results.

It must review for:

- ADR compliance;
- architectural consistency;
- speculative abstraction;
- reuse of existing patterns;
- conceptual-surface growth;
- dependency justification;
- static-site assumptions;
- localization;
- SEO;
- analytics/privacy boundaries;
- integration boundaries;
- design-system consistency.

It must not:

- reopen accepted architecture based on preference;
- duplicate ordinary lint/style feedback;
- recommend speculative abstractions;
- propose changes contrary to accepted ADRs.

Output should be structured and use:

```text
high
medium
low
```

High and medium findings are blocking.

Low findings are advisory.

---

# Phase 14 — Final Repository Self-Review

After all implementation phases:

1. Run:

```bash
npm run check
```

2. Run:

```bash
npm run test:e2e
```

3. Run the architecture-review subagent against the repository as a whole.

4. Fix all high and medium findings.

5. Re-run all deterministic validation after changes.

6. Review every accepted ADR and verify there is a corresponding implementation or an intentional non-code decision.

7. Remove:
   - unused scaffolding;
   - unused dependencies;
   - placeholder abstractions that proved unnecessary;
   - duplicated examples;
   - implementation artifacts not useful to forks.

8. Ensure the repository remains small and understandable.

---

# Phase 15 — Implementation Completion Report

Produce a final report containing:

## Implemented architecture

Map major repository capabilities to their ADRs.

## Validation status

Report:

```text
npm run check
Playwright
architecture review
```

## Deviations

List any accepted decision that could not be implemented exactly.

Do not silently diverge from ADRs.

## Deferred items

List only concrete items intentionally deferred.

Do not create speculative future-work lists.

## Repository usage

Provide a concise statement describing how a developer or AI agent should begin working from the finished template.

---

# General Implementation Rules

Throughout all phases:

- Prefer existing framework/ecosystem capabilities before writing custom infrastructure.
- Before adding a dependency, perform the build-vs-buy analysis required by the dependency ADR.
- Major architectural dependencies require approval and a new ADR.
- Do not create generic abstractions without a demonstrated need.
- Do not introduce new configuration systems unless required.
- Keep localized copy out of TSX.
- Keep analytics provider code inside analytics infrastructure.
- Keep third-party provider code centralized.
- Never expose secrets in static frontend code.
- Do not add runtime server dependencies.
- Keep examples representative but minimal.
- Treat browser-visible environment variables as public.
- Prefer local working examples over additional procedural documentation.
- Fix root causes instead of suppressing validation.
- Preserve the project's conceptual simplicity.

---

# Scope Control

Do not implement capabilities merely because they are common in other templates.

Specifically, do not add unless required by an accepted ADR or an actual implementation need:

- CMS;
- Markdown/MDX;
- blog infrastructure;
- global state library;
- generic API layer;
- generic repository/service pattern;
- component generator;
- CLI scaffolding;
- server runtime;
- database;
- authentication;
- image optimization service;
- deployment-provider integration;
- multi-brand theming;
- multiple test runners;
- redundant libraries.

The template should finish with the smallest architecture that fully implements the accepted decisions.

---

# Completion Condition

The template implementation is complete only when:

```text
all planned phases are implemented

AND

npm run check passes

AND

Playwright passes

AND

the architecture-review subagent has no high or medium findings

AND

the implementation is consistent with the PRD and accepted ADRs
```

Do not declare completion earlier.
