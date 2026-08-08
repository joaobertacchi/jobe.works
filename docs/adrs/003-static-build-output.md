# ADR 003 — Require a Pure Static Production Artifact

**Status:** Accepted

## Context

The project should have a simple and portable deployment model.

The representative deployment environment consists of nginx serving the website, with Cloudflare providing HTTPS, caching and CDN functionality.

## Decision

The production build must generate a complete static artifact consisting of HTML, CSS, JavaScript and static assets.

Serving the resulting website must not require:

- Node.js;
- a framework runtime;
- an application server;
- request-time server rendering.

Every public route must ultimately be representable in the static build output.

## Rationale

This provides:

- provider-neutral deployment;
- simple hosting;
- low infrastructure requirements;
- strong cacheability;
- straightforward local production simulation;
- fewer deployment decisions for AI agents;
- deterministic verification that the website can run independently from its build framework.

## Consequences

Framework features that require request-time server behavior must be disabled or forbidden.

Static-build validation will be part of the quality pipeline.
