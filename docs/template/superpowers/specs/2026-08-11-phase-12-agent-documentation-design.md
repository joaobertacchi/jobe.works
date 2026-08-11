# Phase 12 Agent Documentation Design

## Scope

Phase 12 creates the repository documentation that helps AI agents find the minimum context needed to make architecturally consistent changes. The phase updates the existing root `AGENTS.md`, creates `docs/INDEX.md`, and corrects factual inconsistencies in `docs/decisions_list.md`.

`docs/template/PRD.md` remains unchanged because the implementation review did not reveal a Phase 12-specific product inconsistency.

This phase documents the current repository state, including the implemented Phase 11 CI workflow and repository-owned Phase 13 architecture-review subagent.

## Documentation Architecture

Use a layered operational map:

1. `AGENTS.md` is the concise, always-loaded operational contract.
2. `docs/INDEX.md` routes agents to authoritative documents and exact working examples.
3. Accepted ADRs contain architectural decisions and rationale.
4. Working code remains the primary procedural documentation.

This structure minimizes initial context while making deeper context easy to discover. It avoids both a bare document list that leaves agents searching and a procedural handbook that duplicates code and ADRs.

## Root Agent Contract

Update `AGENTS.md` surgically rather than replacing it with a handbook. It will include:

- the project purpose and static, localized, prerendered invariants;
- a compact ownership map for routes, translations, component layers, analytics, consent, integrations, SEO, routing/build validation, and browser tests;
- the coordinated obligations for adding a public page: locale-prefixed route module, typed dictionary registration, explicit localized metadata, required links or navigation, and meaningful tests;
- direction to copy and adapt existing examples before introducing new patterns;
- analytics, consent, integration, backend, and secret-handling boundaries;
- the dependency decision order from ADR 010 and ADR 023, including build-vs-buy reasoning and ADR requirements for architectural dependencies;
- the validation sequence: activate `.nvmrc`, run `npm run check`, run E2E for browser-visible changes, then run architecture review after deterministic validation;
- ADR authority and the architectural-exception process;
- the existing graphify discovery rules.

The contract will point to `docs/INDEX.md` for deeper navigation and will not reproduce ADR rationale or detailed recipes. It will remove the stale statement that CI and later architectural layers are intentionally pending without replacing it with claims about unavailable repository files.

The architecture-review rule will point agents to the repository-owned definition at `.opencode/agents/architecture-review.md`.

## Documentation Index

Create `docs/INDEX.md` as a task-oriented index. It will organize links by what an agent needs to do:

- understand the product and implementation roadmap;
- identify source-of-truth precedence;
- find a working implementation example;
- load ADRs relevant to a changed concern;
- understand the status and boundary of implementation phases.

The index will link exact examples for:

- localized routes, dictionaries, and SEO metadata;
- UI primitives, domain components, reusable sections, and site components;
- analytics, attribution, consent, and third-party integrations;
- routing manifests and static-build validation;
- colocated unit tests and Playwright tests.

ADRs will be grouped by concern so agents do not need to load every decision for routine work. The index will explicitly tell agents to load only the context relevant to the requested change.

## Decision-List Corrections

Update `docs/decisions_list.md` only where the current repository proves it factually stale:

- make decision references match the actual ADR filenames and subjects;
- replace the obsolete statement that the next work is to build the template and later create `PROMPT.md` with a link to `docs/template/PHASES.md` as the implementation-status source.

Do not alter accepted decisions, add new decisions, or rewrite ADR rationale.

## Implemented Workflow Boundary

The documentation describes commands, files, and examples that currently exist. It links the implemented CI workflow at `.github/workflows/ci.yml` and architecture-review subagent at `.opencode/agents/architecture-review.md`.

Planning artifacts do not prove implementation status; agents must verify referenced repository files. `docs/template/PHASES.md` remains the source for implementation sequencing.

## Validation

This phase changes documentation only, so it adds no runtime behavior, dependencies, data flow, error handling, or automated behavior tests.

Verification consists of:

1. Confirm every referenced source and document path exists.
2. Confirm every ADR reference matches its actual filename and subject.
3. Confirm `AGENTS.md` covers every Phase 12 requirement without duplicating full ADR content.
4. Confirm `docs/INDEX.md` remains primarily an index.
5. Activate the Node.js version from `.nvmrc` and run formatting and `npm run check`.
6. Skip Playwright because no browser-visible behavior changes.
7. Run the currently configured architecture reviewer after deterministic validation.
8. Review the final diff for unsupported claims about unimplemented phases.

## Acceptance Criteria

Phase 12 is complete when:

- `AGENTS.md` concisely covers all content required by `docs/template/PHASES.md`;
- an agent can identify where a change belongs and which validation applies from `AGENTS.md`;
- `docs/INDEX.md` routes an agent to relevant authoritative documents and working examples without becoming a procedural manual;
- `docs/decisions_list.md` contains accurate ADR references and current implementation-status guidance;
- `docs/template/PRD.md` is untouched unless a concrete factual inconsistency is discovered during implementation;
- documentation links the existing CI and repository-owned reviewer files;
- formatting and `npm run check` pass; and
- architecture review has no blocking findings.

No commits are created, per user instruction.
