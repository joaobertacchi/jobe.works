# Phase 13 Architecture Review Subagent Design

## Scope

Phase 13 defines the dedicated architecture-review subagent required by `docs/PRD.md` and ADR 022. The subagent reviews completed work for architectural drift after deterministic validation has run. It complements rather than duplicates formatting, linting, type checking, tests, coverage, complexity checks, build validation, and Playwright.

This phase adds one OpenCode project-agent definition. It does not add a general code-review agent, a command wrapper, prompt-contract tests, new validation infrastructure, CI integration, dependencies, or support for additional agent runtimes.

## Chosen Approach

Create `.opencode/agents/architecture-review.md` as a provider-neutral OpenCode subagent. Keep the complete review contract in this one file so an agent can discover and run it without learning a project-specific wrapper.

The reviewer is read-only. It may inspect the request, changed files, relevant project documentation, existing examples, Git state, and supplied validation results, but it must not edit the repository or act as an implementation agent. The definition does not pin a model.

Git history is the recovery mechanism for accidental changes to the agent definition. The project will not add a hash guard, filesystem immutability, an `AGENTS.md` protection rule, or a contract test.

## Required Review Inputs

The caller must give the reviewer:

- the current implementation phase;
- that phase's user request and acceptance criteria;
- the changed files or diff to review;
- deterministic validation results; and
- an explicit statement that capabilities assigned to future planned phases are out of scope.

If the current phase or its acceptance criteria are missing, the reviewer requests them before performing the review. It must not substitute a repository-wide completeness audit.

## Source Priority

The reviewer evaluates changes in this order:

1. The current phase's user request and acceptance criteria.
2. `AGENTS.md`.
3. Relevant accepted ADRs.
4. Existing examples and conventions.
5. Deterministic validation results.

Lower-priority sources cannot override higher-priority sources. The reviewer loads only ADRs relevant to the changed area rather than loading every ADR by default.

## Change-Scoped Review

The initial review scope is the current phase's implementation and the architecture directly touched by it. The reviewer may inspect nearby unchanged code, examples, and architectural boundaries when needed to judge a change, but it does not review the entire unfinished repository against every accepted decision.

Missing capabilities assigned to later phases are not findings. For example, a page created before the analytics or consent phase does not violate the architecture merely because it lacks full analytics or consent integration.

A future-phase concern is reportable only when the current implementation creates a concrete architectural decision or constraint that would make an accepted future architecture difficult or impossible to implement. Such a finding must cite:

- the current changed location and constraint;
- the accepted ADR or requirement for the future architecture; and
- the concrete conflict between them.

This exception prevents current work from closing off accepted future architecture without turning the review into speculation about unfinished capabilities.

## Review Contract

The reviewer checks the changed implementation for:

- compliance with the current phase's relevant accepted ADRs;
- consistency with existing architecture and examples;
- speculative or premature abstraction;
- reuse of existing components and patterns;
- unjustified conceptual-surface growth;
- justification for new dependencies and the need for an ADR;
- preservation of static-site and no-runtime-server assumptions;
- localization boundaries when touched;
- SEO boundaries when touched;
- analytics and privacy boundaries when touched;
- third-party integration boundaries when touched; and
- design-system consistency when touched.

The reviewer favors preserving accepted architecture over proactively redesigning it. Recommendations identify the smallest correction that restores compliance.

## Non-Goals

The reviewer must not:

- reopen accepted architecture based on preference;
- duplicate ordinary formatting, lint, type, test, or style feedback;
- recommend speculative interfaces, layers, frameworks, or abstractions;
- propose changes contrary to accepted ADRs;
- report missing future-phase capabilities as current findings;
- expand a phase review into an unsolicited repository-wide audit; or
- fix findings itself.

Deterministic failures may be referenced when they provide evidence of an architectural problem, but reproducing ordinary tool output is not architecture review.

## Findings And Severity

The reviewer returns YAML with:

```yaml
status: PASS
findings: []
```

Each finding contains:

```yaml
- severity: high
  location: path/to/file.ts:line
  rule: ADR-000 or acceptance criterion
  problem: Concrete architectural problem introduced by the change.
  recommendation: Smallest change that restores compliance.
```

Allowed severities are `high`, `medium`, and `low`.

- `high` indicates an architectural invariant violation and blocks completion.
- `medium` indicates meaningful architectural drift and blocks completion.
- `low` indicates an advisory improvement and does not block completion.

The status is `NEEDS_CHANGES` when any high or medium finding exists. The status is `PASS` when no blocking finding exists, including when findings are low severity only. Findings must be concrete, traceable to changed code, and grounded in the source-priority contract. Subjective preference is not a finding.

## Validation

The implementation adds no executable application behavior and no browser-visible behavior. No prompt-contract test is added by design. Repository validation consists of `npm run check`; Playwright is not required for this phase.

Because OpenCode loads project agents at startup, users must restart OpenCode after the agent definition is added or changed.

## Acceptance Criteria

Phase 13 is complete when:

- `.opencode/agents/architecture-review.md` is discoverable as an OpenCode subagent;
- the reviewer is provider-neutral and read-only;
- the current phase, acceptance criteria, changed files, validation results, and future-phase exclusion are defined as review inputs;
- the reviewer is initially change-scoped rather than repository-wide;
- missing future-phase capabilities are explicitly excluded from findings;
- concrete current constraints on accepted future architecture remain reviewable;
- source priority matches ADR 022;
- all required architectural review areas are covered when touched by the change;
- prohibited feedback and speculative recommendations are explicit;
- output uses structured YAML findings with `high`, `medium`, and `low` severities;
- high and medium findings block completion while low findings remain advisory; and
- `npm run check` passes.
