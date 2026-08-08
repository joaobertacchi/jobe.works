# Phase 0 Repository and Toolchain Foundation Design

## Scope

Phase 0 establishes the minimum production-quality project and validation foundation described by `docs/PRD.md`, `docs/decisions_list.md`, and the accepted ADRs. It does not implement later-phase website architecture.

CI wiring is explicitly deferred to a later phase. The complete static validator, localization architecture, theme system, SEO system, analytics, consent, integrations, and final site design are also outside this phase.

## Approach

Surgically retrofit the existing generated React Router project rather than regenerate it. This retains useful Framework Mode scaffolding and the committed locale work while minimizing unrelated churn.

The npm package manager and current dependency major versions remain in place unless compatibility requires a change.

## Application Foundation

React Router remains in Framework Mode with React, TypeScript, Vite, and Tailwind CSS v4. Production configuration will use `ssr: false` with explicit prerendering so every current public route produces static HTML and the deployable artifact does not require Node.js or a framework server.

Server-only dependencies, runtime scripts, Docker runtime files, and server-oriented documentation will be removed or corrected where they conflict with the accepted static-output and provider-neutral deployment decisions.

The generated demo page remains as the Phase 0 smoke-test surface. Existing incomplete localization files are preserved but not expanded because localization behavior belongs to a later phase.

## Quality Harness

The initial `npm run check` will run the checks meaningful in Phase 0:

1. Prettier formatting verification.
2. ESLint for JavaScript, TypeScript, React correctness, and a maximum cyclomatic complexity of 10.
3. React Router type generation and TypeScript checking without emit.
4. Vitest unit and component tests.
5. Coverage with global thresholds of 80% statements, 75% branches, 80% functions, and 80% lines.
6. A production build.
7. A lightweight Phase 0 artifact finalizer that asserts the prerendered entry HTML exists and removes build-time server and SPA-fallback output from the deployable artifact.

Prettier will also expose a separate write command. Validation failures must be fixed at their source; rules and thresholds will not be weakened.

## Testing

Vitest will use jsdom and React Testing Library. One meaningful component smoke test will verify the existing page behavior and prove the unit-test setup works.

Playwright will use Chromium only and run headlessly by default. It will retain traces and videos on failure and screenshots only on failure. Browser tests will load the production artifact through a conventional static server without history fallback, proving Chromium can launch, the artifact does not depend on a React Router application runtime, and unknown paths return 404.

The repository will expose automated and interactive Playwright scripts. Playwright remains outside `npm run check`, matching ADR 021.

## Pre-Commit Validation

Husky will install a mandatory pre-commit hook. The hook will invoke exactly `npm run check` so there is no weaker duplicate validation contract.

## Repository Boundaries

Only files required by the Phase 0 vertical slice will be added: quality-tool configuration, test setup, one component test, one Playwright test, hook infrastructure, and concise root documentation. Future application-layer directories will not be created early.

A concise root `AGENTS.md` will describe the operational rules that already apply and point agents to the authoritative product and architecture documents. `README.md` will document installation, development, validation, testing, build output, and static serving without duplicating ADR rationale.

## Acceptance Criteria

Phase 0 is complete when:

- `npm ci` installs successfully from the lockfile;
- formatting verification passes;
- ESLint and complexity checks pass;
- TypeScript checking passes;
- the Vitest runner and React Testing Library test pass;
- coverage meets the accepted thresholds;
- the production build emits a static deployable artifact;
- `npm run check` passes as the canonical local gate;
- the pre-commit hook runs `npm run check`;
- Playwright launches headless Chromium and passes against the static artifact;
- no production Node.js or application-server runtime is required; and
- no CI workflow or later-phase architecture is introduced.
