# ADR 021 — Quality Toolchain and Validation

**Status:** Accepted

## Context

The project is designed as an AI-agent harness for creating and maintaining static marketing/content websites.

A core requirement is that the repository provides deterministic, mechanical feedback so an AI coding agent can:

- detect mistakes quickly;
- validate its own changes;
- refactor when complexity grows;
- add tests when coverage drops;
- avoid committing invalid code;
- receive browser-level feedback in CI.

The project already established that agents must use a single canonical validation command before considering work complete.

Validation failures must be fixed at the root cause rather than bypassed by weakening checks.

## Decision

Adopt a conventional quality toolchain consisting of:

- Prettier;
- ESLint;
- TypeScript type checking;
- Vitest;
- React Testing Library;
- code coverage thresholds;
- cyclomatic complexity limits;
- production build validation;
- project-specific static validation;
- Playwright;
- a mandatory pre-commit hook;
- CI running the complete validation suite.

## Canonical Local Validation Command

The repository defines:

```text
npm run check
```

as the canonical local validation gate.

It should include:

```text
npm run check
  ├── format:check
  ├── lint
  ├── typecheck
  ├── test
  ├── coverage
  ├── complexity
  ├── build
  └── validate:static
```

The exact npm script composition may evolve, but these capabilities remain part of the local validation contract.

## Playwright Exclusion from Local Check

Playwright E2E tests are intentionally not part of:

```text
npm run check
```

This keeps the normal development and commit loop reasonably fast.

Browser-level tests remain mandatory, but are executed by CI as part of the complete validation suite.

## Pre-Commit Hook

A pre-commit hook is mandatory.

The hook runs the same canonical command:

```bash
npm run check
```

The project must not maintain a weaker, separate validation definition for pre-commit.

This ensures the following invariant:

> code that cannot pass the canonical local quality gate should not be committed normally.

## Purpose of the Pre-Commit Hook

The hook exists primarily to prevent developers and AI coding agents from committing code that has not been validated.

It catches issues such as:

- formatting violations;
- lint failures;
- type errors;
- unit or component test failures;
- insufficient coverage;
- excessive cyclomatic complexity;
- production build failures;
- static-site invariant failures.

## Hook Bypass

The existence of Git-level bypass mechanisms does not make bypassing the validation gate an accepted workflow.

Agents must not use mechanisms such as:

```text
--no-verify
```

simply to commit failing code.

A validation failure must be fixed rather than suppressed.

## CI

The base template includes CI configuration.

CI runs the complete validation suite:

```text
CI
  ├── npm run check
  └── npm run test:e2e
```

`npm run check` remains the shared baseline rather than reimplementing each check independently in CI.

## Formatter

Use Prettier for deterministic formatting.

The validation pipeline checks formatting rather than automatically modifying code during validation.

A separate formatting command may exist for local fixes.

Conceptually:

```text
npm run format
npm run format:check
```

## Linting

Use ESLint.

Linting is responsible for normal JavaScript/TypeScript/React correctness and maintainability rules as well as project rules that can be expressed reliably without excessive custom infrastructure.

Agents must not disable lint rules merely to make a change pass validation.

## Type Checking

Use TypeScript as a mandatory correctness gate.

The validation command must perform type checking without emitting production artifacts.

The exact command may use `tsc --noEmit` or the appropriate framework-compatible equivalent.

## Unit Tests

Use Vitest as the primary unit-test runner.

Unit tests should focus on logic that can be validated quickly and deterministically without a real browser.

## Component Tests

Use React Testing Library when React component behavior benefits from DOM-level interaction testing without requiring a full browser.

Not every component requires a dedicated component test.

Tests should target meaningful behavior rather than implementation details.

## Code Coverage

Code coverage is mandatory.

Coverage exists not only as a reporting metric but as a mechanical pressure encouraging agents to add tests when they introduce new logic.

The initial global thresholds are:

```text
Statements: 80%
Branches:   75%
Functions:  80%
Lines:      80%
```

## Coverage Philosophy

Coverage thresholds are intended to prevent large amounts of untested behavior from accumulating.

They are not a guarantee of test quality.

The project accepts that some code may legitimately remain uncovered while still satisfying the global threshold.

## Coverage Bypass Policy

Agents must not resolve a coverage failure by:

- lowering the configured threshold;
- excluding newly added source files without justification;
- adding broad coverage-ignore directives;
- disabling coverage collection;
- rewriting configuration solely to make the metric pass.

The expected response to a coverage failure is normally to improve tests or simplify the implementation.

## Coverage Threshold Evolution

Individual forks may later change thresholds based on demonstrated project needs.

However, an agent must not lower them opportunistically merely because its current change fails.

A material change to the template's quality policy should be documented architecturally.

## Cyclomatic Complexity

Cyclomatic complexity is mechanically limited.

Use ESLint's complexity rule or an equivalent lightweight static check.

The initial maximum cyclomatic complexity per function is:

```text
10
```

## Purpose of Complexity Limits

The complexity limit provides deterministic feedback when a function accumulates too many execution branches.

This creates pressure for an AI agent to reconsider and refactor overly complicated functions.

Conceptually:

```text
function becomes too complex
        ↓
lint / complexity failure
        ↓
agent reevaluates structure
        ↓
refactor
```

This complements test coverage:

```text
coverage
→ "Did I test this?"

complexity
→ "Should this be simpler?"
```

## Complexity Is a Signal

Cyclomatic complexity is not treated as a complete measure of architectural quality.

Agents must not mechanically split a function into many meaningless helpers merely to lower the numeric score.

The objective is improved clarity and maintainability, not metric gaming.

## Production Build

A production build is part of `npm run check`.

This validates that:

- React Router can build the application;
- static prerendering succeeds;
- asset generation succeeds;
- production-only errors are caught;
- build-time localization and route generation remain valid.

A development server working successfully is not sufficient evidence of correctness.

## Static Validation

The local quality gate includes project-specific static validation.

This validator checks architectural invariants established by other ADRs.

Examples include:

- every public route is prerendered;
- canonical URL manifest completeness;
- localized page completeness;
- internal links point to valid routes;
- locale prefixes are valid;
- SEO metadata is complete;
- canonical URLs are valid;
- `hreflang` targets exist;
- sitemap consistency;
- `<html lang>` correctness;
- static deployment assumptions;
- other deterministic project invariants.

## Playwright

Playwright is mandatory.

It serves two distinct purposes:

1. browser-level regression testing;
2. browser-level feedback for AI coding agents.

Playwright is therefore considered part of the agent harness rather than merely an optional E2E testing tool.

## Playwright Location in the Feedback Loop

The normal workflow is:

```text
agent edits code
      ↓
npm run check
      ↓
commit
      ↓
pre-commit validates
      ↓
CI
      ↓
Playwright runs real browser tests
      ↓
failure artifacts provide feedback
```

This separates the faster local loop from the more complete browser validation loop.

## Browser Matrix

The base template runs Playwright using:

```text
Chromium only
```

by default.

Firefox and WebKit are not part of the initial mandatory CI matrix.

A fork may expand browser coverage if its audience or requirements justify the additional cost.

## Headless Execution

Playwright runs headless by default.

This applies to CI and the normal automated agent feedback loop.

Headless operation still provides:

- assertions;
- DOM inspection;
- network behavior;
- console output;
- runtime exceptions;
- screenshots;
- traces;
- videos when configured.

A visible browser is not required for Playwright to provide useful agent feedback.

## Failure Artifacts

The Playwright configuration should retain useful failure evidence.

Recommended behavior:

```ts
use: {
  headless: true,
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

The exact configuration syntax may follow the installed Playwright version.

## Interactive Debugging

The repository should also expose an optional interactive browser-testing command.

Conceptually:

```text
npm run test:e2e
npm run test:e2e:ui
```

The first is suitable for automation.

The second allows interactive investigation of difficult failures.

Headed/debug modes remain development tools rather than mandatory validation behavior.

## Browser Console Errors

The Playwright test infrastructure should detect unexpected browser runtime errors.

Reusable test infrastructure should fail on unexpected:

```text
console.error
pageerror
```

unless the specific test intentionally expects the error.

This catches failures that may not otherwise violate a page assertion.

## Initial Playwright Coverage

The template should include a small number of high-value browser tests demonstrating the intended quality model.

Examples include:

- homepage renders;
- localized routes render;
- internal navigation works;
- language switching works;
- light/dark theme switching works;
- consent flow works;
- analytics does not execute before required consent;
- no unexpected console errors occur.

Each fork extends this with its actual business journeys.

For a lead-generation website, examples may include:

- contact form interaction;
- lead submission success state;
- validation errors;
- CTA navigation.

## Accessibility

Accessibility checks may be integrated into Playwright where they provide reliable deterministic feedback.

Automated accessibility testing is complementary to semantic components and human review.

The project should prioritize objective violations that can be detected consistently rather than attempt to automate all accessibility judgment.

## No Coverage-Driven Test Inflation

The project does not treat the coverage threshold as a target that must be maximized.

Agents should prefer meaningful tests covering behavior and logic.

Tests created solely to execute lines without validating useful behavior are discouraged.

## No Mandatory 100% Coverage

The base template deliberately does not require 100% coverage.

A 100% target often creates disproportionate maintenance cost and encourages low-value tests.

The accepted initial thresholds balance enforcement and usability.

## Test Isolation

Unit and component tests must not rely on real third-party network services.

External integrations should be mocked at an appropriate module or network boundary.

Playwright tests may use controlled test environments or provider test endpoints where a fork genuinely requires real integration testing.

## Agent Completion Contract

Before declaring a development task complete, an AI agent must run:

```text
npm run check
```

and resolve any failures.

When CI or the available workflow runs Playwright and reports failures, the agent must use those browser-level results and artifacts as additional feedback.

## Validation Failure Policy

Agents must fix root causes.

They must not make validation pass by:

- weakening ESLint;
- lowering complexity thresholds;
- lowering coverage thresholds;
- excluding source files without justification;
- broadly suppressing TypeScript errors;
- disabling failing tests;
- removing static validation;
- bypassing Git hooks.

If a project requirement genuinely conflicts with an established invariant, the architectural exception process applies.

## Rationale

The toolchain deliberately combines several complementary feedback mechanisms:

```text
Prettier
→ deterministic source formatting

ESLint
→ code correctness and maintainability

TypeScript
→ structural/type correctness

Vitest
→ fast logic verification

Coverage
→ pressure to test new behavior

Complexity
→ pressure to simplify difficult functions

Production build
→ build/static-generation correctness

Static validation
→ project architecture correctness

Playwright
→ real browser behavior
```

No individual metric is treated as sufficient.

Together they create a deterministic development environment particularly well suited to AI coding agents.

## Consequences

### Positive

- Agents receive fast local feedback.
- Invalid code is difficult to commit accidentally.
- New logic creates pressure for corresponding tests.
- Excessively complex functions produce actionable failures.
- Production build regressions are caught before merge.
- Browser behavior is validated in CI.
- Playwright supplies traces and screenshots for agent debugging.
- The same `npm run check` contract applies locally, pre-commit, and in CI.
- Quality requirements do not depend entirely on human review.

### Negative

- Pre-commit is slower because it runs the full local check.
- Coverage thresholds may occasionally encourage unnecessary testing.
- Complexity limits may sometimes require judgment to refactor well.
- CI is slower because it includes browser tests.
- Chromium-only testing does not guarantee identical behavior in Firefox or Safari/WebKit.
- Automated checks cannot guarantee overall software quality.

These costs are accepted because deterministic feedback is a core product feature of the AI-agent harness.

## Rejected Alternatives

### Playwright in Every Pre-Commit

Rejected because real-browser tests would make the local commit loop unnecessarily slow.

### No E2E Tests in the Base Template

Rejected because browser-level validation is a critical agent feedback mechanism.

### Three-Browser CI by Default

Rejected because the execution cost is not justified for the base marketing-site harness.

### Headed Browser as Default

Rejected because headless mode provides the required automated feedback with lower operational overhead.

### No Coverage Threshold

Rejected because agents could add substantial untested logic while existing tests continue to pass.

### 100% Coverage

Rejected because it encourages disproportionate testing and metric gaming.

### No Complexity Limit

Rejected because deterministic complexity feedback helps agents identify refactoring opportunities.

### Separate Weak Pre-Commit Validation

Rejected because it would create multiple definitions of what constitutes valid code.

### Coverage or Complexity Exceptions as Routine Fixes

Rejected because they undermine the purpose of the quality gate.

## Future Evolution

Individual forks may later add:

- Firefox and WebKit CI;
- visual regression testing;
- performance budgets;
- mutation testing;
- stricter accessibility testing;
- per-directory coverage policies;
- additional static-analysis tools.

Such additions should be driven by demonstrated requirements rather than included speculatively in the base template.
