# Static E2E Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the routing e2e suite validate app-side alias navigation without coupling it to filesystem or webserver alias behavior.

**Architecture:** Keep the existing Playwright `webServer` command, which builds the site and serves `build/client` with `sirv`. Revalidate the locale parent loader whenever the pathname changes, then update `tests/e2e/routing.spec.ts` to await initial hydration and completed client navigation. Keep static-server 404 and artifact-inventory checks separate from app alias navigation so they do not depend on filesystem case behavior.

**Tech Stack:** TypeScript, Playwright, React Router Framework Mode, `sirv-cli`, npm

---

## File Map

- Modify `app/routes/$locale.tsx`: revalidate the locale parent loader when the pathname changes.
- Modify `app/routes/$locale.test.tsx`: cover pathname-driven parent-loader revalidation.
- Modify `tests/e2e/routing.spec.ts`: distinguish client navigation assertions from stable static-server and artifact-inventory checks.
- Do not modify `package.json`, `playwright.config.ts`, or production build configuration. The existing local `sirv` server already exercises the built static artifact without deployment.

## Task 1: Revalidate Noncanonical Pathnames

**Files:**
- Modify: `app/routes/$locale.tsx:53-60`
- Test: `app/routes/$locale.test.tsx:558-575`

- [ ] **Step 1: Write the failing unit test**

Import `shouldRevalidate` from `./$locale` and add this test before the existing `localized route clientLoader` suite:

```ts
describe("localized route revalidation", () => {
  it.each(["/en/about/", "/en/About", "/pt-BR/about/", "/pt-BR/About"])(
    "revalidates the parent loader for noncanonical pathname %s",
    (pathname) => {
      expect(
        shouldRevalidate({
          currentUrl: new URL("https://example.test/en/services"),
          nextUrl: new URL(`https://example.test${pathname}`),
        } as never),
      ).toBe(true);
    },
  );
});
```

- [ ] **Step 2: Run the new test and verify the expected failure**

Run:

```bash
nvm use
npx vitest run 'app/routes/$locale.test.tsx' -t "revalidates the parent loader"
```

Expected: four failures because `shouldRevalidate` is not exported yet.

- [ ] **Step 3: Implement pathname-driven revalidation**

Import `ShouldRevalidateFunctionArgs` as a type and add this route-module export after `loader`:

```ts
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname !== nextUrl.pathname || defaultShouldRevalidate;
}
```

The pathname comparison catches same-locale aliases; preserving `defaultShouldRevalidate` keeps React Router’s existing mutation and explicit-revalidation behavior.

- [ ] **Step 4: Run the unit test and verify it passes**

Run:

```bash
nvm use
npx vitest run 'app/routes/$locale.test.tsx' -t "revalidates the parent loader"
```

Expected: four passing tests.

## Task 2: Make Client Alias Navigation Deterministic

**Files:**
- Modify: `tests/e2e/routing.spec.ts:138-202`

- [ ] **Step 1: Update alias fixtures to describe client-navigation behavior**

Replace the tuple-only `unpublishedAliases` data with objects that retain the existing client-navigation assertions:

```ts
const unpublishedAliases = [
  {
    alias: "/en/about/",
    heading: "Page not found",
    description:
      "This page may have moved or never existed. Use the navigation to find your way back.",
    canonicalHeading: "About",
  },
  {
    alias: "/en/About",
    heading: "Page not found",
    description:
      "This page may have moved or never existed. Use the navigation to find your way back.",
    canonicalHeading: "About",
  },
  {
    alias: "/pt-BR/about/",
    heading: "Página não encontrada",
    description:
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    canonicalHeading: "Sobre",
  },
  {
    alias: "/pt-BR/About",
    heading: "Página não encontrada",
    description:
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    canonicalHeading: "Sobre",
  },
] as const;
```

The app test data contains no direct-request expectation, so it is independent of how a static webserver maps paths.

- [ ] **Step 2: Wait for hydration and completed client navigation**

Change the alias loop to destructure each object, then wait for the initial
hydration loader to become idle before navigating.
After `router.navigate(alias)`, wait for the second transition to become idle:

```ts
for (const {
  alias,
  heading,
  description,
  canonicalHeading,
} of unpublishedAliases) {
  test(`rejects client navigation to ${alias}`, async ({ page }) => {
    await page.goto("/en/services");
    await page.waitForFunction(() => {
      const router = Reflect.get(window, "__reactRouterDataRouter") as {
        state: { navigation: { state: string } };
      };
      return router.state.navigation.state === "idle";
    });

    await page.evaluate(async (url) => {
      const router = Reflect.get(window, "__reactRouterDataRouter") as {
        navigate(to: string): Promise<void>;
      };
      await router.navigate(url);
    }, alias);
    await page.waitForFunction(() => {
      const router = Reflect.get(window, "__reactRouterDataRouter") as {
        state: { navigation: { state: string } };
      };
      return router.state.navigation.state === "idle";
    });

    await expect(page).toHaveURL(alias);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: canonicalHeading }),
    ).toHaveCount(0);
  });
}
```

Do not call `router.revalidate()` afterward. The route’s `shouldRevalidate` hook makes the navigation run the parent `clientLoader`, which rejects the noncanonical pathname and renders the localized route error boundary.

- [ ] **Step 3: Run the targeted client alias tests**

Run:

```bash
nvm use
npx playwright test tests/e2e/routing.spec.ts -g "rejects client navigation"
```

Expected: all four client alias tests pass and no unexpected browser errors are reported.

## Task 3: Keep Static-Server Checks Separate

**Files:**
- Modify: `tests/e2e/routing.spec.ts:132-136, 204-220`

- [ ] **Step 1: Keep direct 404 coverage on stable unknown paths**

Retain the existing request-based test for `/fr/about`, `/en/not-published`, and `/pt-BR/not-published`:

```ts
test("returns real 404 responses for unpublished URLs", async ({ request }) => {
  expect((await request.get("/fr/about")).status()).toBe(404);
  expect((await request.get("/en/not-published")).status()).toBe(404);
  expect((await request.get("/pt-BR/not-published")).status()).toBe(404);
});
```

These paths have no near-cased static artifact and validate the local `sirv` static-server boundary without making app alias behavior depend on filesystem semantics.

- [ ] **Step 2: Keep alias artifact inventory coverage**

Retain the `does not publish alias URLs or generate alias artifacts` test. It must continue checking that the canonical manifest excludes all four aliases and that the locale directory listings contain `about` but not `About`.

- [ ] **Step 3: Run the focused app and static checks**

- [ ] **Step 3: Run the targeted alias suite**

Run:

```bash
nvm use
npx playwright test tests/e2e/routing.spec.ts -g "unpublished aliases|real 404 responses|does not publish alias"
```

Expected: all client alias tests, stable static-server 404 tests, and alias artifact inventory tests pass against the locally built artifact on any filesystem.

## Task 4: Verify the Complete Quality Gate

**Files:**
- No additional files.

- [ ] **Step 1: Run the full browser suite**

Run:

```bash
nvm use
npm run test:e2e
```

Expected: all Playwright tests pass with no unexpected browser errors. The command’s web server must remain `npm run build && npm run preview`.

- [ ] **Step 2: Run the repository quality gate**

Run:

```bash
nvm use
npm run check
```

Expected: formatting, lint, typecheck, unit tests, coverage, and static-build validation pass. Static validation must continue removing `build/client/__spa-fallback.html` and reject unexpected alias artifacts.

- [ ] **Step 3: Review the final diff**

Run:

```bash
git status --short
git diff -- tests/e2e/routing.spec.ts
```

Confirm that only the localized route revalidation and routing e2e expectations changed, and that no deployment configuration, SPA fallback, production route, or validation threshold was weakened.

- [ ] **Step 4: Commit the implementation**

```bash
git add \
  app/routes/'$locale'.tsx \
  app/routes/'$locale.test.tsx' \
  tests/e2e/routing.spec.ts \
  docs/template/superpowers/specs/2026-08-10-static-e2e-server-routing-design.md \
  docs/template/superpowers/plans/2026-08-10-static-e2e-routing.md
git commit -m "test: align static alias routing expectations"
```
