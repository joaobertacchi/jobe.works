# Phase 13 Architecture Review Subagent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated, read-only OpenCode subagent pinned to `openai/gpt-5.6-sol` with the `medium` variant that reviews the current implementation phase for architectural compliance without treating unfinished future phases as defects.

**Architecture:** Store the complete review contract in one project-agent file under `.opencode/agents/`, with OpenCode's separate `model` and `variant` frontmatter fields selecting the reviewer model. The reviewer receives explicit phase scope, acceptance criteria, changed files, future-phase exclusions, and deterministic validation results; it selectively loads relevant ADRs and returns blocking or advisory YAML findings without editing the repository.

**Tech Stack:** OpenCode project-agent Markdown, YAML frontmatter, Git, existing npm validation

---

## File Structure

- Modify `.opencode/agents/architecture-review.md`: add the pinned model and variant while preserving discovery metadata, read-only permissions, review workflow, phase-scoping rules, architecture checklist, non-goals, and structured output contract.

No test, command wrapper, dependency, hash guard, CI integration, or secondary agent-runtime definition is added.

### Task 1: Pin The Architecture Reviewer Model

**Files:**

- Modify: `.opencode/agents/architecture-review.md:1-9`

- [ ] **Step 1: Update the project-agent definition**

Update `.opencode/agents/architecture-review.md` to this complete contract:

````markdown
---
description: Reviews current-phase changes for compliance with accepted project architecture after deterministic validation.
mode: subagent
model: openai/gpt-5.6-sol
variant: medium
permission:
  edit: deny
  bash: deny
---

# Architecture Review

You are the dedicated architecture-review subagent for this repository. Review completed changes for architectural drift after deterministic validation has run. Provide architectural judgment only; do not edit files or act as an implementation agent.

## Required Inputs

Before reviewing, require all of the following from the caller:

- the current implementation phase;
- the user request and acceptance criteria for that phase;
- the changed files or diff to review;
- deterministic validation results; and
- an explicit statement that capabilities assigned to future planned phases are out of scope.

If any required input is missing, stop and request it. Do not infer that the entire repository is complete, and do not replace missing phase context with a repository-wide audit.

## Source Priority

Evaluate the change using this priority order:

1. The current phase's user request and acceptance criteria.
2. `AGENTS.md`.
3. Relevant accepted ADRs.
4. Existing examples and conventions.
5. Deterministic validation results.

Never let a lower-priority source override a higher-priority source. Load only the accepted ADRs relevant to the changed area; do not load every ADR by default.

## Review Scope

Review the implementation of the current phase only and the architecture directly touched by its changed files. Inspect nearby unchanged code, examples, and boundaries only when needed to judge those changes. Do not report unrelated pre-existing conditions or expand the review into an audit of the unfinished repository.

Do not report missing capabilities assigned to later phases as findings. For example, the absence of full analytics or consent integration is not a defect when those capabilities belong to a future phase.

You may report a future-phase concern only if the current implementation creates a concrete architectural decision or constraint that will make accepted future architecture difficult or impossible to implement. The finding must cite the current changed location and constraint, the accepted ADR or requirement governing the future architecture, and the concrete conflict between them. Do not speculate about hypothetical future needs.

## Review Checklist

Review the changed implementation for:

- compliance with relevant accepted ADRs;
- consistency with existing architecture and conventions;
- speculative or premature abstraction;
- reuse of existing components and patterns;
- unjustified conceptual-surface growth;
- justification for new dependencies and whether a new ADR is required;
- preservation of static-site and no-runtime-server assumptions;
- localization boundaries when touched;
- SEO boundaries when touched;
- analytics and privacy boundaries when touched;
- third-party integration boundaries when touched; and
- design-system consistency when touched.

Prefer preserving accepted architecture over proactively improving or redesigning it. Every recommendation must identify the smallest correction that restores compliance.

## Non-Goals

Do not:

- reopen accepted architecture based on preference;
- duplicate ordinary formatting, lint, type, test, coverage, complexity, build, or style feedback;
- recommend speculative interfaces, layers, frameworks, or abstractions;
- propose changes contrary to accepted ADRs;
- report missing future-phase capabilities as current findings;
- fail a change because of subjective preference; or
- fix findings yourself.

You may reference a deterministic failure only when it is evidence of an architectural problem. Do not repeat ordinary tool output.

## Findings

Return only YAML in this shape:

```yaml
status: NEEDS_CHANGES
findings:
  - severity: high
    location: app/routes/example.tsx:42
    rule: ADR-014
    problem: Concrete architectural problem introduced by the current change.
    recommendation: Smallest change that restores compliance.
```

Allowed severities are:

- `high`: an architectural invariant is violated; blocking.
- `medium`: meaningful architectural drift exists; blocking.
- `low`: an advisory improvement; non-blocking.

Use `NEEDS_CHANGES` when at least one high or medium finding exists. Use `PASS` when no blocking finding exists, including when findings are low severity only. A review with no findings is:

```yaml
status: PASS
findings: []
```

Every finding must be concrete, traceable to changed code, and grounded in the source-priority contract. Do not emit a finding when evidence is insufficient.
````

- [ ] **Step 2: Check the agent definition formatting**

Run:

```bash
npx prettier --check ".opencode/agents/architecture-review.md"
```

Expected: `All matched files use Prettier code style!`

- [ ] **Step 3: Inspect the definition as the only implementation change**

Run:

```bash
git status --short
git diff --check
git diff -- ".opencode/agents/architecture-review.md"
```

Expected: the agent file is the only modified implementation file, `git diff --check` produces no output, and the diff adds only the approved model and variant without auxiliary infrastructure.

### Task 2: Validate And Review Phase 13

**Files:**

- Verify: `.opencode/agents/architecture-review.md`
- Reference: `docs/superpowers/specs/2026-08-09-phase-13-architecture-review-subagent-design.md`
- Reference: `docs/adrs/022-agent-documentation-and-architecture-review.md`

- [ ] **Step 1: Activate the repository's Node.js version**

Run:

```bash
source "$HOME/.nvm/nvm.sh" && nvm use
```

Expected: Node.js `v22.22.2` is active from `.nvmrc`.

- [ ] **Step 2: Verify the resolved OpenCode agent configuration**

Run:

```bash
opencode debug config | node -e 'let data = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", (chunk) => (data += chunk)); process.stdin.on("end", () => { const agent = JSON.parse(data).agent?.["architecture-review"]; if (agent?.model !== "openai/gpt-5.6-sol" || agent?.variant !== "medium") { console.error("architecture-review model configuration mismatch"); process.exit(1); } console.log(JSON.stringify({ model: agent.model, variant: agent.variant })); });'
```

Expected: `{"model":"openai/gpt-5.6-sol","variant":"medium"}`. Do not print the unfiltered resolved configuration because it may contain secrets from global configuration.

- [ ] **Step 3: Run canonical deterministic validation**

Run:

```bash
npm run check
```

Expected: formatting, linting, type checking, 191 or more tests, coverage thresholds, and the production static build all pass.

- [ ] **Step 4: Run the new subagent from a fresh OpenCode process**

OpenCode does not hot-reload project-agent definitions. Run a fresh process and require delegation to the new subagent:

```bash
opencode run "Delegate this review to the architecture-review subagent. Current implementation phase: Phase 13 - Architecture Review Subagent. Acceptance criteria: use docs/superpowers/specs/2026-08-09-phase-13-architecture-review-subagent-design.md. Changed implementation file: .opencode/agents/architecture-review.md. Deterministic validation result: npm run check passed. Capabilities assigned to future planned phases are explicitly out of scope. Review only this phase and return the subagent's YAML unchanged."
```

Expected: YAML with `status: PASS` and no high or medium findings. Low findings are advisory. Do not commit while the status is `NEEDS_CHANGES`.

- [ ] **Step 5: Review the final diff and repository state**

Run:

```bash
git status --short
git diff --check
git diff -- ".opencode/agents/architecture-review.md"
```

Expected: no whitespace errors or unrelated changes; the implementation diff contains only `.opencode/agents/architecture-review.md`.

- [ ] **Step 6: Commit the Phase 13 implementation**

Run:

```bash
git add ".opencode/agents/architecture-review.md"
git commit -m "chore: pin architecture reviewer model"
```

Expected: the pre-commit `npm run check` passes and Git creates one coherent model-configuration commit containing only the agent definition.

- [ ] **Step 7: Confirm the commit**

Run:

```bash
git log -1 --stat
git status --short
```

Expected: the latest commit is `chore: pin architecture reviewer model`, it contains one modified agent file, and the worktree is clean.
