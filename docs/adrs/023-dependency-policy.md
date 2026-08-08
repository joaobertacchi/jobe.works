# ADR 023 — Dependency Policy

**Status:** Accepted

## Context

The project is an AI-agent harness for creating static websites.

AI agents can easily introduce unnecessary complexity by:

- reinventing functionality that already exists in mature libraries;
- adding dependencies without understanding their tradeoffs;
- increasing the project's conceptual surface;
- choosing libraries that duplicate existing ecosystem capabilities.

At the same time, avoiding all dependencies is also harmful.

Mature libraries often provide:

- better reliability;
- better security;
- better browser compatibility;
- better maintenance;
- less custom code for agents and humans to understand.

The goal is therefore not to minimize dependency count, but to make dependency decisions intentional.

## Decision

Dependencies should be added when they provide meaningful value, but every new dependency requires justification.

The default decision process is:

```text id="qf6x9t"
Need identified
      ↓
Check existing ecosystem capabilities
      ↓
Evaluate available solutions
      ↓
Choose build vs buy
      ↓
Add dependency if justified
```

## Build vs Buy

Agents and developers should prefer established libraries over custom implementations when the library provides a mature solution to the problem.

Examples:

Prefer:

```text id="l6m0sl"
React Router
instead of
custom routing system

Vitest
instead of
custom test runner

TailwindCSS
instead of
custom utility CSS framework
```

However, introducing a dependency is not automatically better than writing code.

The decision must consider:

- complexity added;
- maintenance cost;
- ecosystem maturity;
- bundle impact;
- API quality;
- compatibility with the project architecture;
- impact on AI-agent understanding.

## Dependency Justification

Before adding a dependency, the implementation should document:

- the problem being solved;
- alternatives considered;
- why the selected dependency is preferred;
- why a custom implementation is not preferable.

The justification does not need to be a formal document for every small utility dependency.

The reasoning must simply be available during review.

## Prefer Existing Ecosystem Capabilities

Agents should first look for capabilities already provided by the existing stack.

Examples:

Before adding:

```text id="o3j4cg"
another routing library
```

check whether React Router already solves the requirement.

Before adding:

```text id="1w7d5h"
another styling abstraction
```

check whether TailwindCSS and existing design-system patterns solve it.

Before adding:

```text id="h8r6xk"
another validation mechanism
```

check whether existing project tooling already provides the needed guarantee.

The goal is to avoid overlapping solutions.

## Major Architectural Dependencies

Major architectural dependencies require an ADR.

Examples include dependencies that affect:

- application framework;
- routing model;
- rendering strategy;
- styling architecture;
- state-management approach;
- localization architecture;
- testing architecture;
- deployment model;
- major build tooling.

Examples:

Adding:

```text id="2bqj5n"
React Router Framework
```

requires architectural consideration.

Adding:

```text id="s6h3zq"
a small date-formatting utility
```

normally does not.

## Dependency Categories

Dependencies should be considered according to their impact.

### Architectural Dependencies

Require ADR.

Characteristics:

- influence project structure;
- create new conventions;
- affect how agents implement future work;
- introduce a new primary abstraction.

### Feature Dependencies

Require justification but normally do not require ADR.

Examples:

- form provider SDK;
- analytics SDK;
- email integration library;
- image processing utility.

### Utility Dependencies

Require normal review judgment.

Examples:

- small parsing libraries;
- focused helper utilities.

The project should avoid adding dependencies merely because they remove a few lines of simple code.

## Dependency Selection Criteria

When evaluating a dependency, consider:

### Ecosystem Adoption

Prefer widely adopted libraries when they solve the problem well.

This improves:

- documentation availability;
- AI model familiarity;
- community support;
- long-term maintainability.

### Conceptual Surface

A dependency should reduce overall complexity.

A library that adds a new abstraction requiring extensive project-specific knowledge may be worse than a small local implementation.

### Maintenance

Consider:

- project activity;
- release history;
- compatibility;
- security posture.

### Agent Compatibility

Because the repository is designed for AI agents, prefer technologies with:

- strong documentation;
- common patterns;
- predictable APIs;
- broad training-data coverage.

## No Dependency Approval Workflow

The template does not introduce a formal approval system for every dependency.

The required control is architectural review and justification.

The objective is informed decision-making, not bureaucracy.

## Automated Dependency Checks

The base template does not require automated dependency governance checks.

It does not include mandatory automation for:

- vulnerability scanning;
- license checks;
- unused dependency detection;
- dependency age checks;
- bundle-size enforcement.

These may be introduced by individual projects if their requirements justify them.

## Security

Security considerations remain important.

A dependency decision should consider known security concerns, but the base template does not prescribe a specific security scanning workflow.

## Agent Guidance

AI agents adding dependencies should:

1. first check whether the current stack already provides the capability;
2. prefer established ecosystem solutions over custom implementations;
3. explain the build-vs-buy tradeoff;
4. avoid adding dependencies merely for convenience;
5. avoid introducing duplicate solutions;
6. identify whether the dependency is architectural;
7. create an ADR before introducing a major architectural dependency;
8. preserve the project's small conceptual surface.

## Dependency Review Examples

Good:

```text id="t6f2kl"
Need:
Generate charts.

Evaluation:
- Custom SVG implementation
- Established chart libraries

Decision:
Use chart library because it provides accessibility,
interaction support, and reduces custom code.
```

Poor:

```text id="8v5k2p"
Need:
Format one string.

Decision:
Add large utility framework.
```

## Consequences

### Positive

- Avoids unnecessary reinvention.
- Encourages use of mature ecosystem solutions.
- Keeps architectural decisions explicit.
- Prevents uncontrolled dependency growth.
- Improves AI-agent success by favoring familiar tools.
- Preserves a manageable conceptual surface.

### Negative

- Dependency decisions require thought before implementation.
- Some small additions may require discussion.
- The project may occasionally implement small functionality instead of adding a package.
- No automated dependency governance exists by default.

These tradeoffs are accepted because intentional dependency management is more valuable than either extreme:
- zero dependencies;
- uncontrolled dependency accumulation.

## Rejected Alternatives

### Avoid Dependencies Whenever Possible

Rejected because mature libraries often provide better outcomes than custom implementations.

### Allow Agents to Add Any Dependency

Rejected because agents may optimize for immediate implementation speed while increasing long-term complexity.

### Maintain a Strict Approved Dependency List

Rejected because the template is intended to evolve and different forks may have different legitimate needs.

### Require ADR for Every Dependency

Rejected because small utility dependencies do not materially affect architecture.

### Automated Dependency Policy Enforcement

Rejected for the base template because the complexity is not justified initially.

## Future Evolution

The project may introduce stronger dependency governance if experience shows a need, such as:

- approved dependency categories;
- automated security checks;
- bundle-size budgets;
- dependency review tooling.

Such additions should be driven by real project requirements.
