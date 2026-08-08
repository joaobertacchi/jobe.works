# ADR 005 — Backend Is an Explicit Escape Hatch

**Status:** Accepted

## Context

Static marketing sites still need integrations such as:

- contact forms;
- mailing lists;
- analytics;
- CRM submission;
- email services;
- marketing automation.

Some frameworks make creating backend endpoints extremely easy, and AI models may naturally generate them when solving integration problems.

Allowing this behavior by default would undermine the portable static architecture.

## Decision

A project-owned backend is outside the normal architecture.

AI agents must prefer static-compatible solutions.

The expected integration hierarchy is conceptually:

1. browser-native/static solution;
2. browser-safe third-party service;
3. external webhook/automation service;
4. backend or serverless function only when explicitly justified.

Backend/serverless capabilities remain a useful escape hatch for exceptional integration requirements.

They must not be introduced implicitly.

## Rationale

This preserves:

- static deployment;
- architectural simplicity;
- provider neutrality;
- predictable agent behavior.

At the same time, completely forbidding all future backend functionality would make some real-world integrations unnecessarily difficult.

## Consequences

The harness should mechanically reject common accidental backend patterns where practical.

When a backend escape hatch is required, it should constitute an explicit architectural change.
