# Phase 0 Repository and Toolchain Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a pure-static React Router Framework foundation with deterministic local validation, unit/component coverage, headless Chromium testing, and mandatory pre-commit checks.

**Architecture:** Retrofit the existing React Router v8 starter instead of regenerating it. Configure Framework Mode with `ssr: false` and `prerender: true`, then finalize the client artifact by removing React Router's build-time server output and generated SPA fallback. Keep each quality tool conventional and independently runnable, with `npm run check` as the single local gate.

**Tech Stack:** React 19, React Router Framework 8, TypeScript 5.9, Vite 8, Tailwind CSS 4, ESLint 10, Prettier 3, Vitest 4, React Testing Library 16, Playwright 1.62, Husky 9, npm

---

## File Map

- Modify `package.json`: declare the Node requirement, remove server runtime packages, and define all Phase 0 scripts and development dependencies.
- Modify `package-lock.json`: lock the resulting npm dependency graph.
- Create `.nvmrc`: identify a React Router-compatible Node release.
- Create `eslint.config.js`: configure JavaScript, TypeScript, React Hooks, and complexity checks.
- Create `.prettierrc.json`: define deterministic formatting.
- Create `.prettierignore`: exclude generated artifacts and authoritative imported documents from formatting churn.
- Modify `.gitignore`: ignore test, coverage, and Playwright artifacts.
- Modify `app/locales/index.ts`, `app/locales/types.ts`, `app/locales/en-US.ts`, and `app/locales/pt-BR.ts`: make existing committed locale scaffolding satisfy the new quality gate without expanding localization behavior.
- Modify `app/routes/home.tsx`: remove the generated unused metadata argument rejected by ESLint.
- Create `vitest.config.ts`: configure jsdom, setup, V8 coverage, and accepted thresholds.
- Create `tests/setup.ts`: install React Testing Library DOM matchers.
- Create `app/routes/home.test.tsx`: prove Vitest and React Testing Library work against the existing page.
- Modify `react-router.config.ts`: disable runtime SSR and prerender every current static route.
- Create `scripts/finalize-static-build.mjs`: enforce the Phase 0 static artifact shape and remove the generated SPA fallback.
- Create `scripts/finalize-static-build-cli.mjs`: apply artifact finalization to the production build.
- Create `scripts/finalize-static-build.test.mjs`: test artifact finalization behavior before implementation.
- Create `playwright.config.ts`: configure Chromium, static preview serving, and retained failure evidence.
- Create `tests/e2e/fixtures.ts`: fail browser tests on unexpected console or page errors.
- Create `tests/e2e/home.spec.ts`: exercise the prerendered homepage in Chromium.
- Create `.husky/pre-commit`: invoke the canonical local gate.
- Create `AGENTS.md`: provide concise operational instructions.
- Replace `README.md`: document the static development and validation workflow.
- Delete `Dockerfile` and `.dockerignore`: remove the generated Node application-server deployment path.

### Task 1: Establish Runtime, Formatting, and Linting

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `.nvmrc`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `.gitignore`
- Modify: `app/locales/index.ts`
- Modify: `app/locales/types.ts`
- Modify: `app/locales/en-US.ts`
- Modify: `app/locales/pt-BR.ts`
- Modify: `app/routes/home.tsx`

- [ ] **Step 1: Select a supported Node runtime**

Create `.nvmrc`:

```text
22.22.2
```

Add this top-level field to `package.json`:

```json
"engines": {
  "node": ">=22.22.2"
}
```

Run: `node --version`

Expected: Node `v22.22.2` or newer. If the shell still reports the repository's current `v22.14.0`, activate the version from `.nvmrc` before dependency installation; do not weaken the engine requirement. Node `22.22.2` is the minimum version shared by React Router 8 and jsdom 30.

- [ ] **Step 2: Remove production server dependencies and install the accepted quality tools**

Run:

```bash
npm uninstall @react-router/node @react-router/serve
npm install --save-dev @eslint/js@^10 eslint@^10 eslint-config-prettier@^10 eslint-plugin-react-hooks@^7 globals@^17 prettier@^3 typescript-eslint@^8 vitest@^4 @vitest/coverage-v8@^4 jsdom@^30 @testing-library/react@^16 @testing-library/jest-dom@^7 @playwright/test@^1.62 husky@^9
```

Expected: `package.json` has no production server-runtime packages. React Router may retain `isbot` for its build-time prerender entry; it is not used by the deployed static artifact. `package-lock.json` updates successfully with no engine warning under the selected Node version.

- [ ] **Step 3: Define the Phase 0 scripts**

Replace the `scripts` object in `package.json` with:

```json
"scripts": {
  "build": "react-router build",
  "check": "npm run format:check && npm run lint && npm run typecheck && npm run test && npm run coverage && npm run build",
  "coverage": "vitest run --coverage",
  "dev": "react-router dev",
  "format": "prettier --write . --ignore-unknown",
  "format:check": "prettier --check . --ignore-unknown",
  "lint": "eslint .",
  "prepare": "husky",
  "preview": "vite preview --outDir build/client --host 127.0.0.1 --port 4173 --strictPort",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "typecheck": "react-router typegen && tsc"
}
```

Expected: there is no `start` script pointing to a React Router server, and Playwright is not part of `check`.

- [ ] **Step 4: Add deterministic formatter configuration**

Create `.prettierrc.json`:

```json
{
  "endOfLine": "lf",
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

Create `.prettierignore`:

```text
.agents/
.react-router/
build/
coverage/
node_modules/
playwright-report/
test-results/
package-lock.json
docs/PRD.md
docs/decisions_list.md
docs/adrs/
```

The accepted product and ADR documents are ignored to avoid unrelated reformatting; new project-owned documentation remains checked.

- [ ] **Step 5: Add flat ESLint configuration**

Create `eslint.config.js`:

```js
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".react-router/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      complexity: ["error", 10],
    },
  },
  prettier,
]);
```

- [ ] **Step 6: Make the committed locale scaffolding lint-safe without implementing localization**

Use type-only imports and replace the empty object type in both locale files and `app/locales/types.ts`:

```ts
// app/locales/en-US.ts and app/locales/pt-BR.ts
import type { Translation } from "./types";

const locale: Translation = {};

export default locale;
```

```ts
// app/locales/types.ts
type Plural = {
  zero: string;
  one: string;
  other: string;
};

export type Translation = Record<never, never>;

type Paths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Plural
    ? `${Prefix}${K & string}`
    : T[K] extends Record<string, unknown>
      ? Paths<T[K], `${Prefix}${K & string}.`>
      : `${Prefix}${K & string}`;
}[keyof T];

export type LocaleScope = Paths<Translation>;
```

Update imports in `app/locales/index.ts` to double quotes and type-only imports, and export the existing map so it is not dead code:

```ts
import en from "./en-US";
import ptBR from "./pt-BR";
import type { Translation } from "./types";

export const translations = {
  en,
  "pt-BR": ptBR,
} satisfies Record<string, Translation>;
```

Remove the unused generated metadata argument and its now-unused type import from `app/routes/home.tsx`:

```tsx
import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
```

- [ ] **Step 7: Ignore generated quality artifacts and run the initial gate**

Append to `.gitignore`:

```text
/coverage/
/playwright-report/
/test-results/
```

Run:

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
```

Expected: all four commands exit `0`; fix source violations rather than changing rules.

- [ ] **Step 8: Commit the toolchain baseline**

```bash
git add .nvmrc .gitignore .prettierignore .prettierrc.json eslint.config.js package.json package-lock.json app/locales app/routes/home.tsx
git commit -m "build: add phase 0 quality tooling"
```

### Task 2: Add Vitest, React Testing Library, and Coverage

**Files:**

- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `app/routes/home.test.tsx`

- [ ] **Step 1: Add the component smoke test**

Create `app/routes/home.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home, { meta } from "./home";

describe("home route", () => {
  it("renders the starter page and its metadata", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("What's next?")).toBeVisible();
    expect(meta()).toContainEqual({
      title: "New React Router App",
    });
  });
});
```

This is a characterization test for generated code, not a behavior change. Its purpose is to prove the test harness and preserve the current smoke surface.

- [ ] **Step 2: Run the test before configuring Vitest**

Run: `npm run test -- app/routes/home.test.tsx`

Expected: FAIL because jsdom/setup is not configured, demonstrating that the Phase 0 test harness is incomplete.

- [ ] **Step 3: Configure Vitest and DOM matchers**

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

- [ ] **Step 4: Verify unit tests and coverage**

Run:

```bash
npm run test
npm run coverage
```

Expected: the home route test passes and all four global coverage thresholds pass. Coverage uses Vitest 4's V8 provider and includes imported source files; do not add exclusions to make it pass.

- [ ] **Step 5: Commit the unit-test harness**

```bash
git add vitest.config.ts tests/setup.ts app/routes/home.test.tsx
git commit -m "test: add unit and component harness"
```

### Task 3: Produce and Enforce a Pure Static Artifact

**Files:**

- Modify: `package.json`
- Modify: `react-router.config.ts`
- Create: `scripts/finalize-static-build.test.mjs`
- Create: `scripts/finalize-static-build.mjs`
- Create: `scripts/finalize-static-build-cli.mjs`
- Delete: `Dockerfile`
- Delete: `.dockerignore`

- [ ] **Step 1: Write failing artifact-finalization tests**

Create `scripts/finalize-static-build.test.mjs`:

```js
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { finalizeStaticBuild } from "./finalize-static-build.mjs";

function createBuildDirectory() {
  const root = mkdtempSync(join(tmpdir(), "static-build-"));
  const client = join(root, "client");
  mkdirSync(client);
  return { client, root };
}

describe("finalizeStaticBuild", () => {
  it("rejects a build without prerendered entry HTML", () => {
    const { client } = createBuildDirectory();

    expect(() => finalizeStaticBuild(client)).toThrow(
      "Missing prerendered entry: build/client/index.html",
    );
  });

  it("removes the build-time server artifact", () => {
    const { client, root } = createBuildDirectory();
    writeFileSync(join(client, "index.html"), "<!doctype html>");
    const server = join(root, "server");
    mkdirSync(server);

    finalizeStaticBuild(client);

    expect(existsSync(server)).toBe(false);
  });

  it("removes the generated SPA fallback", () => {
    const { client } = createBuildDirectory();
    writeFileSync(join(client, "index.html"), "<!doctype html>");
    const fallback = join(client, "__spa-fallback.html");
    writeFileSync(fallback, "<!doctype html>");

    finalizeStaticBuild(client);

    expect(existsSync(fallback)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the artifact test and verify RED**

Run: `npm run test -- scripts/finalize-static-build.test.mjs`

Expected: FAIL because `scripts/finalize-static-build.mjs` does not exist.

- [ ] **Step 3: Implement the minimal artifact finalizer**

Create `scripts/finalize-static-build.mjs`:

```js
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

export function finalizeStaticBuild(clientDirectory) {
  const entry = join(clientDirectory, "index.html");
  if (!existsSync(entry)) {
    throw new Error("Missing prerendered entry: build/client/index.html");
  }

  const serverDirectory = join(dirname(clientDirectory), "server");
  rmSync(serverDirectory, { force: true, recursive: true });
  rmSync(join(clientDirectory, "__spa-fallback.html"), { force: true });
}
```

Create `scripts/finalize-static-build-cli.mjs`:

```js
import { fileURLToPath } from "node:url";

import { finalizeStaticBuild } from "./finalize-static-build.mjs";

finalizeStaticBuild(fileURLToPath(new URL("../build/client", import.meta.url)));
```

- [ ] **Step 4: Wire artifact finalization into the build**

Change the `build` script in `package.json` to:

```json
"build": "react-router build && node scripts/finalize-static-build-cli.mjs"
```

- [ ] **Step 5: Verify GREEN**

Run: `npm run test -- scripts/finalize-static-build.test.mjs`

Expected: PASS with all three artifact behaviors verified.

- [ ] **Step 6: Configure React Router's documented static mode**

Replace `react-router.config.ts` with:

```ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: true,
} satisfies Config;
```

This follows the installed React Router v8 Framework Mode documentation: `ssr: false` disables runtime SSR, while `prerender: true` emits every current static route.

- [ ] **Step 7: Remove generated server-runtime deployment files**

Delete `Dockerfile` and `.dockerignore`. They describe and package a Node application server, which is not a valid deployment path for this template.

- [ ] **Step 8: Build and inspect the static output**

Run:

```bash
npm run build
test -f build/client/index.html
test ! -d build/server
test ! -f build/client/__spa-fallback.html
```

Expected: all commands exit `0`; React Router logs prerendering of `/`; only static client assets remain after finalization.

- [ ] **Step 9: Run regression checks**

Run:

```bash
npm run test
npm run coverage
npm run typecheck
npm run lint
```

Expected: all commands pass with no warnings or errors.

- [ ] **Step 10: Commit the static build**

```bash
git add react-router.config.ts scripts package.json Dockerfile .dockerignore
git commit -m "build: enforce pure static output"
```

### Task 4: Add Headless Chromium Validation

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/e2e/fixtures.ts`
- Create: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Install the Chromium browser binary**

Run: `npx playwright install chromium`

Expected: Playwright reports Chromium installed or already present without installing Firefox or WebKit.

- [ ] **Step 2: Write the browser smoke test and error fixture**

Create `tests/e2e/fixtures.ts`:

```ts
import { expect, test as base } from "@playwright/test";

export const test = base.extend<{ browserErrors: void }>({
  browserErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await use();

      expect(errors, "unexpected browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
```

Create `tests/e2e/home.spec.ts`:

```ts
import { expect, test } from "./fixtures";

test("loads the prerendered homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("New React Router App");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByText("What's next?")).toBeVisible();
});
```

- [ ] **Step 3: Run the browser test before configuration and verify RED**

Run: `npm run test:e2e`

Expected: FAIL because no Playwright web server/base URL configuration exists.

- [ ] **Step 4: Configure Chromium and static preview serving**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Verify headless Chromium GREEN**

Run: `npm run test:e2e`

Expected: one test passes in the `chromium` project, the page is served from `build/client`, and no unexpected `console.error` or `pageerror` occurs.

- [ ] **Step 6: Confirm Playwright stays outside the local gate**

Run: `npm run check`

Expected: the command passes without invoking Playwright or downloading/launching a browser.

- [ ] **Step 7: Commit browser validation**

```bash
git add playwright.config.ts tests/e2e package.json package-lock.json .gitignore
git commit -m "test: add headless chromium smoke coverage"
```

### Task 5: Add the Agent Contract, Hook, and Static Documentation

**Files:**

- Create: `AGENTS.md`
- Create: `.husky/pre-commit`
- Replace: `README.md`

- [ ] **Step 1: Write the concise agent operating contract**

Create `AGENTS.md`:

```markdown
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

1. Read the relevant accepted ADRs before changing architecture.
2. Follow existing working examples.
3. Add or update meaningful tests with behavior changes.
4. Run `npm run check` and fix root causes before completion.
5. Run `npm run test:e2e` for browser-relevant changes.
6. Do not weaken validation, thresholds, or hooks to make changes pass.

CI wiring and later architectural layers are intentionally introduced in subsequent phases.
```

- [ ] **Step 2: Replace server-oriented README content**

Replace `README.md` with:

````markdown
# AI-Agent Static Website Template

A React Router Framework foundation for building localized static marketing and content websites with AI coding agents.

## Requirements

- Node.js 22.22.2 or newer
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
````

- [ ] **Step 3: Install the mandatory pre-commit hook**

Run: `npm run prepare`

Create `.husky/pre-commit`:

```sh
npm run check
```

Run: `test -x .husky/pre-commit`

Expected: exit `0`. If the file is not executable, run `chmod +x .husky/pre-commit`; do not add a weaker hook command.

- [ ] **Step 4: Verify the hook command directly**

Run: `.husky/pre-commit`

Expected: the full `npm run check` pipeline passes.

- [ ] **Step 5: Commit documentation and hook infrastructure**

```bash
git add AGENTS.md README.md .husky/pre-commit package.json package-lock.json docs/superpowers/plans/2026-08-08-phase-0-foundation.md
git commit -m "docs: add agent workflow and validation hook"
```

The hook must run and pass during this commit; never bypass it.

### Task 6: Verify the Complete Phase 0 Vertical Slice

**Files:**

- Verify all changed files; modify only files responsible for discovered failures.

- [ ] **Step 1: Verify a clean locked installation**

Run: `npm ci`

Expected: dependencies install successfully, Husky's prepare script installs hooks, and there are no Node engine warnings under Node 22.22.2 or newer.

- [ ] **Step 2: Run the canonical local gate from a clean install**

Run: `npm run check`

Expected, in order: formatting, ESLint/complexity, React Router type generation/TypeScript, Vitest, coverage thresholds, and production static build all pass.

- [ ] **Step 3: Verify the production artifact explicitly**

Run:

```bash
test -f build/client/index.html
test ! -d build/server
test ! -f build/client/__spa-fallback.html
```

Expected: all commands exit `0`.

- [ ] **Step 4: Verify Chromium headlessly**

Run: `npm run test:e2e`

Expected: the Chromium project passes the homepage test with no unexpected browser errors.

- [ ] **Step 5: Review against the Phase 0 ADRs**

Inspect the final diff against ADRs 003, 004, 005, 006, 007, 012, 021, 022, and 023. Confirm:

- no server runtime or vendor-specific deployment requirement remains;
- Framework Mode uses `ssr: false` and complete current-route prerendering;
- no SPA fallback remains in the deployable artifact;
- Tailwind remains the styling foundation;
- `npm run check` contains every Phase 0 local check and excludes Playwright;
- coverage thresholds and complexity maximum match ADR 021;
- the pre-commit hook invokes exactly `npm run check`;
- dependencies are established tools justified by accepted ADR 021; and
- CI and later-phase architecture were not added.

Expected: no high or medium architectural finding. Fix any such finding at its source, then repeat Steps 2 through 4.

- [ ] **Step 6: Inspect repository state**

Run:

```bash
git status --short
git log --oneline -10
```

Expected: no uncommitted implementation changes remain and the Phase 0 commits are coherent. Generated `build`, coverage, and Playwright artifacts remain ignored.
