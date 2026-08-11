# Documentation Lifecycle Design

## Purpose

Separate documentation needed to evolve the reusable template from documentation needed by websites created from it. A fork should retain active architectural constraints without carrying template implementation history in normal agent context.

## Documentation Audiences

The repository uses one document for each responsibility:

- `README.md` guides the human adopting and customizing the template.
- `AGENTS.md` is the shared agent contract discovered automatically by OpenCode and Codex.
- `CLAUDE.md` imports `AGENTS.md` for Claude and remains a one-line adapter.
- `docs/INDEX.md` is a neutral index of active repository documentation and working examples.
- `docs/PRD.md`, when present, defines the website or product created by a fork.
- `docs/adrs/` and `docs/decisions_list.md` remain active architectural sources inherited by forks.

The human README does not instruct agents to read instruction files manually. It explains that supported agents discover the repository contract automatically and asks the adopter to provide only the website brief.

## Removable Template Namespace

Template-maintainer-only documentation lives under one removable namespace:

```text
docs/template/
  PRD.md
  PHASES.md
  superpowers/
    plans/
    specs/
```

The current template product definition moves from `docs/PRD.md` to `docs/template/PRD.md`. The template implementation roadmap moves from `docs/PHASES.md` to `docs/template/PHASES.md`. Existing plans and specifications for building the reusable template move from `docs/superpowers/` to `docs/template/superpowers/`.

Future work follows the same ownership boundary:

- reusable-template plans and specifications belong under `docs/template/superpowers/`;
- fork-specific plans and specifications belong under `docs/superpowers/`.

## Fork Initialization

The root README makes template cleanup an explicit initial adoption step:

```bash
rm -rf docs/template
```

The command is idempotent. After cleanup, the adopter creates `docs/PRD.md` for the website's product requirements. The template does not ship a placeholder `docs/PRD.md`, because incomplete placeholder requirements could be mistaken for an active product contract.

Removing `docs/template/` must not break the fork's operating model. Enduring rules remain in `AGENTS.md`, accepted ADRs, the decision list, working examples, and deterministic validation.

## Documentation Index

Rename `docs/README.md` to `docs/INDEX.md` and rewrite it as neutral navigation rather than another agent instruction file. It contains:

1. active product and architecture documents;
2. working examples grouped by common change;
3. ADRs grouped by concern;
4. validation and CI entry points;
5. a final note that template-maintainer history, when present, lives under `docs/template/` and may be removed by website forks.

The normal task tables do not route agents into template-maintainer history.

## Agent Contract

Update `AGENTS.md` so it works before and after template cleanup:

- use `docs/INDEX.md` for active documentation navigation;
- use `docs/PRD.md`, when present, for fork product requirements;
- consult `docs/template/PRD.md` and `docs/template/PHASES.md` only when evolving the reusable template;
- preserve `docs/adrs/` and `docs/decisions_list.md` in forks;
- place planning artifacts according to template or fork ownership.

`CLAUDE.md` remains unchanged as:

```markdown
@AGENTS.md
```

## Reference Migration

Update active repository references from:

- `docs/README.md` to `docs/INDEX.md`;
- `docs/PRD.md` to `docs/template/PRD.md` when the reference means the reusable template definition;
- `docs/PHASES.md` to `docs/template/PHASES.md`;
- `docs/superpowers/` to `docs/template/superpowers/` when the reference points to existing template-development history.

Path-only corrections are allowed inside historical plans and specifications so their links continue to resolve. Their decisions and retrospective content do not change.

## Architectural Decision

Create ADR 025 to record the fork-aware documentation lifecycle. It supersedes only the fixed documentation paths in ADR 022; ADR 022's agent contract, examples-as-documentation principle, and architecture-review model remain active. The decision status list records ADR 025 as accepted.

## Validation

The change is complete when:

- all renamed and moved Markdown links resolve;
- no active reference incorrectly treats `docs/PRD.md` as the template definition;
- `README.md` contains no instruction to load `AGENTS.md` manually;
- `CLAUDE.md` still imports `AGENTS.md`;
- normal documentation navigation does not require `docs/template/`;
- ADR 025 records the path and lifecycle decision without rewriting ADR 022's historical rationale;
- deleting `docs/template/` would leave the agent contract, ADRs, decision list, examples, validation, and fork documentation paths intact;
- formatting and `npm run check` pass;
- architecture review reports no high or medium findings.
