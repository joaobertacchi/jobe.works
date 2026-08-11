# Template Product Definition

## Product Definition

## Overview

This project is a reusable template repository designed to enable AI agents to create and evolve high-quality static websites.

The template is not a website framework.

It is an **AI-agent development harness** providing:

- a production-ready technical foundation;
- clear architectural conventions;
- examples;
- deterministic validation;
- architectural review mechanisms.

Users fork the repository and customize it to create their own websites.

---

# Target Users

## Primary Users

Developers and technical teams who want to create marketing, company, product, or content websites using AI-assisted development.

Typical users:

- solo founders;
- small engineering teams;
- software consultants;
- developers creating websites for clients.

---

# Product Goal

Enable an AI agent to create and maintain production-quality static websites with minimal human intervention.

The template should reduce:

- architectural decisions;
- setup effort;
- repeated implementation choices;
- validation mistakes;
- inconsistent patterns.

---

# Non-Goals

The template is not intended to provide:

- a CMS;
- a backend platform;
- a SaaS website builder;
- a deployment platform;
- a complete design system;
- business-specific components;
- industry-specific templates.

The template provides the foundation.

Each fork evolves its own:

- brand;
- design system;
- pages;
- content;
- integrations.

---

# Core Product Principles

## Static by Default

The generated website should be:

- statically generated;
- deployable as static files;
- independent from a runtime backend.

Server-side functionality is allowed only when a specific requirement justifies it.

---

## Agent First

The repository is optimized for AI-agent development.

The template provides:

- concise instructions;
- examples instead of extensive manuals;
- typed contracts;
- deterministic validation;
- architectural decisions.

---

## Convention Over Configuration

The template prefers:

- established ecosystem patterns;
- predictable file organization;
- minimal configuration;
- explicit decisions.

---

## Avoid Premature Abstraction

The template encourages:

- reuse where patterns exist;
- simple implementations;
- abstractions only when justified.

The goal is a small conceptual surface that AI agents can understand.

---

# Technical Foundation

## Framework

The template uses:

- React Router Framework;
- static prerendering;
- TypeScript;
- TSX components.

---

## Routing

Requirements:

- localized routes;
- deterministic prerendering;
- static 404 pages;
- no SPA fallback for missing routes.

---

## Localization

The template supports:

- multiple locales;
- locale-prefixed routes;
- typed TypeScript dictionaries;
- page/feature-scoped translations.

Characteristics:

- missing translations detected by TypeScript;
- fallback locale behavior;
- no runtime translation loading requirement.

---

## UI Architecture

The template provides:

```
ui/
components/
sections/
domain/
routes/
```

with layered responsibilities.

The design system emerges through usage.

Each fork creates its own design system.

---

## Styling

The template uses:

- TailwindCSS;
- token-based styling;
- light/dark theme support.

---

## Content

Website copy uses typed localization dictionaries.

The template does not provide:

- blog infrastructure;
- CMS integration;
- content management workflows.

These can be added later if required.

---

# SEO Requirements

SEO is a first-class concern.

The template requires:

- explicit metadata;
- localized metadata;
- canonical URLs;
- sitemap generation;
- locale alternate links;
- validation of SEO invariants.

SEO behavior must be deterministic at build time.

---

# Analytics and Marketing

The template supports:

- centralized analytics abstraction;
- typed analytics events;
- provider-specific implementations behind the abstraction.

Marketing-related functionality includes:

- campaign attribution support;
- consent-aware tracking;
- lead-generation integrations.

Analytics providers are configured through environment variables.

---

# Privacy

The template follows LGPD-oriented principles:

- consent before non-essential tracking;
- privacy-first defaults;
- centralized analytics handling;
- transparent data collection.

---

# Integrations

The template does not abstract every third-party service.

Rule:

- use direct provider integration when a single provider is selected;
- create abstractions only when multiple implementations or architectural needs justify them.

Examples:

Allowed:

```
app/integrations/contact-form/
app/integrations/email/
```

Not required:

```
GenericProviderFactory
UniversalIntegrationManager
```

---

# Quality System

The template includes:

## Local Validation

Canonical command:

```bash
npm run check
```

Validates:

- formatting;
- lint;
- TypeScript;
- tests;
- coverage;
- complexity;
- build;
- static validation.

---

## Testing

The template uses:

- Vitest;
- React Testing Library;
- Playwright.

Playwright runs in CI.

Default browser:

- Chromium.

---

## Quality Thresholds

Initial policies:

Coverage:

```
Statements: 80%
Branches:   75%
Functions:  80%
Lines:      80%
```

Cyclomatic complexity:

```
Maximum: 10 per function
```

---

# Agent Workflow

The expected workflow is:

```
Understand task
      ↓
Read AGENTS.md
      ↓
Inspect examples
      ↓
Consult ADRs when needed
      ↓
Implement
      ↓
npm run check
      ↓
Architecture review
      ↓
Fix findings
      ↓
Complete
```

---

# Documentation Model

The repository contains:

```
AGENTS.md

docs/
  INDEX.md
  decisions_list.md
  adrs/
  template/
    PRD.md
```

Responsibilities:

## AGENTS.md

Operational instructions.

## INDEX.md

Active documentation navigation.

## docs/PRD.md

Fork-owned product requirements, when present.

## template/PRD.md

Reusable template product definition.

## ADRs

Architectural rationale.

## Examples

Primary implementation documentation.

---

# Architecture Review

The template includes an architecture-review subagent model.

Purpose:

Detect issues not captured by deterministic tooling.

Examples:

- unnecessary abstractions;
- ADR violations;
- duplicated patterns;
- conceptual complexity;
- inconsistent architecture.

Review outcome:

| Severity | Effect |
|-|-|
| High | Blocking |
| Medium | Blocking |
| Low | Advisory |

---

# Dependency Policy

Dependencies are allowed when justified.

Rules:

- prefer mature ecosystem solutions;
- avoid reinventing existing capabilities;
- evaluate build vs buy;
- major architectural dependencies require ADRs.

---

# Evaluation Model

Template effectiveness is measured separately through an evaluation repository.

Evaluation measures:

- task completion rate;
- time to validated completion;
- validation iterations;
- architecture findings;
- human intervention;
- regression across template versions.

Success requires:

- validation passing;
- Playwright passing;
- architecture review passing.

---

# Future Evolution

Possible future additions:

- stronger evaluation automation;
- additional static validators;
- more benchmark tasks;
- more accessibility checks;
- additional deployment guidance.

These should be added only when justified by real usage.
