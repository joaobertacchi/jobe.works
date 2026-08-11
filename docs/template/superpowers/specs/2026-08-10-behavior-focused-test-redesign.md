# Behavior-Focused Test Redesign

## Purpose

Redesign the test suite around expected behavior, product risks, and architectural invariants instead of internal implementation details. The redesign may substantially reduce the number of tests when stronger coverage already exists elsewhere, but it must preserve or improve confidence in the requirements defined by `docs/template/PRD.md` and the accepted ADRs.

This work includes the full suite rather than only mechanically replacing a few brittle assertions. It may include minimal production changes when a behavior-first failing test exposes a real defect or an inadequate public boundary.

Visual regression testing is outside this redesign. A later discussion may add a `PHASES.md` phase for Storybook or equivalent visual tests. Until then, UI primitive tests may retain a small number of stable design-token assertions.

## Goals

- Assign each required behavior to one authoritative test layer.
- Remove tests coupled to source text, exact class strings or ordering, incidental DOM structure, React scheduling, or other private implementation choices.
- Eliminate duplicated exhaustive matrices when a cheaper, more accurate layer already owns the behavior.
- Preserve the existing coverage thresholds and quality gates without adding tests solely to execute lines.
- Add missing high-risk behavior coverage discovered during the redesign.
- Make harmless refactors less likely to break unrelated tests.
- Document the testing policy so future agents follow the same model.

## Non-Goals

- Introducing Storybook, screenshot comparison, or another visual testing platform.
- Raising or lowering coverage thresholds.
- Rewriting production architecture solely to simplify tests.
- Testing React Router, browser, or third-party provider internals.
- Requiring every deleted test to have a one-for-one replacement.
- Maximizing test count or coverage percentage.

## Test Architecture

Required behaviors have one primary owner. Another layer may contain a small smoke check when it catches a distinct integration risk, but it must not repeat the full behavior matrix.

### Type Checking

Type checking owns compile-time contracts such as:

- localization dictionary completeness;
- valid translation keys;
- typed analytics event payloads;
- generated React Router route types.

Runtime tests must not duplicate exhaustive compile-time shape checks.

### Vitest Unit Tests

Unit tests own deterministic transformations and policy decisions that do not require React or a real browser, including:

- locale and pathname parsing;
- canonical URL manifest generation and validation;
- metadata construction;
- consent parsing and persistence rules;
- analytics eligibility and attribution parsing;
- static artifact validation against synthetic fixtures.

These tests should use representative positive cases and table-driven boundary or negative cases where appropriate.

### React Testing Library

Component and provider tests own observable behavior that requires React, DOM interaction, context, or in-memory routing, including:

- accessible names, roles, and interaction;
- public prop forwarding and documented variants;
- provider state transitions;
- route navigation outcomes;
- localized output selection;
- analytics dispatch resulting from navigation or consent changes.

Tests query through accessible roles and visible behavior whenever possible. Test IDs and CSS selectors are reserved for cases where the selected structure is itself a documented contract.

### Static Build Contracts

Static validation is the authoritative exhaustive layer for the generated product. It owns:

- complete and exact prerendered route inventory;
- locale directory and `<html lang>` correctness;
- no SPA fallback or runtime server dependency;
- valid internal links;
- canonical and alternate metadata consistency;
- sitemap and robots consistency;
- required SEO and social metadata.

Fast synthetic-fixture tests prove individual validator failure modes. A real production build proves integration with React Router and the final generated artifacts.

### Playwright

Playwright owns representative behavior requiring a browser, including:

- hydration and client-side navigation;
- browser language selection;
- real HTTP status behavior;
- local storage and reload behavior;
- consent boundaries and withdrawal;
- browser runtime and console errors;
- theme behavior before first paint;
- focus, responsive layout, and network behavior where relevant.

Playwright must not repeat every route and locale when static validation already proves the exhaustive matrix.

## Test Classification

Every existing test is classified as one of:

- **Keep:** directly proves a PRD or ADR behavior through an appropriate public boundary.
- **Rewrite:** protects important behavior but currently relies on private implementation details.
- **Move:** protects important behavior at an unnecessarily expensive or inaccurate layer.
- **Delete:** duplicates stronger coverage or protects no explicit behavior.

The classification must identify the requirement or risk protected by every retained or rewritten test. Test count may drop substantially when confidence is maintained by stronger contracts.

## Assertion Rules

### Source Inspection

Tests must not read TSX source to require imports, hook names, translation calls, or other implementation choices. Replace these checks with one of:

- rendered behavior;
- an exported public contract;
- a deterministic static validator or lint rule when the source restriction is itself architectural;
- deletion when another layer already proves the requirement.

Static artifact tests may read generated files because those files are the product contract. Focused CSS token checks may read CSS until visual testing is introduced, but only when the exact token is an intentional public design decision.

### DOM And Component Structure

Tests should assert semantic elements, accessible roles, public props, user interaction, and visible state. They should not depend on incidental wrapper depth, private child ordering, React element objects, or selectors chosen only because the current markup makes them convenient.

DOM structure may be asserted when semantics or layout composition are explicitly part of a component's public contract, such as rendering a `section`, forwarding a heading level, or placing navigation controls in an accessible landmark.

### Styling

Complete class strings and class ordering are private implementation details. UI primitive tests may assert a small number of stable token classes individually when those tokens define documented variants, states, spacing constraints, or minimum target sizes.

Page and section tests should normally avoid utility-class assertions. Responsive layout and first-paint behavior belong in representative Playwright tests until dedicated visual testing exists.

### Copy And Localization

Tests should not repeat complete marketing copy across dictionaries, route tests, and Playwright. Exact text is appropriate when verifying locale selection, an accessible name, required legal language, or a specific error contract. Otherwise tests should use representative text or semantic roles.

Type checking owns dictionary completeness. Static validation owns page and metadata completeness. Browser tests use representative locales and pages.

### Effects And Lifecycle

Tests assert observable outcomes of effects, such as applied theme, persisted consent, emitted page view, or removed behavior after unmount. They should not assert listener counts, cleanup call order, same-turn scheduling, or Strict Mode bookkeeping unless the assertion preserves a documented regression that cannot be expressed through behavior.

### Mocks

Mocks are used only at external or architectural boundaries, such as tracker adapters, storage failures, browser APIs unavailable in jsdom, or controlled network behavior. Tests must assert the application's behavior, not merely that a mock was invoked according to the current call graph.

## Migration Slices

### 1. Testing Policy

Update ADR 021 with the classification and assertion rules. This makes the suite redesign enforceable guidance for future agents rather than a one-time cleanup.

### 2. Routes And Root

Remove TSX source inspection and private React-element traversal. Preserve observable contracts for locale redirects, document language, pre-paint theme initialization, provider composition, child-route rendering, and localized errors.

### 3. UI Components

Consolidate primitive, domain, section, and site-component tests around semantics, native-prop forwarding, interaction, accessibility, and key stable variant tokens. Delete exact class ordering, broad utility-class inventories, and incidental wrapper assertions.

### 4. Localization, SEO, And Static Output

Remove repeated copy and route matrices from component and browser tests. Preserve exhaustive type and generated-artifact contracts. Add direct synthetic regression cases for physically missing required HTML artifacts and unexpected generated HTML artifacts.

### 5. Theme Lifecycle

Retain user choice, system preference, persistence, initial paint, and hydration outcomes. Remove lifecycle and listener bookkeeping unless it corresponds to a documented historical regression with no behavior-level expression.

### 6. Consent And Analytics

Retain consent defaults, user choices, persistence, integration eligibility, navigation events, and provider failure isolation. Add behavior coverage for:

- withdrawing analytics consent and observing no subsequent tracking;
- enabling a second consent category without duplicating a page view for trackers already eligible.

Minimal production fixes are permitted only after these behavior tests fail for the expected reason.

### 7. E2E And Tooling Consolidation

Keep representative browser journeys and global console/page-error enforcement. Derive basic smoke inputs from the canonical route source when this removes manual drift without coupling Playwright to private build internals. Add CI protection against committed focused tests. Configure the canonical local check to avoid executing the complete Vitest suite twice while retaining coverage enforcement.

### 8. Final Audit

Search the suite for:

- source-file inspection;
- complete class-string equality or ordering;
- incidental CSS selectors and wrapper traversal;
- direct React element-object inspection;
- internal listener, scheduling, or effect bookkeeping;
- duplicate exhaustive route, locale, metadata, and copy matrices.

Every remaining occurrence must protect a documented public contract and be understandable from the test name and assertion without reading the implementation.

## Test-Driven Migration

Behavior changes and production fixes follow red-green-refactor:

1. Add or rewrite one test expressing the expected behavior.
2. Run it and confirm it fails for the intended missing or defective behavior.
3. Make the minimal production change required.
4. Run the focused test and its subsystem suite.
5. Refactor only after the tests pass.

Pure deletion or replacement of brittle tests does not require changing production behavior. Before relying on a replacement test, demonstrate that it detects the intended regression, preferably by temporarily mutating or reverting the relevant behavior, run the test to observe the expected failure, then restore the production behavior. Temporary mutations are never committed.

## Verification

Each migration slice runs its focused Vitest or Playwright tests before broader validation. Before completion:

1. Activate the Node.js version declared by `.nvmrc`.
2. Run `npm run check`.
3. Run `npm run test:e2e`.
4. Run the final implementation-detail audit.
5. Confirm coverage thresholds remain unchanged and pass.
6. Confirm no unexpected warnings, browser console errors, or page errors remain.

## Success Criteria

- No test reads TSX source to require internal imports, hooks, or translation calls.
- No test compares a complete utility-class string or depends on class ordering.
- Remaining UI token assertions are small, stable, and tied to documented public variants or constraints.
- Incidental wrapper depth and private React element structure are not tested.
- Internal lifecycle bookkeeping is removed unless justified by a documented regression.
- Exhaustive route, locale, link, and SEO matrices are owned by type checking or static build validation rather than repeated in Playwright.
- Consent withdrawal prevents subsequent analytics behavior in a browser journey.
- Enabling a second consent category does not duplicate page views for already-eligible trackers.
- Missing and unexpected generated HTML artifacts have direct regression tests.
- Coverage thresholds remain at statements 80%, branches 75%, functions 80%, and lines 80%.
- `npm run check` and `npm run test:e2e` pass using the `.nvmrc` Node.js version.
