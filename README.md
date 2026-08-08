# AI-Agent Static Website Template

A React Router Framework foundation for building localized static marketing and content websites with AI coding agents.

## Requirements

- Node.js 22.22.2+, 24.15.0+, or 26+
- npm

## Commands

```bash
npm ci                 # install the locked dependency graph
npm run dev            # start local development
npm run check          # run the canonical local quality gate
npm run test:e2e       # build and test with headless Chromium
npm run test:e2e:ui    # open Playwright's interactive UI
npm run format         # write Prettier formatting
npm run build          # produce the static artifact
npm run preview        # serve the built static artifact locally
```

## Static Output

`npm run build` writes the deployable website to `build/client`. Serve that directory with a conventional static web server. Production does not require Node.js, React Router server packages, or an application runtime.

Unknown paths must be handled as normal static-server 404 responses; do not configure an SPA fallback.

## Architecture

Read `AGENTS.md` before making changes. Product requirements are in `docs/PRD.md`, decision status is in `docs/decisions_list.md`, and accepted decisions are under `docs/adrs/`.

CI wiring is deferred beyond Phase 0.
