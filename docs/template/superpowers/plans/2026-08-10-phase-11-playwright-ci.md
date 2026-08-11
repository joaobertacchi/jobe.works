# Phase 11 Playwright and CI Feedback Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the browser-level agent feedback loop by adding the CI workflow that runs the canonical validation suite (`npm run check` plus `npm run test:e2e`), while the Playwright configuration itself is already compliant.

**Architecture:** The Playwright configuration, browser-error detection, and representative browser tests already exist and are verified unchanged. The only deliverable is `.github/workflows/ci.yml`, a GitHub Actions workflow that runs the shared `npm run check` baseline (ADR 021: CI does not reimplement checks), installs the Chromium browser, runs the e2e suite, and uploads failure artifacts (traces, screenshots, videos) for agent debugging. Consent-flow browser tests are intentionally deferred to phase 7 and recorded in the design document. See `docs/template/superpowers/specs/2026-08-10-phases-10-11-quality-gate-ci-design.md` for the accepted design.

**Tech Stack:** GitHub Actions, Node.js 22 (`.nvmrc`), Playwright (Chromium only, headless), npm

---

## File Structure

- Create `.github/workflows/ci.yml`: the complete validation CI workflow.
- No changes to `playwright.config.ts`, `tests/e2e/*`, `package.json`, or the pre-commit hook.

### Task 1: Add the CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci

      - run: npm run check

      - run: npx playwright install --with-deps chromium

      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-failure-artifacts
          path: |
            playwright-report/
            test-results/
          retention-days: 7
```

Notes:

- The node version comes from `.nvmrc` (22.22.2) — no hardcoded version.
- `npm run check` is the shared baseline; CI does not reimplement any check.
- `playwright-report/` and `test-results/` match the Playwright output directories configured in `playwright.config.ts` (`reporter` and `outputDir`).
- Artifacts upload only on failure (`if: failure()`), so agents receive traces, screenshots, and videos as feedback.

- [ ] **Step 2: Validate the workflow file**

Run: `npx prettier --check .github/workflows/ci.yml`

Expected: `All matched files use Prettier code style!` — the file is valid YAML with the project's formatting.

- [ ] **Step 3: Verify Playwright output directories match the artifact paths**

Run: `grep -n "outputDir\|reporter" playwright.config.ts`

Expected: `outputDir: "test-results"` and `reporter: [["html", { open: "never" }]]`. The HTML reporter writes to `playwright-report/` by default, matching the artifact paths in the workflow.

- [ ] **Step 4: Rehearse the CI command sequence locally**

Run:

```bash
npm run check
```

Expected: the full quality gate passes (see Phase 10 plan for the expected output).

Run:

```bash
npx playwright install chromium
```

Expected: Chromium is present or installed without error.

Run:

```bash
npm run test:e2e
```

Expected: the Playwright `webServer` starts `npm run build && npm run preview`, and all e2e specs pass in headless Chromium. No unexpected `console.error` or `pageerror` occurs (the auto fixture in `tests/e2e/fixtures.ts` enforces this). The suite exits `0`.

- [ ] **Step 5: Confirm the deferred consent tests are recorded**

Run: `grep -A 5 "Deferred: Consent-Flow Browser Tests" docs/template/superpowers/specs/2026-08-10-phases-10-11-quality-gate-ci-design.md`

Expected: the design document records that consent-flow browser tests are deferred to phase 7 because consent infrastructure does not exist yet. No consent tests are added in this phase.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add validation workflow for check and e2e"
```

Expected: the pre-commit hook runs `npm run check` automatically and the commit succeeds.

### Task 2: Confirm Phase 11 Acceptance Criteria

**Files:**
- None (verification only)

- [ ] **Step 1: Verify all acceptance criteria from the design document**

Run: `grep -A 10 "Phase 11 is complete when" docs/template/superpowers/specs/2026-08-10-phases-10-11-quality-gate-ci-design.md`

Expected:

- `.github/workflows/ci.yml` exists and runs `npm run check` plus `npm run test:e2e` — verified in Task 1 Steps 1-4;
- CI uses Chromium only and the node version from `.nvmrc` — verified in Task 1 Step 1;
- Playwright failure artifacts are uploaded with a retention policy — verified in Task 1 Step 1;
- browser tests cover the representative infrastructure behaviors that exist at this stage — verified by the passing e2e suite in Task 1 Step 4 (homepage, localized routes, language switch, theme switching, navigation, privacy page, no unexpected runtime errors);
- consent-flow browser tests are recorded as deferred to phase 7 — verified in Task 1 Step 5; and
- `npm run test:e2e` passes locally — verified in Task 1 Step 4.

- [ ] **Step 2: Report completion**

Summarize for the caller: the workflow file added, the locally rehearsed command sequence, and that no Playwright configuration or test files were changed because they already satisfied the phase specification.
