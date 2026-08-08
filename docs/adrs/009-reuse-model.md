# ADR 009 — Reuse Model: Forkable Template Repository

**Status:** Accepted

## Context

The project is intended to bootstrap multiple independent static marketing/content websites.

Possible reuse models included:

- shared packages;
- monorepo;
- generator/CLI;
- template repository;
- hybrid models.

The priority is to keep adoption simple and avoid introducing package-versioning or cross-site dependency management into the initial architecture.

## Decision

Distribute the project as a **template repository**.

A user creates a new website by forking the template repository.

Each resulting website becomes an independent codebase.

## Rationale

A forkable template provides:

- very low adoption friction;
- no shared runtime or package infrastructure;
- no monorepo requirement;
- no package publication/versioning;
- full freedom for each website to diverge;
- a complete local copy of all agent instructions, design-system code, validation rules, and tooling;
- a simple mental model for AI coding agents.

The template acts as the starting architecture rather than as a continuously linked dependency.

## Consequences

### Positive

- Simple bootstrap workflow.
- Each site is self-contained.
- Sites can evolve independently.
- No coupling between deployments.
- No shared-package release process.
- Agent context is entirely local to the repository.

### Negative

- Improvements made to the template do not automatically propagate to existing forks.
- Security, tooling, architecture, and design-system improvements may need to be manually ported.
- Different sites may gradually diverge from newer template conventions.
- There is no built-in centralized upgrade mechanism.

## Upgrade Policy

Automatic synchronization with the template is not a base requirement.

Existing sites may manually adopt improvements from newer versions of the template when useful.

A future migration or update mechanism may be considered if maintaining multiple forks becomes costly, but it is outside the initial scope.

## Rejected Alternatives

### Shared npm packages

Rejected for the initial architecture because they introduce:

- release management;
- dependency-version coordination;
- package publishing;
- stronger coupling between sites and the harness.

### Monorepo

Rejected because sites are expected to be independent projects rather than components of one centrally managed repository.

### Generator/CLI

Not required for the initial version.

The repository itself is the bootstrap mechanism.

## Bootstrap Flow

Conceptually:

```text
Template repository
       ↓
      fork
       ↓
Independent website repository
       ↓
AI agents + developers customize it
       ↓
Static production build
```
