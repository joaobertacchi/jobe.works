# Documentation Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate removable template-maintainer history from active fork documentation while making the human README and documentation index accurate for OpenCode, Codex, and Claude users.

**Architecture:** Keep active fork architecture in `AGENTS.md`, `docs/INDEX.md`, `docs/decisions_list.md`, and `docs/adrs/`. Move template product history and all existing template-development plans/specifications under removable `docs/template/`, reserve `docs/PRD.md` and `docs/superpowers/` for forks, and record the lifecycle in ADR 025.

**Tech Stack:** Markdown, Git path history, npm/Prettier validation

---

### Task 1: Move template-maintainer documentation into its namespace

**Files:**
- Move: `docs/PRD.md` to `docs/template/PRD.md`
- Move: `docs/PHASES.md` to `docs/template/PHASES.md`
- Move: every existing file under `docs/superpowers/plans/` to `docs/template/superpowers/plans/`
- Move: every existing file under `docs/superpowers/specs/` to `docs/template/superpowers/specs/`
- Preserve: `docs/template/superpowers/plans/2026-08-11-documentation-lifecycle.md`
- Preserve: `docs/template/superpowers/specs/2026-08-11-documentation-lifecycle-design.md`

- [x] **Step 1: Record the source inventory**

Use repository file search to list `docs/superpowers/plans/*.md` and `docs/superpowers/specs/*.md`. The expected inventory is 17 plan files and 12 specification files, all related to development of the reusable template.

- [x] **Step 2: Move the product and phase documents**

Move the files without changing their substantive content:

```text
docs/PRD.md    -> docs/template/PRD.md
docs/PHASES.md -> docs/template/PHASES.md
```

Change the first meaningful heading in the destination files to identify them as the template product definition and template implementation phases rather than active fork documents.

- [x] **Step 3: Move existing planning history**

Move all source files from:

```text
docs/superpowers/plans/ -> docs/template/superpowers/plans/
docs/superpowers/specs/ -> docs/template/superpowers/specs/
```

Do not leave duplicate source files. The empty `docs/superpowers/` path is intentionally absent until a fork creates its own plans or specifications.

- [x] **Step 4: Verify the ownership boundary**

Expected filesystem state:

```text
docs/template/PRD.md
docs/template/PHASES.md
docs/template/superpowers/plans/
docs/template/superpowers/specs/
```

Expected absent paths:

```text
docs/PRD.md
docs/PHASES.md
docs/superpowers/
```

### Task 2: Create the neutral active documentation index

**Files:**
- Move and rewrite: `docs/README.md` to `docs/INDEX.md`

- [x] **Step 1: Replace agent instructions with neutral navigation**

Write `docs/INDEX.md` with these sections:

1. `Active Documentation`: root README, optional fork `docs/PRD.md`, decision list, ADRs, and agent contract.
2. `Working Examples`: retain the existing task-to-code table for pages, components, analytics, consent, integrations, routing, tests, architecture review, and CI.
3. `ADRs by Concern`: retain the existing concern grouping and add ADR 025 to the agent/documentation concern.
4. `Validation`: link to `package.json`, Playwright configuration, CI, and architecture review without repeating completion instructions.
5. `Template Maintenance`: state that `docs/template/` is present only in the reusable template repository and may be deleted by website forks.

Remove the current `Load AGENTS.md first`, source-priority instructions, phase-scope warning, and imperative implementation guidance. The file is navigation, not another operating contract.

- [x] **Step 2: Verify the index survives fork cleanup**

Confirm that every normal navigation link resolves without requiring `docs/template/`. The template-maintenance note may name `docs/template/` as code text but must not make it a prerequisite for fork work.

### Task 3: Update human and agent entry points

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Preserve unchanged: `CLAUDE.md`

- [x] **Step 1: Correct the human AI-agent workflow**

In `README.md`, replace the instruction to tell an agent to read `AGENTS.md` with a statement that OpenCode and Codex discover `AGENTS.md` automatically and `CLAUDE.md` imports the same contract for Claude. Remove `Read AGENTS.md` from the example prompt so it begins directly with the adaptation request.

- [x] **Step 2: Add fork documentation initialization**

In the initial adoption flow, document:

```bash
rm -rf docs/template
```

Explain that website forks should then create `docs/PRD.md` for their actual product requirements. Do not create or ship a placeholder fork PRD.

- [x] **Step 3: Update human documentation links**

Replace `docs/README.md` with `docs/INDEX.md` in the documentation table and closing navigation. Describe `docs/PRD.md` as the fork-owned product definition when present, not as the reusable template definition.

- [x] **Step 4: Make the agent contract fork-aware**

Update `AGENTS.md` to state:

```text
docs/INDEX.md navigates active documentation.
docs/PRD.md, when present, defines the fork product.
docs/template/ is consulted only for reusable-template work and may be removed by forks.
docs/adrs/ and docs/decisions_list.md remain active after forking.
Template plans use docs/template/superpowers/; fork plans use docs/superpowers/.
```

Keep all existing runtime, architecture, and completion invariants unchanged.

- [x] **Step 5: Confirm the Claude adapter**

Read `CLAUDE.md` and verify its complete content remains:

```markdown
@AGENTS.md
```

### Task 4: Record the architectural decision

**Files:**
- Create: `docs/adrs/025-fork-documentation-lifecycle.md`
- Modify: `docs/decisions_list.md`
- Reference: `docs/adrs/022-agent-documentation-and-architecture-review.md`

- [x] **Step 1: Add ADR 025**

Write an accepted ADR covering:

- the collision between template PRD/history and fork-owned product documentation;
- the decision to reserve `docs/PRD.md` and `docs/superpowers/` for forks;
- the removable `docs/template/` namespace;
- the decision to retain inherited ADRs and the decision list as active fork architecture;
- automatic agent instruction discovery through `AGENTS.md` and `CLAUDE.md`;
- why ignore files, pruning, and separate repositories were rejected;
- that ADR 025 supersedes only ADR 022's fixed path model.

- [x] **Step 2: Update decision status**

Add an accepted `P021` row for fork documentation lifecycle linked to ADR 025. Remove the template-only implementation-status link to `PHASES.md`; it would be invalid after a fork removes `docs/template/`.

- [x] **Step 3: Preserve ADR history**

Do not rewrite ADR 022's rationale. Add only a short status note or forward reference if needed to make it clear that ADR 025 supersedes its documentation paths.

### Task 5: Migrate historical references and validate

**Files:**
- Modify path references under: `docs/template/superpowers/plans/`
- Modify path references under: `docs/template/superpowers/specs/`
- Modify: `docs/template/PHASES.md`
- Modify: `docs/template/PRD.md` only where its own path is named

- [x] **Step 1: Correct moved historical paths**

Apply path-only replacements according to ownership:

```text
docs/README.md      -> docs/INDEX.md
docs/PRD.md         -> docs/template/PRD.md       # when referring to template definition
docs/PHASES.md      -> docs/template/PHASES.md
docs/superpowers/   -> docs/template/superpowers/ # when referring to moved template history
```

Do not change historical decisions, acceptance criteria, or retrospective statements beyond what is required for path accuracy.

- [x] **Step 2: Search for stale active paths**

Search all Markdown files for:

```regex
docs/README\.md|docs/PHASES\.md|docs/superpowers/
```

Expected: matches remain only where the lifecycle design or ADR explicitly discusses old/fork-reserved paths. Search `docs/PRD.md` separately and verify each remaining match intentionally means the fork-owned PRD rather than the moved template definition.

- [x] **Step 3: Format documentation**

Run:

```bash
npx prettier --write README.md AGENTS.md docs
```

Expected: all changed Markdown files use repository formatting.

- [x] **Step 4: Run deterministic validation**

Run:

```bash
nvm use
npm run check
```

Expected: formatting, lint, type checking, 326 tests, coverage, build, and static validation pass.

- [x] **Step 5: Inspect the final worktree**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the approved documentation lifecycle changes and the user-created `CLAUDE.md` are present.

- [x] **Step 6: Run architecture review**

Ask the repository's `architecture-review` subagent to review the complete current change against the approved lifecycle design and ADRs. Fix every high and medium finding, then rerun affected validation.
