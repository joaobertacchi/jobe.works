# ADR 007 — Use React Router Framework with Prerendering

**Status:** Accepted

## Context

The project requires a React-based framework for static marketing/content websites generated and maintained heavily by AI coding agents.

The main framework shortlist was:

- Next.js with static export;
- React Router Framework with prerendering.

Both can satisfy the core technical requirements:

- React as a foundational dependency;
- static HTML/CSS/JS output;
- provider-neutral deployment;
- SEO-friendly prerendered pages;
- localization;
- third-party browser integrations;
- deterministic enforcement of static-site constraints.

The key differentiator is the framework conceptual surface exposed to AI agents.

## Decision

Use **React Router Framework with prerendering** as the application framework.

The architecture will operate without a runtime application server and will prerender all public routes into static output.

## Rationale

React Router Framework exposes a smaller conceptual surface for the intended static-site architecture.

Compared with Next.js App Router, agents generally do not need to reason about:

- Server Components versus Client Components;
- `"use client"` boundaries;
- Server Actions;
- Route Handlers;
- request-time server APIs;
- static versus dynamic rendering semantics across the component tree.

Instead, the primary framework concepts are centered around:

- React;
- route modules;
- explicit route configuration;
- loaders where build-time data is needed;
- prerendering;
- normal client-side React behavior.

This is considered particularly valuable because the harness is intended to work reliably with smaller and less expensive LLMs.

A smaller conceptual surface should reduce:

- required training-data coverage;
- wrong-but-valid framework solutions;
- accidental use of backend functionality;
- context required for routine changes;
- architectural mistakes caused by execution-model confusion.

React Router itself is also very widely adopted and highly represented in public code and model training data.

## Static Architecture

The intended configuration is conceptually:

```ts
{
  ssr: false,
  prerender: true
}
```

All public routes must be included in the prerendered output.

SPA-only routes do not satisfy the project requirements.

Dynamic routes must have their concrete paths known at build time.

## Static-Purity Enforcement

The harness should mechanically enforce:

- `ssr: false`;
- prerendering remains enabled;
- every public route is represented in the static build artifact;
- dynamic routes have build-time-known paths;
- no server-side route actions;
- no project-owned backend assumptions;
- no accidental local `/api/...` dependencies;
- no configuration changes that introduce a runtime server.

The production build and artifact validation will act as final deterministic checks.

## Consequences

### Positive

- Smaller framework-specific conceptual surface for AI agents.
- Normal React interactivity does not require Server/Client Component boundaries.
- Server-side route actions are incompatible with the intended `ssr:false` configuration.
- Static deployment remains provider-neutral.
- Explicit routing can make route architecture easier to inspect mechanically.
- React remains the dominant programming model.

### Negative

- React Router Framework Mode is newer and less represented in model training data than classic React Router APIs.
- Agents may generate Declarative/Data Mode patterns such as `BrowserRouter`, `Routes`, or `createBrowserRouter`.
- Guardrails must therefore enforce Framework Mode conventions.
- The harness must explicitly verify that every public route is prerendered; `ssr:false` alone can otherwise result in SPA behavior.
- Some SEO and static-site conveniences may require more harness-level abstraction than with Next.js.

## Rejected Alternative: Next.js Static Export

Next.js was not rejected because of inability to generate static websites. Its static export mode can satisfy the deployment requirements and static purity can be mechanically enforced.

It was rejected primarily because its larger execution-model surface increases the knowledge and reasoning required from AI agents.

For this project, improving reliability with smaller LLMs is valued more highly than the additional batteries-included functionality provided by Next.js.
