# ADR 025 - Separate Template History from Fork Documentation

**Status:** Accepted

## Context

This repository serves two related purposes:

- maintainers evolve the reusable AI-agent website template;
- adopters fork the repository to build a specific website or product.

The original documentation paths mixed those lifecycles. `docs/PRD.md` described the template itself, preventing a fork from using the conventional path for its own product requirements. `docs/PHASES.md` and completed files under `docs/superpowers/` recorded template implementation history that is not useful during normal fork development.

Moving those files to a namespace makes ownership clear, but a website fork should also be able to remove the template-maintainer context without losing active architectural constraints.

Agent instruction discovery is already repository-owned: OpenCode and Codex discover `AGENTS.md`, and `CLAUDE.md` imports that contract for Claude. Human prompts do not need to tell supported agents to load those files.

## Decision

Separate active fork documentation from removable template-maintainer history.

### Active fork documentation

The following paths remain outside the removable namespace:

```text
README.md
AGENTS.md
CLAUDE.md
docs/INDEX.md
docs/PRD.md                 # created by the fork when needed
docs/decisions_list.md
docs/adrs/
docs/superpowers/           # created by the fork when needed
```

Inherited ADRs and the decision list remain active in a fork. Fork-specific ADRs join the same sequence and supersede inherited decisions when requirements change.

### Template-maintainer documentation

Documentation used only to evolve the reusable template lives under:

```text
docs/template/
  PRD.md
  PHASES.md
  superpowers/
    plans/
    specs/
```

Reusable-template plans and specifications use `docs/template/superpowers/`. Fork-specific plans and specifications use `docs/superpowers/`.

### Fork cleanup

A website fork may remove all template-maintainer history with:

```bash
rm -rf docs/template
```

The active agent contract, ADRs, decision list, implementation examples, and validation workflow must not depend on that directory.

### Navigation

`docs/INDEX.md` is neutral navigation for active documentation and working examples. It does not duplicate the agent operating contract or route normal fork work through template-maintainer history.

## Relationship to ADR 022

This decision supersedes ADR 022 only where ADR 022 fixes the documentation index and template product definition at `docs/README.md` and `docs/PRD.md`. ADR 022's agent contract, examples-as-documentation principle, source-priority model, and architecture-review workflow remain active.

## Rationale

The selected structure provides one clear ownership rule and one deterministic cleanup operation. It lets the template continue evolving in the same repository while allowing forks to remove irrelevant history before normal development.

Keeping ADRs outside the removable namespace preserves the architecture inherited by a fork. Reserving `docs/PRD.md` for the fork prevents template goals from conflicting with the actual website product requirements.

## Consequences

### Positive

- Forks can use `docs/PRD.md` for their actual product.
- Template history remains available to template maintainers.
- One directory removal eliminates template-only context from a fork.
- Active ADRs and deterministic guardrails survive cleanup.
- Human prompts no longer repeat automatic instruction discovery.

### Negative

- Template-maintenance links require a broader one-time path migration.
- Template and fork work use different planning directories.
- Adopters must remove `docs/template/` when they want the smallest possible context.

## Rejected Alternatives

### Keep template history at active documentation paths

Rejected because it conflicts with fork-owned product documentation and adds irrelevant retrieval context.

### Tool-specific ignore files

Rejected because no single ignore mechanism reliably covers OpenCode, Codex, and Claude, and ignored files would be harder for template maintainers to discover.

### Delete template history from the repository

Rejected because the reusable template continues to evolve and needs its product definition, phase history, designs, and plans.

### Separate source and distribution repositories

Rejected because it creates synchronization and release overhead that is not justified while one removable namespace provides sufficient separation.
