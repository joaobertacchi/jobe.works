# decisions_list.md

# Architecture Decisions Status

This document provides a high-level view of architectural decisions inherited from the AI-agent website template and evolved by its forks.

Detailed rationale and tradeoffs are documented in individual ADRs under:

```
docs/adrs/
```

## Decision Status Summary

| ID | Decision | Status | ADR |
|---|---|---|---|
| P001 | Framework / SSG Choice | Accepted | [ADR 001](adrs/001-react-foundation.md), [ADR 003](adrs/003-static-build-output.md), [ADR 007](adrs/007-react-router-framework.md) |
| P002 | Routing and Static Generation | Accepted | [ADR 008](adrs/008-routing-and-static-generation.md) |
| P003 | Repository Reuse Model | Accepted | [ADR 009](adrs/009-reuse-model.md) |
| P004 | Styling and UI Foundation | Accepted | [ADR 012](adrs/012-tailwind-theming-and-styling-model.md) |
| P005 | Component / Design-System Architecture | Accepted | [ADR 011](adrs/011-component-design-system-architecture.md) |
| P006 | Design Tokens and Theme Model | Accepted | [ADR 012](adrs/012-tailwind-theming-and-styling-model.md) |
| P007 | Content Architecture | Accepted | [ADR 013](adrs/013-content-architecture.md) |
| P008 | Page Composition Model | Accepted | [ADR 011](adrs/011-component-design-system-architecture.md), [ADR 013](adrs/013-content-architecture.md) |
| P009 | Localization Architecture | Accepted | [ADR 014](adrs/014-localization-architecture.md) |
| P010 | Analytics Architecture | Accepted | [ADR 015](adrs/015-analytics-architecture.md) |
| P011 | Privacy and Consent Model | Accepted | [ADR 016](adrs/016-privacy-consent-and-lgpd.md) |
| P012 | Third-Party Integration Model | Accepted | [ADR 017](adrs/017-third-party-integration-architecture.md) |
| P013 | Constants and Configuration Model | Accepted | [ADR 018](adrs/018-configuration-and-constants.md) |
| P014 | SEO Architecture | Accepted | [ADR 019](adrs/019-seo-architecture.md) |
| P015 | Asset Management and Cache Strategy | Accepted | [ADR 020](adrs/020-images-assets-fonts-and-cache-invalidation.md) |
| P016 | Quality Toolchain and Validation | Accepted | [ADR 021](adrs/021-quality-toolchain-and-validation.md) |
| P017 | Agent Documentation and Architecture Review Model | Accepted | [ADR 022](adrs/022-agent-documentation-and-architecture-review.md) |
| P018 | Dependency Policy | Accepted | [ADR 023](adrs/023-dependency-policy.md) |
| P019 | Agent Documentation and Mechanical Guardrails | Covered by ADR 022 | [ADR 022](adrs/022-agent-documentation-and-architecture-review.md) |
| P020 | Agent Effectiveness Metrics and Evaluation | Accepted | [ADR 024](adrs/024-agent-effectiveness-metrics-and-evaluation.md) |
| P021 | Fork Documentation Lifecycle | Accepted | [ADR 025](adrs/025-fork-documentation-lifecycle.md) |
| P022 | Deployment Target | Accepted | [ADR 026](adrs/026-github-pages-deployment.md) |
| P023 | Locale Preference and Root Redirect | Accepted | [ADR 027](adrs/027-persisted-locale-preference.md) |

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
