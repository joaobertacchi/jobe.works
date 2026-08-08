# ADR 006 — Optimize the Architecture for AI Coding Agents

**Status:** Accepted

## Context

The project is more than a conventional starter template.

It is intended to act as a harness within which AI coding agents create and modify websites.

Agents may include relatively small or inexpensive models rather than only frontier models.

Highly flexible architectures that are comfortable for experienced developers can create unnecessary ambiguity for agents.

## Decision

Agent ergonomics are a first-class architectural requirement.

The project should prefer:

- established technologies;
- highly represented APIs;
- predictable project structures;
- a limited number of valid implementation patterns;
- explicit architectural rules;
- discoverable reusable components;
- deterministic validation;
- actionable validation errors.

LLM familiarity will be an explicit technology-selection criterion.

Where possible, important architectural requirements should be mechanically enforced rather than documented only in prose.

## Rationale

AI agents perform more reliably when:

- conventions are deterministic;
- architecture can be understood from local context;
- existing solutions are easy to discover;
- invalid approaches fail quickly;
- framework and library APIs are strongly represented in training data.

## Consequences

Technology selection will consider not only conventional engineering criteria but also:

- LLM familiarity;
- stale-training risk;
- agent conceptual surface area;
- likelihood of generating obsolete patterns;
- ease of enforcing a safe subset of framework functionality.

For example, Next.js exposes server-side functionality that is incompatible with the project's default deployment model. This does not automatically disqualify Next.js if static purity can instead be enforced deterministically through configuration, linting, architectural validation and the production build.
