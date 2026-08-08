# ADR 022 — Agent Documentation and Architecture Review Model

**Status:** Accepted

## Context

This project is designed as an AI-agent harness for creating and maintaining static marketing/content websites.

The objective is not only to produce working code, but to create an environment where AI agents can reliably:

- understand project conventions;
- make changes consistent with architectural decisions;
- receive deterministic feedback;
- avoid unnecessary complexity;
- preserve maintainability as the codebase evolves.

AI agents are particularly effective when the repository provides:

- clear instructions;
- representative examples;
- typed contracts;
- automated validation;
- explicit architectural decisions.

However, not every architectural concern can be enforced mechanically.

Examples:

- whether an abstraction is premature;
- whether an existing component should have been reused;
- whether a new concept increases unnecessary complexity;
- whether implementation follows the spirit of an ADR;
- whether a change makes future agent work harder.

Therefore, the project uses two complementary mechanisms:

1. deterministic validation;
2. architecture review by a dedicated AI review subagent.

## Decision

Adopt the following agent operating model:

```text
AGENTS.md
    ↓
existing examples
    ↓
ADRs
    ↓
implementation
    ↓
npm run check
    ↓
architecture-review subagent
    ↓
final validation
```

Each layer has a different purpose.

## Repository Documentation Structure

The repository should contain:

```text
AGENTS.md

docs/
  README.md
  PRD.md
  decisions_list.md

  adrs/
    ...
```

## AGENTS.md

`AGENTS.md` is the operational contract for AI agents.

It must remain concise.

Its purpose is to answer:

- what is this project?
- what are the important invariants?
- where should code be placed?
- how are common tasks performed?
- what validation must run?
- where should deeper architectural information be found?

It should not contain the complete rationale behind every architectural decision.

Detailed reasoning belongs in ADRs.

## AGENTS.md Required Content

The root instructions should communicate rules such as:

- this is a static React Router Framework website;
- public pages are localized and prerendered;
- page copy belongs in typed localization dictionaries;
- SEO metadata is explicit;
- existing design-system patterns should be reused;
- integrations are centralized;
- analytics uses the analytics abstraction;
- secrets must never be exposed in frontend code;
- backend/serverless requires explicit authorization;
- `npm run check` must pass before completion;
- validation rules must not be weakened;
- architectural changes require consulting ADRs.

## Examples as Primary Documentation

Working code is the primary procedural documentation.

The template should provide examples of:

- localized pages;
- SEO metadata;
- translations;
- components;
- design-system primitives;
- analytics events;
- integrations;
- tests;
- Playwright workflows;
- consent handling.

Agents should prefer copying and adapting existing examples over inventing new patterns.

## Documentation Principle

Prefer:

```text
concise instruction
+
good example
+
automated validation
```

over:

```text
large procedural documentation
```

The repository should optimize for fast agent understanding.

## ADRs

ADRs are the authoritative source of architectural decisions.

They capture:

- context;
- decision;
- rationale;
- rejected alternatives;
- consequences.

If `AGENTS.md`, examples, or implementation patterns conflict with an accepted ADR, the ADR is authoritative.

## Architectural Exceptions

If a real requirement conflicts with an accepted ADR:

1. the user must explicitly authorize the exception;
2. implementation may proceed;
3. a new ADR must document the changed decision.

The ADR does not need to exist before the exception is approved, but the decision must not be lost.

## Documentation Index

`docs/README.md` provides navigation.

Conceptually:

```text
AGENTS.md
    ↓
how agents operate

PRD.md
    ↓
what the template is

decisions_list.md
    ↓
current decision status

adrs/
    ↓
why architecture works this way
```

## PRD

`docs/PRD.md` defines the template as a product.

It describes:

- target users;
- goals;
- non-goals;
- supported workflows;
- product expectations.

It does not replace ADRs.

## Decisions List

`docs/decisions_list.md` tracks:

- accepted decisions;
- pending decisions;
- ADR references.

It provides overview only.

The ADR remains the source of truth.

## Avoid Procedural Documentation Explosion

The base template should avoid creating many documents such as:

```text
how-to-add-page.md
how-to-add-component.md
how-to-add-integration.md
how-to-add-seo.md
```

unless real usage demonstrates the need.

The preferred knowledge sources are:

- examples;
- types;
- validation;
- ADRs;
- concise agent instructions.

## Architecture Review Subagent

The project defines a dedicated architecture-review subagent.

Its purpose is to evaluate completed implementations against the project's architectural intent.

It is not a replacement for:

- TypeScript;
- ESLint;
- tests;
- coverage;
- complexity checks;
- Playwright;
- build validation.

Those tools provide deterministic feedback.

The reviewer provides architectural judgment.

## Review Workflow

The recommended workflow is:

```text
implementation agent
        ↓
npm run check
        ↓
architecture-review subagent
        ↓
fix findings
        ↓
npm run check again
        ↓
task complete
```

The reviewer runs after deterministic validation passes.

## Review Source of Truth

The reviewer evaluates changes using the following priority order:

1. User request and acceptance criteria
2. `AGENTS.md`
3. Relevant accepted ADRs
4. Existing implementation examples and conventions
5. Automated validation results

The reviewer must not override higher-priority sources.

## Review Scope

The architecture reviewer evaluates:

### Architectural consistency

Questions:

- Does the implementation follow accepted ADRs?
- Were existing architectural patterns respected?
- Were new concepts introduced unnecessarily?

### Abstraction quality

Questions:

- Was an abstraction introduced without demonstrated need?
- Was duplication created where an existing abstraction should have been reused?
- Did the implementation create unnecessary conceptual surface?

### Project consistency

Questions:

- Does the implementation look like the existing codebase?
- Would a future agent understand and reuse this pattern?

### Agent friendliness

Questions:

- Did this change make future agent work harder?
- Did it increase the amount of project-specific knowledge required?

## Review Non-Goals

The reviewer must not:

### Replace automated tooling

Do not report:

- formatting issues;
- ordinary lint issues;
- type errors;
- missing tests already detected by validation.

### Redesign architecture based on preference

Examples:

Do not recommend:

- replacing React Router;
- replacing Tailwind;
- replacing localization strategy;

unless the user explicitly requests reconsideration.

### Introduce speculative architecture

Do not recommend:

- interfaces for hypothetical implementations;
- generic frameworks without need;
- additional layers solely for future flexibility.

## Architecture Review Checklist

The reviewer should consider:

### ADR compliance

- Are accepted decisions followed?
- Is a new ADR required?

### Existing pattern reuse

- Was existing functionality reused?
- Was a duplicate pattern created?

### Conceptual surface

- Did this introduce a new concept?
- Does the benefit justify the additional complexity?

### Dependency decisions

- Was a new dependency justified?
- Is the dependency architectural?

### Static-site constraints

- Was static purity preserved?
- Was unnecessary backend behavior introduced?

### Localization

- Is user-facing content correctly localized?

### SEO

- Are SEO requirements followed?

### Analytics and integrations

- Are boundaries respected?

### Design system

- Does UI follow existing component conventions?

## Relevant ADR Discovery

The reviewer should load ADRs relevant to the changed area.

Examples:

```text
Localization change
→ localization ADR

SEO change
→ SEO ADR

Analytics change
→ analytics ADR
→ privacy ADR

New integration
→ integration ADR
→ privacy ADR

Component architecture change
→ design-system ADR
```

The reviewer should not blindly load every ADR for every task.

This keeps context efficient, especially for smaller models.

## Findings Format

The reviewer should produce structured findings.

Example:

```yaml
status: NEEDS_CHANGES

findings:
  - severity: high
    location: app/routes/contact.tsx
    rule: ADR-014
    problem: User-visible text was hardcoded.
    recommendation: Move text to locale dictionaries.
```

A successful review may return:

```yaml
status: PASS
findings: []
```

## Severity Levels

The reviewer uses:

```text
high
medium
low
```

## High Severity Findings

High severity means an architectural invariant was violated.

Examples:

- exposing secrets;
- bypassing localization;
- introducing unauthorized backend requirements;
- violating static-generation requirements;
- directly bypassing analytics/privacy architecture.

High findings are blocking.

## Medium Severity Findings

Medium severity means meaningful architectural drift.

Examples:

- duplicate design-system implementation;
- unnecessary parallel abstraction;
- duplicated integration approach;
- introducing a major dependency without ADR.

Medium findings are blocking.

## Low Severity Findings

Low severity means improvement opportunities.

Examples:

- minor inconsistency;
- naming improvement;
- small maintainability suggestion.

Low findings are advisory.

They do not block completion.

## Blocking Policy

The review outcome is determined as follows:

```text
High findings
→ block completion

Medium findings
→ block completion

Low findings only
→ completion allowed
```

The reviewer should not fail a task because of subjective preferences.

## Conservative Review Principle

The reviewer should prefer:

```text
preserve existing architecture
```

over:

```text
improve architecture proactively
```

The goal is preventing architectural drift, not continuously redesigning the project.

## Pre-Commit Relationship

The architecture-review subagent is not part of Git pre-commit.

The pre-commit hook remains deterministic:

```text
npm run check
```

Reasons:

- predictable execution;
- fast feedback;
- no dependency on LLM availability.

## CI Relationship

CI remains deterministic.

The required CI pipeline includes:

- `npm run check`;
- Playwright tests.

The architecture-review subagent belongs to the AI development workflow and may also be used during pull-request review.

## Mechanical Guardrails

Mechanical validation should be used only where rules are deterministic.

Examples:

- type checking;
- linting;
- tests;
- coverage;
- complexity;
- build validation;
- static validation.

Architectural judgment should remain with the reviewer.

## Small Model Compatibility

The architecture is intentionally optimized for smaller AI models.

The repository provides:

- predictable structure;
- examples;
- typed APIs;
- concise instructions;
- ADRs;
- deterministic validation.

Agents should not need to understand the entire repository history to perform routine work.

## Rationale

AI agents need both:

```text
certainty
+
judgment
```

Deterministic tooling provides certainty.

The architecture reviewer provides judgment.

Together they reduce two failure modes:

### Under-constrained agents

Result:

- inconsistent code;
- duplicated patterns;
- architectural drift.

### Over-constrained agents

Result:

- excessive rules;
- rigid framework behavior;
- inability to evolve.

The selected model provides guidance without turning the template into a restrictive framework.

## Consequences

### Positive

- Clear agent operating model.
- Architectural decisions are preserved.
- Smaller models can work effectively.
- Review focuses on high-value judgment.
- Automated validation remains deterministic.
- Architectural drift is detected.
- Documentation remains maintainable.

### Negative

- Review quality depends on the reviewer model.
- Some architectural judgments remain subjective.
- Additional review step increases completion time.
- ADR discovery requires some reasoning.

These tradeoffs are accepted because architectural consistency is a primary goal of the template.

## Rejected Alternatives

### Large Agent Manual

Rejected because it increases context requirements.

### ADRs Only

Rejected because agents need concise operational instructions.

### Examples Only

Rejected because examples do not explain architectural intent.

### Mechanical Rules for Everything

Rejected because many architecture decisions require judgment.

### LLM Review in Pre-Commit

Rejected because commits should remain deterministic.

### LLM Review as Mandatory CI Gate

Rejected because CI should not depend on model availability.

### General Code Review Agent

Rejected because generic review overlaps with existing tooling.

The reviewer exists specifically for architectural compliance.