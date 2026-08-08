# ADR 001 — React as the Foundational UI Technology

**Status:** Accepted

## Context

The project is intended to serve as a reusable foundation for static marketing and content websites, with AI coding agents acting as major consumers of the architecture.

Technology familiarity to AI models is an explicit consideration, particularly because the harness should work reliably with smaller and less expensive models.

## Decision

React will be a foundational dependency of the project.

Frameworks and architectural approaches should therefore provide a natural React development model rather than treating React as an unusual or secondary integration.

## Rationale

React offers:

- extremely broad ecosystem adoption;
- large amounts of public documentation and example code;
- strong representation in LLM training corpora;
- mature tooling;
- broad developer familiarity;
- reusable component abstractions.

These properties are valuable for both humans and AI coding agents.

## Consequences

Framework candidates that do not provide a strong React development experience should receive a significant evaluation penalty.

Framework-specific abstractions remain acceptable when the framework itself is sufficiently widespread.
