# ADR 010 — AI Agent Contract

**Status:** Accepted

## Context

The project is intended to be used as a harness for AI coding agents that create and evolve static marketing/content websites.

The template should provide enough structure and deterministic validation to keep agents aligned with the intended architecture, while avoiding an overly restrictive platform that would reduce flexibility for individual website forks.

Because every website is created as a fork of the template repository and all changes are tracked in Git, review and rollback provide an additional safety mechanism.

The contract therefore favors:

- clear conventions;
- deterministic checks;
- lightweight guardrails;
- broad access to the repository;
- explicit architectural boundaries rather than hard filesystem restrictions.

## Decision

AI agents may modify repository code broadly, but must follow the architectural rules documented by the project and must pass the canonical validation pipeline before considering work complete.

The template will use a guarded-but-flexible model rather than restricting agents to a fixed set of writable directories.

## Repository Access

Agents may modify any source-controlled file when the task legitimately requires it.

The template will not implement a strict writable-directory allowlist.

Git is the primary mechanism for:

- reviewing changes;
- identifying unintended modifications;
- reverting bad changes;
- comparing agent output with the previous state.

Framework, tooling, validation, and configuration files are therefore editable, but they must not be changed merely to bypass architectural constraints or make validation errors disappear.

## Dependency Policy

Agents may add dependencies when necessary.

Before introducing a dependency, agents should prefer, in order:

1. existing project capabilities;
2. browser/platform APIs;
3. React Router or other already-adopted framework APIs;
4. existing installed dependencies;
5. adding a new dependency.

New dependencies should have a clear reason and should solve a meaningful problem rather than replace trivial project code.

Package installation is not prohibited or allowlisted by default.

## Component Reuse

Component reuse follows a tiered policy.

### Design-system primitives

Existing primitives should be reused rather than reimplemented.

Examples may include:

- buttons;
- links;
- form controls;
- typography primitives;
- layout primitives;
- accessible interactive controls.

### Reusable sections and patterns

Existing sections or patterns should be reused when they reasonably fit the use case.

Agents may extend them when the extension is generally useful.

### Site-specific compositions

Agents may freely create site-specific compositions when reuse would create unnecessary abstraction or when the design is intentionally unique.

The goal is to avoid both duplication and premature abstraction.

## Design System

The base template does **not** ship with a complete design system.

Each website fork must create its own design system as part of the website-development process.

The design system is therefore a development output, not a reusable asset inherited unchanged from the template.

The template may define conventions for how a design system should be structured, but it must not prescribe the site's:

- visual identity;
- color palette;
- typography;
- component appearance;
- branding;
- layout language.

A typical website fork may progressively create:

```text
design tokens
    ↓
primitives
    ↓
reusable components
    ↓
sections / patterns
    ↓
page compositions
```

Agents should reuse and evolve the design system created within that fork rather than repeatedly introducing one-off equivalents.

## Backend Policy

The project's existing backend policy remains part of the agent contract.

Agents must not introduce:

- project-owned API routes;
- application servers;
- server-side form handlers;
- runtime server dependencies;
- backend infrastructure;

unless the user explicitly authorizes an architectural exception.

For integration problems, agents should prefer:

1. existing integration abstractions;
2. browser-safe third-party services;
3. external SaaS or webhook solutions;
4. backend/serverless infrastructure only as an explicit exception.

## Architectural Exceptions

An explicit user instruction is sufficient to authorize an exception to an architectural rule.

An ADR does not need to exist before implementation begins.

However, once an architectural exception is accepted or implemented, a new ADR must be generated to document:

- the exception;
- why it was required;
- affected architectural rules;
- consequences;
- whether the exception is local or changes the general architecture.

This keeps governance lightweight while preserving architectural history.

## Third-Party Integrations

Third-party integrations must be centralized.

Vendor-specific logic, scripts, SDK initialization, analytics providers, marketing pixels, and similar concerns should not be scattered throughout pages and arbitrary components.

The project should define an integration layer or dedicated integration area that centralizes:

- initialization;
- configuration;
- vendor-specific APIs;
- script loading;
- consent interactions where applicable;
- environment/configuration requirements.

Application components should use project-level integration abstractions where practical.

## Raw HTML Primitives

Raw HTML elements are not universally forbidden.

Selective restrictions should be introduced where project components provide meaningful guarantees such as:

- accessibility;
- consistent interaction behavior;
- localization;
- routing correctness;
- styling consistency.

For example, a fork may require project abstractions for:

- buttons;
- links;
- images;
- form fields.

Semantic structural elements such as:

- `section`;
- `article`;
- `main`;
- headings;
- paragraphs;

should generally remain directly usable.

Restrictions should provide clear architectural value rather than abstract HTML unnecessarily.

## Styling

Tailwind CSS is the selected styling technology.

Reasons include:

- broad industry adoption;
- extensive public documentation and examples;
- strong representation in LLM training data;
- concise generated code;
- reduced token usage compared with verbose custom CSS in many common cases;
- mature responsive and utility-class conventions.

Detailed Tailwind and design-token policies are defined separately.

## Validation Before Completion

The repository must expose a canonical validation command:

```bash
npm run check
```

An agent must run and successfully complete this command before declaring a development task complete.

The exact pipeline will be defined separately, but is expected to eventually include relevant checks such as:

- formatting;
- linting;
- TypeScript validation;
- architectural validation;
- tests;
- production static build;
- routing/static completeness;
- SEO checks;
- broken-link checks;
- accessibility checks where applicable.

## Validation Failures

When validation fails, the agent must fix the underlying problem.

Agents must not make validation pass by casually:

- disabling lint rules;
- adding broad suppression comments;
- weakening TypeScript settings;
- removing validation steps;
- modifying static-generation invariants;
- excluding problematic files;
- changing test expectations without justification.

Changing validation itself is allowed when the task genuinely concerns project architecture or tooling.

Validation is a guardrail, not an obstacle to bypass.

## Agent Documentation

Agent instructions will use a layered model.

A concise root-level `AGENTS.md` will contain:

- mandatory project rules;
- critical architectural invariants;
- completion requirements;
- pointers to deeper documentation.

Detailed information remains in project documentation such as:

```text
docs/
├── PRD.md
├── decisions_list.md
├── adrs/
└── architecture documentation
```

This keeps the initial agent context small while allowing deeper context to be loaded when necessary.

## Recipes and Skills

The base template will not include task-specific recipes such as:

- how to create a page;
- how to create a component;
- how to add a form;
- how to add analytics.

The intention is to keep the template focused on architecture rather than encode many custom workflows.

Users of individual forks may add their own:

- skills;
- agent instructions;
- recipes;
- automation guidance;

when their workflow benefits from them.

## Scaffolding and Generators

The base template will not provide custom scaffolding or generators.

Agents and developers should use the framework's normal conventions directly.

Commands such as:

```text
generate:page
generate:component
generate:locale
```

will not be required.

This avoids introducing template-specific APIs that smaller LLMs would need to learn.

## Rationale

The selected contract balances determinism with flexibility.

Hard restrictions would reduce the risk of architectural mistakes, but they would also:

- create template-specific concepts;
- make legitimate changes harder;
- increase maintenance burden;
- reduce the usefulness of the fork as an independent codebase.

Conversely, documentation-only guidance would leave too much room for smaller agents to produce structurally valid but architecturally undesirable solutions.

The chosen model therefore relies on:

```text
widely adopted tools
        +
clear conventions
        +
mechanical validation
        +
Git review/recovery
```

rather than a highly restrictive custom platform.

## Consequences

### Positive

- Agents can solve legitimate problems without artificial filesystem restrictions.
- Individual forks remain flexible and independently evolvable.
- Git provides straightforward review and rollback.
- Smaller LLMs rely mainly on established ecosystem conventions.
- Custom template-specific knowledge is minimized.
- Validation provides deterministic feedback.
- Design-system evolution remains specific to each website.
- Third-party integrations remain auditable and centralized.

### Negative

- Agents can technically modify architectural infrastructure.
- Some rules rely on agent instructions plus review rather than hard permissions.
- Poor agents may still make inappropriate changes before validation catches them.
- Design-system quality is not guaranteed by the template alone.
- Dependency additions require judgment rather than an allowlist.
- Maintaining strong validation becomes important because repository access is broad.

## Rejected Alternatives

### Strict Writable-Directory Allowlist

Rejected because Git already provides review and rollback, and strict permissions would unnecessarily constrain legitimate website evolution.

### Dependency Allowlist

Rejected because different marketing websites may require different third-party integrations.

### Protected Design System

Rejected because the base template does not provide a finished design system; each fork must develop its own.

### Mandatory Generators

Rejected because they would introduce template-specific knowledge and reduce the value of choosing widely adopted framework conventions.

### Built-In Agent Recipes

Rejected for the base template.

Individual users may add skills or recipes when useful for their own workflows.

### Documentation-Only Enforcement

Rejected because important architectural invariants should be validated mechanically whenever practical.
