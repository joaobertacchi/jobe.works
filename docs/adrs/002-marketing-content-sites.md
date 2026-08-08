# ADR 002 — Optimize for Marketing and Content Websites

**Status:** Accepted

## Context

The harness could theoretically support everything from landing pages to application-style web products.

Supporting all web architectures would significantly increase complexity and the number of valid patterns available to AI agents.

## Decision

The primary target will be marketing and content-oriented websites.

Examples include:

- company sites;
- product sites;
- consulting/service sites;
- landing pages;
- portfolios;
- blogs and related content.

Application-style websites with significant backend behavior are outside the primary scope.

## Rationale

A narrower product scope makes it possible to:

- favor static generation;
- strongly optimize SEO;
- minimize runtime JavaScript;
- simplify deployment;
- establish stricter architectural rules;
- improve AI-agent predictability.

## Consequences

Capabilities required primarily for dynamic web applications should not influence architectural decisions unless they provide a useful optional escape hatch.
