# Agent Instructions

## Project

This repository is an AI-agent harness for localized static marketing and content websites. Product requirements are in `docs/PRD.md`; accepted architecture decisions under `docs/adrs/` are authoritative.

## Invariants

- Use React Router Framework Mode with TypeScript.
- Keep `ssr: false` and prerender every public route.
- Production output must remain static and deployable without Node.js.
- Do not add a backend, serverless function, route action, local API, or runtime server without explicit authorization and an ADR.
- Keep user-facing page copy in typed localization dictionaries once the localization layer is introduced.
- Keep SEO metadata explicit and localized once the SEO layer is introduced.
- Reuse existing components and patterns before adding abstractions or dependencies.
- Centralize integrations and analytics behind their established project boundaries once introduced.
- Never expose secrets in frontend code.

## Workflow

1. Activate the Node.js version in `.nvmrc` before installing dependencies or running validation.
2. Read the relevant accepted ADRs before changing architecture.
3. Follow existing working examples.
4. Add or update meaningful tests with behavior changes.
5. Run `npm run check` and fix root causes before completion.
6. Run `npm run test:e2e` for browser-relevant changes.
7. Do not weaken validation, thresholds, or hooks to make changes pass.

CI wiring and later architectural layers are intentionally introduced in subsequent phases.
