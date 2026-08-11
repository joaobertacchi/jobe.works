# Behavior-Focused Test Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the automated test suite so it protects user-visible behavior, product requirements, and static-site invariants without depending on private implementation details or duplicating exhaustive coverage across layers.

**Architecture:** Assign each requirement to one authoritative layer: TypeScript for compile-time contracts, Vitest for deterministic policy, React Testing Library for observable React behavior, static validation for exhaustive generated artifacts, and Playwright for representative browser-only journeys. Migrate in subsystem slices, deleting redundant tests freely while retaining the existing thresholds and adding test-driven production fixes only when a behavior test exposes a defect.

**Tech Stack:** TypeScript 5.9, React 19, React Router 8 Framework Mode, Vitest 4, React Testing Library 16, Playwright 1.62, jsdom 30.

**Design:** `docs/superpowers/specs/2026-08-10-behavior-focused-test-redesign.md`

**Commit Policy:** This plan does not authorize commits. Create commits only if the user explicitly requests them during execution.

---

## File Map

### Policy And Tooling

- Modify `docs/adrs/021-quality-toolchain-and-validation.md`: make behavior ownership and assertion rules authoritative.
- Modify `package.json`: execute Vitest once inside `npm run check`.
- Modify `vitest.config.ts`: reject focused tests in CI.
- Modify `playwright.config.ts`: reject focused tests in CI.

### Localization, Root, And Routes

- Modify `app/i18n/i18n.test.tsx`: delete translator identity checks and consolidate option sanitization around outcomes.
- Modify `app/i18n/types.type-test.ts`: keep one concise compile-time contract matrix.
- Modify `app/routes/_index.test.tsx`: replace source inspection and HTML-string matching with rendered behavior.
- Modify `app/routes/$locale.test.tsx`: remove copy/composition duplication and retain route, error, navigation, and loader behavior.
- Modify `app/root.test.tsx`: replace source and React-element inspection with rendered behavior; remove styling-internal assertions.
- Modify `app/routes/seo-meta.test.tsx`: keep only route-specific metadata decisions.

### UI, Theme, And Consent Components

- Modify `app/components/ui/primitives.test.tsx`: test public props, semantics, and selected stable token classes without complete class strings or ordering.
- Modify `app/components/domain/service-card.test.tsx`: test article/heading/content semantics.
- Modify `app/components/sections/hero-section.test.tsx`: test semantic content and action slots, not utility layout.
- Modify `app/components/site/site-components.test.tsx`: remove dictionary shape, active-color, listener-count, scheduling, and Strict Mode bookkeeping tests.
- Modify `app/components/site/consent-banner.test.tsx`: retain consent interaction/accessibility and remove provider duplication and modal lifecycle bookkeeping.
- Modify `app/consent/consent-context.test.tsx`: retain provider transitions and remove parser/dialog duplication.
- Modify `app/consent/consent.test.ts`: retain storage policy and remove standalone constant/call-detail checks.

### Static Contracts And Browser Journeys

- Modify `scripts/finalize-static-build.test.ts`: add direct missing/unexpected artifact regressions and remove duplicated SEO parser matrices.
- Modify `scripts/seo-static.test.ts`: own detailed generated-SEO parser failure modes.
- Modify `app/routing/canonical-url-manifest.test.ts`: retain one exhaustive manifest matrix and representative sibling boundaries.
- Modify `tests/react-router-config.test.ts`: test concrete static configuration output instead of function existence.
- Modify `tests/e2e/routing.spec.ts`: retain representative hydration, locale, navigation, and real-status journeys; remove exhaustive route/SEO matrices and private router globals.
- Modify `tests/e2e/components-theming.spec.ts`: retain browser-only theme/layout behavior and reduce repeated page loops.
- Modify `tests/e2e/privacy-consent.spec.ts`: add consent-withdrawal behavior and remove cheaper-layer duplication.

### Analytics Regression

- Modify `app/analytics/analytics.test.tsx`: express deduplication and withdrawal through observable events.
- Modify `app/analytics/analytics.tsx`: send a same-path page view only to tracker categories that just became eligible.
- Modify `app/analytics/manager.test.ts`: retain eligibility/failure isolation and remove call-graph details.

---

### Task 1: Establish Test Ownership And Tooling Policy

**Files:**
- Modify: `docs/adrs/021-quality-toolchain-and-validation.md:167-220`
- Modify: `docs/adrs/021-quality-toolchain-and-validation.md:307-468`
- Modify: `package.json:8-22`
- Modify: `vitest.config.ts:11-31`
- Modify: `playwright.config.ts:3-25`

- [ ] **Step 1: Add authoritative behavior-focused policy to ADR 021**

Add the following sections after the existing test-isolation guidance, preserving the ADR's existing accepted status and prior rationale:

```md
## Behavior-Focused Test Ownership

Each required behavior has one authoritative test layer:

- Type checking owns compile-time contracts.
- Vitest unit tests own deterministic transformations and policy decisions.
- React Testing Library owns observable React, context, DOM, accessibility,
  and in-memory navigation behavior.
- Static build validation owns exhaustive generated-route, locale, link, and
  metadata contracts.
- Playwright owns representative behavior requiring a real browser.

A second layer may retain a small smoke test only when it protects a distinct
integration risk. Exhaustive route, locale, copy, and metadata matrices must
not be repeated across layers.

## Test Classification

Existing tests are classified as Keep, Rewrite, Move, or Delete:

- Keep tests prove a requirement through an appropriate public boundary.
- Rewrite tests protect important behavior but currently assert private
  implementation details.
- Move tests belong at a cheaper or more accurate layer.
- Delete tests duplicate stronger coverage or protect no explicit behavior.

Deletion does not require a one-for-one replacement when another authoritative
contract already protects the behavior.

## Assertion Policy

Tests assert observable behavior rather than implementation details.

Tests must not:

- read TSX source to require imports, hook names, or translation calls;
- compare complete utility-class strings or depend on class ordering;
- traverse private React element objects or incidental wrapper depth;
- assert listener counts, cleanup order, same-turn scheduling, or Strict Mode
  bookkeeping unless no behavior-level regression test can express the risk;
- repeat exhaustive route, locale, metadata, or marketing-copy matrices.

Mocks are restricted to external or architectural boundaries. Exact text is
used only for locale selection, accessibility, legal requirements, and
documented error contracts.

## Focused Tests And Canonical Execution

CI must reject committed focused Vitest and Playwright tests.

The canonical `npm run check` command executes the complete Vitest suite once.
That execution collects coverage and enforces the global thresholds of 80%
statements, 75% branches, 80% functions, and 80% lines.
```

- [ ] **Step 2: Remove the duplicate Vitest execution from `npm run check`**

Change only the `check` script; keep `test` available for focused local execution:

```json
"check": "npm run format:check && npm run lint && npm run typecheck && npm run coverage && npm run validate:static",
"coverage": "vitest run --coverage",
"test": "vitest run"
```

- [ ] **Step 3: Reject focused Vitest tests in CI**

Add `allowOnly` without changing the environment, includes, or thresholds:

```ts
test: {
  allowOnly: !process.env.CI,
  environment: "jsdom",
  // Keep the existing include, setupFiles, and coverage configuration.
},
```

- [ ] **Step 4: Reject focused Playwright tests in CI**

Add `forbidOnly` at the top level:

```ts
export default defineConfig({
  forbidOnly: !!process.env.CI,
  testDir: "./tests/e2e",
  // Keep the existing reporter, browser project, and web server.
});
```

- [ ] **Step 5: Verify policy and configuration**

Run:

```bash
nvm use
npm run format:check
npm run lint
npm run typecheck
CI=1 npm run test
```

Expected: Node `v22.22.2` is active; formatting, lint, type checking, and Vitest pass; coverage thresholds remain unchanged in `vitest.config.ts`.

---

### Task 2: Redesign Localization, Root, And Route Tests

**Files:**
- Modify: `app/i18n/i18n.test.tsx:16-203`
- Modify: `app/i18n/types.type-test.ts`
- Modify: `app/routes/_index.test.tsx:1-69`
- Modify: `app/routes/$locale.test.tsx:140-744`
- Modify: `app/root.test.tsx:1-230`
- Modify: `app/routes/seo-meta.test.tsx:38-87`

- [ ] **Step 1: Remove translator identity as a tested contract**

Delete `I18nValueProbe`, the unused `vi` import, and `memoizes the locale-bound translator`. Keep simultaneous-provider isolation, locale binding, interpolation, missing translation, and provider-boundary behavior.

Consolidate runtime option sanitization around visible outcomes:

```tsx
it("keeps provider policy authoritative over runtime options", () => {
  const { result } = renderHook(() => useI18n(), {
    wrapper: ({ children }) => (
      <I18nProvider locale="en">{children}</I18nProvider>
    ),
  });
  const translate = result.current.translate as (
    scope: TranslationScope,
    options: Record<string, unknown>,
  ) => string;

  expect(
    translate("home.greeting" as TranslationScope, {
      locale: "pt-BR",
      missingBehavior: "guess",
      values: { name: "Agent", locale: "pt-BR" },
    }),
  ).toBe("Hello, Agent");
  expect(() =>
    translate("home.missing" as TranslationScope, {
      locale: "pt-BR",
      missingBehavior: "guess",
      defaultValue: "Fallback",
    }),
  ).toThrow("Missing translation: en.home.missing");
});
```

- [ ] **Step 2: Consolidate compile-time localization examples**

Keep one valid plain, plural, and interpolated call plus one negative example for each distinct rule:

```ts
translate("about.title");
translate("home.exampleCount", { count: 3 });
translate("home.greeting", { values: { name: "Agent" } });

// @ts-expect-error Invalid translation path.
translate("about.missing");
// @ts-expect-error Plural internals are not public scopes.
translate("home.exampleCount.zero");
// @ts-expect-error Plural scopes require count.
translate("home.exampleCount");
// @ts-expect-error Callers cannot override provider translation policy.
translate("about.title", { locale: "pt-BR" });
```

Retain one incomplete dictionary fixture to prove dictionary exhaustiveness; delete duplicate incomplete-scope fixtures that prove the same compiler rule.

- [ ] **Step 3: Replace root redirect source inspection and HTML substring checks**

Delete `uses the default-locale provider and React-facing translation API` and remove `readFileSync`.

Rewrite the pre-navigation test using an accessible query:

```tsx
it("announces locale selection before redirecting", () => {
  const router = createMemoryRouter(
    [
      { path: "/", Component: RootRedirect },
      { path: "/:locale/", element: <p>Localized root</p> },
    ],
    { initialEntries: ["/"] },
  );
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<RouterProvider router={router} />);

  expect(
    within(host).getByRole("status", { name: "Selecionando idioma" }),
  ).toBeVisible();
  expect(router.state.location.pathname).toBe("/");
});
```

Import `within` from React Testing Library. Keep the two redirect outcome tests.

- [ ] **Step 4: Replace root React-element and source inspection**

Delete these tests:

```text
initializes the theme before discovering route styles
leaves stylesheet discovery to Links without remote font links
uses the React-facing i18n API instead of translation dictionaries
uses typography primitives for global error content
```

Replace document-property traversal with serialized output:

```tsx
it.each([
  ["pt-BR", 'lang="pt-BR"'],
  [null, 'lang="und"'],
] as const)("renders the document language for %s", (locale, expected) => {
  const html = renderToStaticMarkup(
    <Document locale={locale}>
      <p>Page content</p>
    </Document>,
  );

  expect(html).toContain(expected);
  expect(html).toContain("<p>Page content</p>");
});
```

Replace `App().type === Outlet` with a real nested route:

```tsx
it("renders the matched child route", async () => {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        Component: App,
        children: [{ index: true, element: <p>Child route</p> }],
      },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
  expect(await screen.findByText("Child route")).toBeVisible();
});
```

Keep localized error output, safe fallback, development details, provider/banner composition, and unsupported-locale behavior.

- [ ] **Step 5: Remove duplicated page-copy and composition matrices from `$locale.test.tsx`**

Delete tests whose only contract is complete example-page copy, shared component composition, speculative card count, or repeated language-switch matrices:

```text
uses the React-facing i18n API instead of translation dictionaries
composes Home principles and a localized call to action
renders the localized Home hero for %s
composes About from shared semantic content sections
renders the localized About page for %s
closes Services without adding a speculative fourth card
renders three localized Services cards for %s
renders the polished localized 404 page for %s
binds English content and navigation
links English About only to its Portuguese sibling
binds Brazilian Portuguese content
links Portuguese Services only to its English sibling
preserves the target trailing slash for Home
preserves localized 404 identity
renders localized not-found content
runs during hydration to validate direct document URLs
```

Keep route-level contracts for localized error boundaries, unsupported locale rejection, CTA analytics, canonical Home recovery, `shouldRevalidate`, `clientLoader`, and build loader data.

- [ ] **Step 6: Rewrite privacy and catch-all route tests as representative behavior**

Remove direct dictionary section-count assertions and retain one localized legal-content smoke:

```tsx
it("renders representative localized privacy content", async () => {
  renderLocalizedRoute("/pt-BR/privacy");

  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Aviso de privacidade",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "Dados tratados pelo modelo",
    }),
  ).toBeVisible();
});
```

Reduce catch-all navigation to one locale:

```tsx
it("renders localized not-found behavior after client navigation", async () => {
  const router = renderLocalizedRoute("/en/about", true);
  expect(await screen.findByRole("heading", { name: "About" })).toBeVisible();

  await router.navigate("/en/not-published");

  expect(router.state.location.pathname).toBe("/en/not-published");
  expect(
    await screen.findByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("navigation", { name: "Choose language" }),
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 7: Reduce route SEO tests to unique policy decisions**

Keep Home Organization JSON-LD, utility-route `noindex`, Privacy indexability, and unsupported-locale behavior. Delete the About and Services title/default-image spot checks because metadata helpers and generated-artifact validation own them.

- [ ] **Step 8: Run the localization and route slice**

Run:

```bash
nvm use
npm run test -- app/i18n/config.test.ts app/i18n/i18n.test.tsx app/routes/_index.test.tsx 'app/routes/$locale.test.tsx' app/root.test.tsx app/routes/seo-meta.test.tsx
npm run typecheck
```

Expected: all focused tests and compile-time contract tests pass; no test in these files reads TSX source or inspects private React element arrays.

---

### Task 3: Redesign UI Primitive And Section Tests

**Files:**
- Modify: `app/components/ui/primitives.test.tsx:1-202`
- Modify: `app/components/domain/service-card.test.tsx:1-32`
- Modify: `app/components/sections/hero-section.test.tsx:1-57`

- [ ] **Step 1: Replace complete primitive class strings with public contracts**

For links and buttons, assert semantics, destination/native state, caller classes, and only stable variant or target-size tokens:

```tsx
const primary = screen.getByRole("link", { name: "Primary" });
const secondary = screen.getByRole("link", { name: "Secondary" });
expect(primary).toHaveAttribute("href", "/primary");
expect(primary).toHaveClass("bg-brand");
expect(secondary).toHaveAttribute("href", "/secondary");
expect(secondary).toHaveClass("underline");

const button = screen.getByRole("button", { name: "Continue" });
expect(button).toHaveAttribute("type", "button");
expect(button).toHaveClass("bg-brand", "min-h-11");
```

For caller class forwarding, replace ordering regexes with independent checks:

```tsx
expect(heading).toHaveAttribute("id", "services-heading");
expect(heading).toHaveClass("tracking-wide");
expect(text).toHaveAttribute("title", "Introduction");
expect(text).toHaveClass("max-w-prose");
```

- [ ] **Step 2: Rewrite Card, Container, and DividedSection around documented surfaces**

Use individual token checks rather than equality:

```tsx
const card = screen.getByTestId("card");
expect(card.tagName).toBe("DIV");
expect(card).toHaveTextContent("Card content");
expect(card).toHaveClass("mt-4", "rounded-2xl", "bg-surface");

const content = screen.getByTestId("container");
expect(content.tagName).toBe("DIV");
expect(content).toHaveTextContent("Page content");
expect(content).toHaveClass("relative", "max-w-6xl", "px-4");
```

For `DividedSection`, retain the semantic section and explicit divider contract, but remove the internal Container assertion:

```tsx
const section = container.querySelector("section");
const divider = section?.querySelector(".border-t");
expect(section).toBeInTheDocument();
expect(section).toHaveClass("mt-16");
expect(section).toHaveTextContent("Section content");
expect(divider).toHaveClass("border-border");
```

- [ ] **Step 3: Rewrite `ServiceCard` around article semantics**

Replace `firstElementChild` and broad Card classes:

```tsx
render(
  <ServiceCard
    title="Strategy"
    description="A practical plan for sustainable growth."
  />,
);

const heading = screen.getByRole("heading", { level: 2, name: "Strategy" });
const article = heading.closest("article");
expect(article).toBeInTheDocument();
expect(
  within(article!).getByText("A practical plan for sustainable growth."),
).toBeVisible();
```

- [ ] **Step 4: Rewrite section tests around semantic content and actions**

For content sections, locate the semantic section from its heading and assert optional content within it. For the hero, retain one `h1`, description, and action destination; delete responsive utility checks:

```tsx
render(
  <HeroSection
    eyebrow="Independent thinking"
    title="Build a clearer path forward"
    description="Focused support for ambitious teams."
    actions={<a href="/contact">Contact us</a>}
  />,
);

const heading = screen.getByRole("heading", {
  level: 1,
  name: "Build a clearer path forward",
});
const section = heading.closest("section");
expect(section).toBeInTheDocument();
expect(within(section!).getByText("Independent thinking")).toBeVisible();
expect(
  within(section!).getByRole("link", { name: "Contact us" }),
).toHaveAttribute("href", "/contact");
```

- [ ] **Step 5: Run the primitive and section slice**

Run:

```bash
nvm use
npm run test -- app/components/ui/primitives.test.tsx app/components/domain/service-card.test.tsx app/components/sections/hero-section.test.tsx
```

Expected: tests pass with no complete class-string equality, class-order regex, or incidental wrapper-depth assertion.

---

### Task 4: Redesign Site, Theme, And Consent Component Tests

**Files:**
- Modify: `app/components/site/site-components.test.tsx:38-489`
- Modify: `app/components/site/consent-banner.test.tsx:51-347`
- Modify: `app/consent/consent-context.test.tsx`
- Modify: `app/consent/consent.test.ts`

- [ ] **Step 1: Remove dictionary and visual-proxy assertions from site components**

Delete `defines shared site, navigation, and theme labels in both locales` because type checking and rendered localization own dictionary completeness.

Rewrite active navigation to assert `aria-current`, not `text-brand`:

```tsx
expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
  "aria-current",
  "page",
);
expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
  "aria-current",
);
expect(screen.getByRole("link", { name: "Services" })).not.toHaveAttribute(
  "aria-current",
);
```

Rewrite language-switcher assertions through its landmark:

```tsx
const navigation = screen.getByRole("navigation", {
  name: "Choose language",
});
expect(within(navigation).getAllByRole("link")).toHaveLength(1);
expect(
  within(navigation).getByRole("link", { name: "Português" }),
).toHaveAttribute("href", "/pt-BR/about");
```

- [ ] **Step 2: Remove theme lifecycle bookkeeping**

Delete these tests:

```text
removes the system listener on mode change and unmount
cancels the pending mount update when unmounted in the same turn
```

Retain the user-visible race regression but rename it to `preserves a user selection made while stored preferences are loading`. Assert selected button, persisted mode, and effective `document.documentElement` theme; do not assert listener counts or microtask call order.

Keep accessibility, explicit selection, system selection, persistence, and live media-query outcomes. Delete jsdom integration cases for invalid storage, thrown storage, and missing `matchMedia` only after confirming those outcomes remain exhaustive in `app/theme.test.ts` and representative in Playwright.

- [ ] **Step 3: Remove consent component/provider duplication and lifecycle spies**

In `consent-banner.test.tsx`, retain banner semantics, localization, customize/save/cancel/Escape, reopening, focus, and outside-click behavior. Delete:

```text
accept all persists consent and hides the banner
reject non-essential persists optional categories disabled
does not rerun the modal open sequence when consent changes while the dialog is open
```

The first two are owned by provider state-transition tests; the last asserts `showModal` call count rather than user behavior.

In `consent-context.test.tsx`, keep initial state, accept, reject, update, stored decision, and stale-version behavior. Delete malformed/unparseable record duplication and direct settings-dialog state because `consent.test.ts` and the banner component own those behaviors.

In `consent.test.ts`, delete the standalone exact constant-value test and remove call-detail assertions such as `toHaveBeenCalledWith(CONSENT_STORAGE_KEY)` when the returned/persisted behavior already proves the boundary.

- [ ] **Step 4: Run theme and consent component tests**

Run:

```bash
nvm use
npm run test -- app/theme.test.ts app/components/site/site-components.test.tsx app/consent/consent.test.ts app/consent/consent-context.test.tsx app/components/site/consent-banner.test.tsx
```

Expected: all retained behavior passes; there are no assertions on listener counts, cleanup call order, Strict Mode listener bookkeeping, or `showModal` invocation count.

---

### Task 5: Consolidate SEO And Static Artifact Contracts

**Files:**
- Modify: `scripts/finalize-static-build.test.ts:1-280`
- Modify: `scripts/seo-static.test.ts:1-208`

- [ ] **Step 1: Write direct missing-artifact regression tests**

Import `rmSync` from `node:fs`, then replace the misleading empty-file case with physical absence cases:

```ts
it.each([
  ["index.html", "Missing HTML artifact: index.html"],
  [
    "pt-BR/about/index.html",
    "Missing HTML artifact: pt-BR/about/index.html",
  ],
] as const)(
  "rejects a physically missing required artifact %s",
  (artifact, message) => {
    const { client } = createCompleteBuild();
    rmSync(join(client, ...artifact.split("/")));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(message);
  },
);
```

- [ ] **Step 2: Run the missing-artifact tests and confirm they protect the inventory branch**

Run:

```bash
nvm use
npm run test -- scripts/finalize-static-build.test.ts -t "physically missing"
```

Expected: PASS against the existing validator. Temporarily change the expected message to `Invalid HTML artifact`, rerun to observe FAIL, then restore it. Do not commit the temporary mutation.

- [ ] **Step 3: Add supported-locale unexpected-artifact coverage**

Add a case that reaches the unexpected-inventory branch rather than failing locale validation first:

```ts
it("rejects an unexpected HTML artifact under a supported locale", () => {
  const { client } = createCompleteBuild();
  writeHtml(client, "/en/unexpected", html("en"));

  expect(() => finalizeStaticBuild(client, manifest)).toThrow(
    "Unexpected HTML artifact: en/unexpected/index.html",
  );
});
```

Keep the existing unsupported-locale-directory test as a separate locale-boundary contract.

- [ ] **Step 4: Preserve the empty-file distinction explicitly**

Add a separately named malformed-present test:

```ts
it("rejects an empty required artifact", () => {
  const { client } = createCompleteBuild();
  writeFileSync(join(client, "en", "about", "index.html"), "");

  expect(() => finalizeStaticBuild(client, manifest)).toThrow(
    "Invalid HTML artifact: en/about/index.html",
  );
});
```

- [ ] **Step 5: Move detailed SEO parser failures to `seo-static.test.ts`**

Keep one finalizer-level smoke proving orchestration rejects invalid SEO. Remove duplicated finalizer cases for missing description, duplicate/malformed canonical, invalid/missing/extra alternates, invalid robots, and missing social fields when the same malformed HTML is directly covered in `seo-static.test.ts`.

In `seo-static.test.ts`, keep one test per distinct parser/policy error and split broad assertions into named cases such as:

```ts
it("rejects a missing x-default alternate", () => {
  expect(() =>
    parse({
      html: html().replace(
        /<link rel="alternate" hreflang="x-default"[^>]+>/,
        "",
      ),
    }),
  ).toThrow("Missing hreflang x-default in en/about/index.html");
});
```

Use the fixture and expected descriptor names already present in that file; do not duplicate a second complete HTML builder.

- [ ] **Step 6: Run static contract tests and a real build**

Run:

```bash
nvm use
npm run test -- scripts/seo-static.test.ts scripts/finalize-static-build.test.ts scripts/canonical-manifest-file.test.ts
npm run build
```

Expected: focused tests pass; the real build passes static finalization and remains deployable without `build/server` or `__spa-fallback.html`.

---

### Task 6: Consolidate Routing Unit And Browser Coverage

**Files:**
- Modify: `app/routing/canonical-url-manifest.test.ts`
- Modify: `tests/react-router-config.test.ts`
- Modify: `tests/e2e/routing.spec.ts:1-446`

- [ ] **Step 1: Keep one authoritative canonical manifest matrix**

Preserve full route expansion and malformed-manifest policy. Reduce sibling URL examples to Home plus one nested page:

```ts
it.each([
  ["/en/", { en: "/en/", "pt-BR": "/pt-BR/" }],
  [
    "/en/about",
    { en: "/en/about", "pt-BR": "/pt-BR/about" },
  ],
] as const)("resolves localized siblings for %s", (pathname, expected) => {
  expect(getLocalizedUrlsForPathname(manifest, pathname)).toEqual(expected);
});
```

Delete repeated Services and 404 sibling examples because they use the same nested-page rule.

- [ ] **Step 2: Test concrete React Router static configuration output**

Keep `ssr: false` and representative `getPrerenderPaths()` behavior. Remove assertions that merely prove `prerender` or `buildEnd` are functions. Use one boundary matrix:

```ts
expect(
  getPrerenderPaths(
    ["/", "/health", "/:locale/about", "/files/*", "/en/about"],
    manifest,
  ),
).toEqual([
  "/",
  "/health",
  "/en/about",
  "/en/",
  "/pt-BR/",
  "/pt-BR/about",
]);
```

The expected order follows `getPrerenderPaths()`: concrete static paths retain their input order, followed by canonical manifest URLs not already present.

- [ ] **Step 3: Replace the exhaustive published-page Playwright matrix**

Delete `publishedPages` and its generated tests. Add one representative direct-load integration:

```ts
test("serves and hydrates a representative prerendered localized page", async ({
  page,
  request,
}) => {
  const response = await request.get("/pt-BR/about");
  expect(response.status()).toBe(200);

  await page.goto("/pt-BR/about");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sobre" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
```

Keep canonical hydration, internal navigation/back behavior, no language persistence, active-locale navigation, root browser-locale selection, and Privacy footer navigation.

- [ ] **Step 4: Replace the exhaustive language-switch matrix**

Delete `englishPagesWithPortugueseSiblings`. Keep one nested-route journey:

```ts
test("language switching preserves logical page identity", async ({ page }) => {
  await page.goto("/en/about");
  const switcher = page.getByRole("navigation", {
    name: "Choose language",
  });
  const portuguese = switcher.getByRole("link", { name: "Português" });

  await expect(portuguese).toHaveAttribute("href", "/pt-BR/about");
  await portuguese.click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(page.getByRole("heading", { name: "Sobre" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
```

- [ ] **Step 5: Keep representative real HTTP status categories**

Replace repeated localized unpublished paths and alias matrices with:

```ts
test.each([
  ["/fr/about", "unsupported locale"],
  ["/en/not-published", "unpublished localized route"],
  ["/en/about/", "noncanonical trailing-slash alias"],
  ["/en/About", "noncanonical case alias"],
] as const)("returns a real 404 for %s (%s)", async ({ request }, url) => {
  expect((await request.get(url)).status()).toBe(404);
});
```

Delete client-navigation tests that call `window.__reactRouterDataRouter`; `createMemoryRouter` route tests already own those client outcomes.

- [ ] **Step 6: Delete exhaustive browser SEO and generated-file duplication**

Delete Playwright tests that enumerate complete localized metadata, Home JSON-LD/404 noindex matrices, sitemap, robots, and filesystem route artifacts. Static build validation owns these exhaustive generated-product contracts; retain no browser metadata matrix in this phase.

- [ ] **Step 7: Run routing unit and browser tests**

Run:

```bash
nvm use
npm run test -- app/routing/canonical-url-manifest.test.ts app/routing/localized-pathname.test.ts tests/react-router-config.test.ts
npm run test:e2e -- tests/e2e/routing.spec.ts
```

Expected: unit and browser routing tests pass; `routing.spec.ts` has no private React Router global, exhaustive route array, exhaustive language-switch array, or duplicate SEO matrix.

---

### Task 7: Fix Analytics Eligibility Without Duplicate Page Views

**Files:**
- Modify: `app/analytics/analytics.test.tsx:193-283`
- Modify: `app/analytics/analytics.tsx:45-73`
- Modify: `app/analytics/manager.test.ts`

- [ ] **Step 1: Strengthen the second-category test to expose the defect**

Replace the existing second-category test with:

```tsx
it("only dispatches the current page view to trackers that become eligible", async () => {
  const analyticsTracker = vi.fn();
  const marketingTracker = vi.fn();
  const trackers: readonly TrackerRegistration[] = [
    { tracker: analyticsTracker, consentCategory: "analytics" },
    { tracker: marketingTracker, consentCategory: "marketing" },
  ];

  const { rerender } = render(
    <Harness
      consent={{ analytics: true, marketing: false }}
      trackers={trackers}
    />,
  );
  await waitFor(() => {
    expect(analyticsTracker).toHaveBeenCalledWith({
      eventName: "page_view",
      pathname: "/en/",
      locale: "en",
    });
  });
  expect(marketingTracker).not.toHaveBeenCalled();

  rerender(
    <Harness
      consent={{ analytics: true, marketing: true }}
      trackers={trackers}
    />,
  );
  await waitFor(() => {
    expect(marketingTracker).toHaveBeenCalledWith({
      eventName: "page_view",
      pathname: "/en/",
      locale: "en",
    });
  });

  expect(
    analyticsTracker.mock.calls.filter(
      ([event]) => event.eventName === "page_view",
    ),
  ).toHaveLength(1);
  expect(
    marketingTracker.mock.calls.filter(
      ([event]) => event.eventName === "page_view",
    ),
  ).toHaveLength(1);
});
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```bash
nvm use
npm run test -- app/analytics/analytics.test.tsx -t "only dispatches the current page view"
```

Expected: FAIL because `analyticsTracker` has two page views after marketing becomes eligible.

- [ ] **Step 3: Dispatch same-path consent changes only to newly eligible registrations**

Replace the page-view effect with:

```tsx
useEffect(() => {
  const analyticsBecameEligible =
    analyticsEligible && !wasAnalyticsEligible.current;
  const marketingBecameEligible =
    marketingEligible && !wasMarketingEligible.current;

  wasAnalyticsEligible.current = analyticsEligible;
  wasMarketingEligible.current = marketingEligible;

  const pathnameChanged = pathname !== lastDispatchedPathname.current;
  const pageViewTrackers = pathnameChanged
    ? trackers
    : trackers.filter(
        ({ consentCategory }) =>
          (consentCategory === "analytics" && analyticsBecameEligible) ||
          (consentCategory === "marketing" && marketingBecameEligible),
      );

  if (pageViewTrackers.length === 0) return;

  lastDispatchedPathname.current = pathname;
  void dispatchEvent(
    pageViewTrackers,
    {
      eventName: "page_view",
      pathname,
      locale: getLocaleFromPathname(pathname) ?? defaultLocale,
    },
    consent,
  );
}, [analyticsEligible, marketingEligible, consent, pathname, trackers]);
```

Keep `capture` unchanged for custom events.

- [ ] **Step 4: Verify GREEN and the analytics subsystem**

Run:

```bash
npm run test -- app/analytics/analytics.test.tsx -t "only dispatches the current page view"
npm run test -- app/analytics
```

Expected: the focused test and all analytics tests pass.

- [ ] **Step 5: Add withdrawal characterization at the provider boundary**

Add a test that grants analytics, observes the initial page view, withdraws consent, emits a custom event, navigates, and observes no additional tracker calls:

```tsx
it("stops dispatching events and page views after consent is withdrawn", async () => {
  const tracker = vi.fn();
  const trackers: readonly TrackerRegistration[] = [
    { tracker, consentCategory: "analytics" },
  ];
  const { rerender } = render(
    <Harness consent={accepted} trackers={trackers} />,
  );

  await waitFor(() => expect(tracker).toHaveBeenCalledTimes(1));
  rerender(<Harness consent={rejected} trackers={trackers} />);
  fireEvent.click(screen.getByRole("button", { name: "Emit" }));
  fireEvent.click(screen.getByRole("link", { name: "About" }));
  await act(() => Promise.resolve());

  expect(tracker).toHaveBeenCalledTimes(1);
});
```

Run:

```bash
npm run test -- app/analytics/analytics.test.tsx -t "stops dispatching"
```

Expected: PASS with the current consent filtering; no production change is required unless it fails for an actual queued event.

- [ ] **Step 6: Remove analytics manager implementation details**

Keep eligibility by category, category independence, eligible/ineligible dispatch, and thrown/rejected tracker isolation. Delete tests that assert changing snapshot through the same helper, environment-specific logging internals, or exact async sequencing when those outcomes do not define the manager's public contract.

Run:

```bash
npm run test -- app/analytics
```

Expected: all analytics tests pass and retained tests describe eligibility or event outcomes rather than the internal call graph.

---

### Task 8: Consolidate Privacy And Theme Browser Journeys

**Files:**
- Modify: `tests/e2e/privacy-consent.spec.ts:60-281`
- Modify: `tests/e2e/components-theming.spec.ts`

- [ ] **Step 1: Rewrite cookie-settings coverage as consent withdrawal**

Replace `cookie settings remain accessible after dismissal and update consent` with:

```ts
test("withdrawing analytics consent prevents subsequent tracking", async ({
  page,
}) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect.poll(() => hasPageView(messages, "/en/")).toBe(true);

  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Cookie settings" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await dialog.getByRole("checkbox", { name: "Analytics" }).uncheck();
  await dialog.getByRole("button", { name: "Save preferences" }).click();

  const messageCountAfterWithdrawal = messages.length;
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

  expect(messages).toHaveLength(messageCountAfterWithdrawal);
  expect(JSON.parse((await storedConsent(page)) ?? "null")).toMatchObject({
    analytics: false,
    marketing: true,
  });
});
```

- [ ] **Step 2: Run the withdrawal journey**

Run:

```bash
nvm use
npm run test:e2e -- tests/e2e/privacy-consent.spec.ts -g "withdrawing analytics consent"
```

Expected: PASS. If it fails, inspect emitted events and write the smallest provider-level failing test before changing production code.

- [ ] **Step 3: Delete browser cases fully owned by cheaper layers**

After confirming retained unit/component coverage, delete these Playwright cases:

```text
malformed stored consent is treated as unresolved
escape closes the customize dialog without persisting
renders the Portuguese consent banner
```

Keep pre-choice silence, acceptance with navigation events, customize category behavior, reload persistence, stale-version integration, withdrawal, and CTA event emission. Delete the separate rejection journey because provider tests own rejected-state persistence and pre-choice plus customize journeys already prove browser-side tracker ineligibility.

- [ ] **Step 4: Reduce repeated theme/page matrices**

In `components-theming.spec.ts`:

- keep fresh system preference, explicit mode, system mode, live media changes, persistence, language-switch persistence, invalid storage, keyboard focus, raw bootstrap ordering, first-contentful-paint behavior, computed colors, mobile Services, and desktop Services;
- reduce `representative pages use semantic headings and one selected theme` to one representative page;
- reduce mobile overflow/footer loops to `/en/services`;
- keep one primary-navigation and one footer/CTA focus target rather than repeating pages;
- remove private `window.__reactRouterContext` checks while retaining the first-paint assertion.

In the existing first-paint test, remove the `!("__reactRouterContext" in window)` condition from the bootstrap-mark predicate and delete the `marksAfterHydrationToggle` block. Retain these outcome assertions:

```ts
expect(immediateTheme).toEqual({ dark: true, colorScheme: "dark" });
expect(themeBootstrapApplied).toBeDefined();
expect(themeBootstrapApplied!).toBeLessThanOrEqual(firstContentfulPaint);
await expectTheme(page, "dark", "Dark");
```

Use the file's existing first-paint collection helper rather than introducing a second observer.

- [ ] **Step 5: Run privacy and theme browser suites**

Run:

```bash
npm run test:e2e -- tests/e2e/privacy-consent.spec.ts
npm run test:e2e -- tests/e2e/components-theming.spec.ts
```

Expected: both suites pass with fewer duplicated page/copy matrices and no private React Router globals.

---

### Task 9: Audit And Verify The Complete Redesign

**Files:**
- Review: all `*.test.ts`, `*.test.tsx`, and `*.spec.ts`
- Review: `docs/adrs/021-quality-toolchain-and-validation.md`
- Review: `package.json`, `vitest.config.ts`, `playwright.config.ts`

- [ ] **Step 1: Audit source inspection**

Run:

```bash
rg 'readFileSync\([^)]*\.tsx|readFile\([^)]*\.tsx' app scripts tests --glob '*.{test,spec}.{ts,tsx,mjs}'
```

Expected: no matches. Reads of generated HTML and intentional CSS design tokens remain allowed.

- [ ] **Step 2: Audit class equality, ordering, and internal structure**

Run:

```bash
rg 'className\)\.toBe|className\)\.toEqual|className\.toMatch|children\[[0-9]+\]|firstElementChild' app tests --glob '*.{test,spec}.{ts,tsx}'
rg 'toHaveClass\(' app tests --glob '*.{test,spec}.{ts,tsx}'
```

Expected: the first command has no matches. Review every `toHaveClass` result and retain only individual stable token, state, or document-theme contracts described by ADR 021.

- [ ] **Step 3: Audit lifecycle and private framework details**

Run:

```bash
rg '__reactRouterDataRouter|__reactRouterContext|listener.*Called|addEventListener.*Called|removeEventListener.*Called|showModal.*Called|same-turn|same turn' app tests --glob '*.{test,spec}.{ts,tsx}'
```

Expected: no private React Router globals or call-count bookkeeping. Any retained race-regression name must describe the user-visible outcome.

- [ ] **Step 4: Audit exhaustive browser duplication and focused tests**

Run:

```bash
rg 'publishedPages|englishPagesWithPortugueseSiblings' tests/e2e
rg '\.(only)\(' app scripts tests --glob '*.{test,spec}.{ts,tsx,mjs}'
```

Expected: no matches.

- [ ] **Step 5: Run the canonical local quality gate**

Run:

```bash
nvm use
npm run check
```

Expected: formatting, lint, React Router type generation, TypeScript, one coverage-enabled Vitest run, production build, and static validation all pass. Coverage remains at or above statements 80%, branches 75%, functions 80%, and lines 80%.

- [ ] **Step 6: Run the complete browser suite**

Run:

```bash
npm run test:e2e
```

Expected: Chromium passes all representative journeys with no unexpected `console.error` or `pageerror`; failure artifacts remain configured.

- [ ] **Step 7: Review the final diff against the design**

Run:

```bash
git status --short
git diff -- docs/adrs/021-quality-toolchain-and-validation.md package.json vitest.config.ts playwright.config.ts app scripts tests
```

Expected: every changed line traces to behavior-focused ownership, removal of duplication, a documented static regression, analytics correctness, or required tooling protection. No visual testing dependency or Storybook configuration is introduced in this phase.
