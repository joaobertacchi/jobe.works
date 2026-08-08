# decisions_list.md

# Architecture Decisions Status

This document provides a high-level view of architectural decisions for the AI-agent website template.

Detailed rationale and tradeoffs are documented in individual ADRs under:

```
docs/adrs/
```

## Decision Status Summary

| ID | Decision | Status | ADR |
|---|---|---|---|
| P001 | Framework / SSG Choice | Accepted | ADR 001 |
| P002 | Routing and Static Generation | Accepted | ADR 002 |
| P003 | Repository Reuse Model | Accepted | ADR 003 |
| P004 | Styling and UI Foundation | Accepted | ADR 004 |
| P005 | Component / Design-System Architecture | Accepted | ADR 005 |
| P006 | Design Tokens and Theme Model | Accepted | ADR 006 |
| P007 | Content Architecture | Accepted | ADR 007 |
| P008 | Page Composition Model | Accepted | ADR 008 |
| P009 | Localization Architecture | Accepted | ADR 009 |
| P010 | Analytics Architecture | Accepted | ADR 010 |
| P011 | Privacy and Consent Model | Accepted | ADR 011 |
| P012 | Third-Party Integration Model | Accepted | ADR 012 |
| P013 | Constants and Configuration Model | Accepted | ADR 013 |
| P014 | SEO Architecture | Accepted | ADR 014 |
| P015 | Asset Management and Cache Strategy | Accepted | ADR 015 |
| P016 | Quality Toolchain and Validation | Accepted | ADR 021 |
| P017 | Agent Documentation and Architecture Review Model | Accepted | ADR 022 |
| P018 | Dependency Policy | Accepted | ADR 023 |
| P019 | Agent Documentation and Mechanical Guardrails | Covered by ADR 022 | ADR 022 |
| P020 | Agent Effectiveness Metrics and Evaluation | Accepted | ADR 024 |

---

# Remaining Work

All architectural decisions required before implementation are complete.

Next phase:

1. Build the template repository.
2. Implement the agreed architecture.
3. Create the evaluation repository.
4. Validate the template using representative agent tasks.
5. Create `PROMPT.md` after the repository structure and conventions are proven.

---

# Core Principles

## Static First

The template creates static websites.

Default assumptions:

- prerendered routes;
- no backend;
- no runtime server dependency;
- provider-neutral deployment;
- build-time generation.

Backend functionality requires explicit justification.

---

## Agent-Friendly by Design

The template optimizes for AI-agent effectiveness through:

- predictable structure;
- typed APIs;
- examples;
- ADRs;
- deterministic validation;
- architecture review.

---

## Prefer Existing Patterns

Agents should:

- reuse existing components;
- follow examples;
- avoid speculative abstractions;
- minimize unnecessary conceptual surface.

---

## Deterministic Validation

The canonical validation command is:

```bash
npm run check
```

It validates:

- formatting;
- lint;
- type safety;
- tests;
- coverage;
- complexity;
- production build;
- static invariants.

---

## Architectural Review

After deterministic validation passes, the architecture-review subagent evaluates:

- ADR compliance;
- architectural consistency;
- abstraction quality;
- conceptual complexity;
- reuse of existing patterns.

High and medium severity findings block completion.

Low severity findings are advisory.
