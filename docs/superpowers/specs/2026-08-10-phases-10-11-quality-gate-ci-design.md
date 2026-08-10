# Phases 10 and 11 Quality Gate and CI Design

## Scope

Phases 10 and 11 finalize the repository's quality gate and browser-level agent feedback loop as defined by `docs/PHASES.md`, `docs/PRD.md`, and ADR 021.

- Phase 10 completes the canonical local validation command `npm run check`.
- Phase 11 completes the Playwright browser feedback loop and adds the CI workflow that runs the complete validation suite.

The design records two decisions that differ from the default reading of the phase specifications:

- `validate:static` is an alias of `build` because the build step already performs the project-specific static validation automatically.
- The `complexity` capability is provided by the existing `lint` step rather than a separate npm script.

## Current State

The following was already established in previous phases and is verified, not reimplemented:

- `npm run check` currently runs `format:check`, `lint`, `typecheck`, `test`, `coverage`, and `build`.
- Coverage thresholds are `statements 80%`, `branches 75%`, `functions 80%`, `lines 80%` in `vitest.config.ts`.
- Cyclomatic complexity is capped at `10` by the `complexity: ["error", 10]` rule inside `eslint.config.js`, enforced by `lint`.
- The pre-commit hook in `.husky/pre-commit` runs exactly `npm run check` and does not include Playwright.
- The production build performs the project-specific static validation automatically: the `buildEnd` hook in `react-router.config.ts` calls `finalizeStaticBuild`, which validates prerendered artifacts, internal links, localized SEO metadata, `<html lang>`, sitemap, robots, locale directories, and the absence of the server output and SPA fallback.
- `playwright.config.ts` already uses Chromium only, headless by default, and `trace`, `screenshot`, and `video` retained on failure.
- `tests/e2e/fixtures.ts` already fails tests on unexpected `console.error` and `pageerror` messages via an auto fixture used by all specs.
- `npm run test:e2e` and `npm run test:e2e:ui` already exist.
- Browser tests already cover homepage rendering, localized routes, language switching, theme switching, navigation, privacy page rendering, SEO metadata, 404 behavior, and the absence of unexpected browser runtime errors.

## Phase 10 — Complete Quality Gate

### Chosen Approach: `validate:static` as an alias of `build`

The project-specific static validator validates assets that only exist after the production build runs (`build/client`). Those assets are validated automatically during the build itself through the `buildEnd` hook. Factoring the validation into a standalone executable step would add a new script, a way to run TypeScript outside the existing toolchain, and a new dependency, while revalidating the same assets produced by the same step.

The chosen approach treats `validate:static` as the explicit name for the build's automatic validation:

```json
"validate:static": "npm run build"
```

The canonical local validation command becomes:

```json
"check": "npm run format:check && npm run lint && npm run typecheck && npm run test && npm run coverage && npm run validate:static"
```

The `build` capability is exercised inside `validate:static` rather than as a separate step in `check`. ADR 021 states that the exact npm script composition may evolve while the capabilities remain part of the local validation contract; `build` and `validate:static` remain present as capabilities through the alias.

No new dependency is introduced. No validator is extracted, refactored, or duplicated.

### Chosen Approach: `complexity` capability inside `lint`

ADR 021 requires a cyclomatic complexity limit and states "Use ESLint's complexity rule or an equivalent lightweight static check". The complexity rule is already configured in `eslint.config.js` with the accepted maximum of `10` and runs as part of `lint`. A separate `complexity` script would duplicate the same ESLint pass without adding a distinct capability. The `complexity` capability is therefore documented as satisfied by `lint`.

### Unchanged Invariants

- Coverage thresholds remain `80/75/80/80`.
- The cyclomatic complexity maximum remains `10`.
- The pre-commit hook remains exactly `npm run check`; Playwright remains outside the pre-commit hook.
- Validation is not weakened to make changes pass.

## Phase 11 — Complete Playwright and CI Feedback Loop

### Chosen Approach: GitHub Actions workflow

The repository is hosted on GitHub. The CI workflow runs the shared validation baseline rather than reimplementing checks independently:

`.github/workflows/ci.yml`:

- Triggers on push to `main` and on pull requests.
- One job on `ubuntu-latest`:
  1. checkout;
  2. setup-node using `.nvmrc` as the node version file with npm cache;
  3. `npm ci`;
  4. `npm run check`;
  5. `npx playwright install --with-deps chromium`;
  6. `npm run test:e2e`;
  7. upload `playwright-report/` and `test-results/` as artifacts on failure, retained for 7 days, so traces, screenshots, and videos remain available as agent feedback.

The Playwright `webServer` already builds and previews the static output, so browser tests run against the real production artifact.

### Deferred: Consent-Flow Browser Tests

The phase 11 specification lists "consent behavior works" browser tests. Consent infrastructure is assigned to phase 7 and is not yet implemented. The consent-flow browser tests are deferred and will be added as part of the phase 7 implementation; this design records the dependency so the tests are not forgotten.

## Validation

- `npm run check` passes end to end, including the new `validate:static` alias.
- `npm run validate:static` passes when run standalone against a built repository.
- The pre-commit hook still runs `npm run check`.
- `lint` still fails on a cyclomatic complexity violation above `10`.
- `npm run test:e2e` passes locally in headless Chromium.
- The CI workflow is valid YAML and executes the same commands locally in sequence.

## Acceptance Criteria

Phase 10 is complete when:

- `validate:static` is an alias of `build` and `npm run check` includes it;
- `check` no longer calls `build` as a separate step;
- the `complexity` capability is documented as satisfied by `lint`;
- coverage thresholds and the complexity maximum are unchanged;
- the pre-commit hook runs exactly `npm run check` without Playwright; and
- `npm run check` passes.

Phase 11 is complete when:

- `.github/workflows/ci.yml` exists and runs `npm run check` plus `npm run test:e2e`;
- CI uses Chromium only and the node version from `.nvmrc`;
- Playwright failure artifacts are uploaded with a retention policy;
- browser tests cover the representative infrastructure behaviors that exist at this stage;
- consent-flow browser tests are recorded as deferred to phase 7; and
- `npm run test:e2e` passes locally.
