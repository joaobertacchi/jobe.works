# Phase 10 Quality Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the canonical local validation command so `npm run check` covers the full ADR 021 capability contract with no new dependencies, no new scripts beyond the `validate:static` alias, and unchanged thresholds and pre-commit behavior.

**Architecture:** `validate:static` is an alias of `build` because the `buildEnd` hook in `react-router.config.ts` already runs the project-specific static validation (`finalizeStaticBuild`) automatically. `npm run check` therefore runs `format:check`, `lint`, `typecheck`, `test`, `coverage`, and `validate:static`; the `build` capability is exercised inside `validate:static`. The `complexity` capability remains satisfied by the existing `complexity: ["error", 10]` rule inside `lint`. See `docs/superpowers/specs/2026-08-10-phases-10-11-quality-gate-ci-design.md` for the accepted design and ADR 021 for the validation contract.

**Tech Stack:** npm scripts, ESLint (complexity rule already configured), Vitest (thresholds already configured), React Router production build (static validation already wired via `buildEnd`)

---

## File Structure

- Modify `package.json`: add the `validate:static` alias and replace the standalone `build` step in `check`.
- No application code, test code, or configuration files change. The pre-commit hook, coverage thresholds, complexity maximum, Playwright config, and build pipeline are intentionally untouched.

### Task 1: Add the `validate:static` Alias and Rewire `check`

**Files:**
- Modify: `package.json` (scripts section)

- [ ] **Step 1: Read the current scripts section**

Run: `sed -n '8,22p' package.json`

Expected: `check` currently reads `npm run format:check && npm run lint && npm run typecheck && npm run test && npm run coverage && npm run build`, and there is no `validate:static` script.

- [ ] **Step 2: Add the alias and rewire `check`**

Replace the `check` script and append `validate:static` after `typecheck` (alphabetical order), so the scripts section reads:

```json
  "scripts": {
    "build": "react-router build",
    "check": "npm run format:check && npm run lint && npm run typecheck && npm run test && npm run coverage && npm run validate:static",
    "coverage": "vitest run --coverage",
    "dev": "react-router dev",
    "format": "prettier --write . --ignore-unknown",
    "format:check": "prettier --check . --ignore-unknown",
    "lint": "eslint .",
    "prepare": "husky",
    "preview": "sirv build/client --dev --host 127.0.0.1 --port 4173",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "typecheck": "react-router typegen && tsc",
    "validate:static": "npm run build"
  },
```

Note: `npm run validate:static` runs the production build; the `buildEnd` hook then performs the project-specific static validation automatically. Do not add a separate validator script, a TypeScript runner, or a new dependency.

- [ ] **Step 3: Verify `validate:static` works standalone**

Run: `npm run validate:static`

Expected: the production build succeeds, prerenders all public routes, and the static validation runs without errors. The command exits `0`.

- [ ] **Step 4: Verify the full `check` pipeline**

Run: `npm run check`

Expected, in order: Prettier formatting check, ESLint, React Router type generation + `tsc`, Vitest (248 tests), Vitest coverage (thresholds 80/75/80/80 pass), and finally `validate:static` (which runs the production build with prerendering and static validation). The entire pipeline exits `0`.

- [ ] **Step 5: Verify the pre-commit hook is unchanged**

Run: `cat .husky/pre-commit`

Expected output is exactly:

```bash
npm run check
```

The hook must not include Playwright. Do not modify it.

- [ ] **Step 6: Verify the `complexity` capability is still enforced by `lint`**

Create a temporary probe file `scripts/complexity-probe.ts`:

```ts
export function probe(input: number): string {
  if (input === 1) return "one";
  if (input === 2) return "two";
  if (input === 3) return "three";
  if (input === 4) return "four";
  if (input === 5) return "five";
  if (input === 6) return "six";
  if (input === 7) return "seven";
  if (input === 8) return "eight";
  if (input === 9) return "nine";
  if (input === 10) return "ten";
  return "many";
}
```

Run: `npm run lint`

Expected: ESLint fails on `scripts/complexity-probe.ts` with `Function 'probe' has a complexity of 11. Maximum allowed is 10.` — proving the complexity capability is enforced by `lint`.

Delete the probe file: `rm scripts/complexity-probe.ts`

Run: `npm run lint`

Expected: lint passes again.

- [ ] **Step 7: Verify the coverage thresholds are unchanged**

Run: `grep -n "statements\|branches\|functions\|lines" vitest.config.ts`

Expected: thresholds `statements: 80`, `branches: 75`, `functions: 80`, `lines: 80`. Do not alter them.

- [ ] **Step 8: Commit**

```bash
git add package.json
git commit -m "chore: finalize npm run check quality gate"
```

Expected: the pre-commit hook runs `npm run check` automatically and the commit succeeds.

### Task 2: Confirm Phase 10 Acceptance Criteria

**Files:**
- None (verification only)

- [ ] **Step 1: Verify all acceptance criteria from the design document**

Run: `grep -A 10 "Phase 10 is complete when" docs/superpowers/specs/2026-08-10-phases-10-11-quality-gate-ci-design.md`

Expected:

- `validate:static` is an alias of `build` and `npm run check` includes it — verified in Task 1 Step 2;
- `check` no longer calls `build` as a separate step — verified in Task 1 Step 2;
- the `complexity` capability is documented as satisfied by `lint` — recorded in the design document and enforced in Task 1 Step 6;
- coverage thresholds and the complexity maximum are unchanged — verified in Task 1 Steps 6-7;
- the pre-commit hook runs exactly `npm run check` without Playwright — verified in Task 1 Step 5; and
- `npm run check` passes — verified in Task 1 Step 4.

- [ ] **Step 2: Report completion**

Summarize for the caller: scripts changed, verification results, and that no thresholds, hooks, or validation were weakened. Run `npm run test:e2e` only if the caller asks; it is not part of this phase's gate.
