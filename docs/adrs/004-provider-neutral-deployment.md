# ADR 004 — Provider-Neutral Deployment

**Status:** Accepted

## Context

Some frameworks provide especially convenient deployment when coupled with a specific hosting provider.

The intended deployment model must not require such coupling.

A representative self-hosted deployment is:

```text
Static artifacts
      ↓
nginx
      ↓
Cloudflare
```

## Decision

The generated production artifact must be deployable using a generic static web server.

No hosting vendor may be required for correctness.

Provider-specific deployment integrations may exist as optional conveniences.

## Rationale

This provides:

- deployment freedom;
- compatibility with homelab infrastructure;
- lower vendor coupling;
- simple nginx deployment;
- compatibility with Cloudflare CDN/cache;
- compatibility with conventional static hosts.

## Consequences

Framework evaluations must distinguish between:

- convenience when deployed to a preferred platform; and
- ability to produce a portable static artifact.

The latter is mandatory.
