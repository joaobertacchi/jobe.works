# Phase 1 Static Routing and Prerendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locale-prefixed React Router Framework site whose canonical manifest drives prerendering and validates complete portable static output for `en` and `pt-BR`.

**Architecture:** React Router v8.2.1 `flatRoutes()` discovers route patterns from route filenames. Pure locale and manifest modules expand publishable `:locale` leaf patterns into concrete URLs; `react-router.config.ts` passes those URLs to prerendering and passes the same manifest to a `buildEnd` static validator. A locale layout binds typed page-scoped dictionaries without loaders, actions, runtime data requests, or mutable global state.

**Tech Stack:** React 19.2, React Router Framework 8.2.1, TypeScript 5.9, Vite 8, Vitest 4, React Testing Library, Playwright 1.62, Node.js filesystem APIs.

**Version Sources:** Installed React Router 8.2.1 docs at `node_modules/react-router/docs/how-to/file-route-conventions.md`, `node_modules/react-router/docs/how-to/pre-rendering.md`, and `node_modules/react-router/docs/start/framework/routing.md`.

---

## File Structure

- `app/i18n/config.ts`: supported-locale metadata, guards, pathname parsing, and browser preference selection.
- `app/i18n/types.ts`: translation schema and typed dotted scopes.
- `app/i18n/translations/{common,home,about,services,not-found}.ts`: page-scoped dictionaries exhaustive across locales.
- `app/i18n/i18n.tsx`: immutable locale-bound context and generic `translate` API.
- `app/routing/canonical-url-manifest.ts`: route-tree traversal, locale expansion, manifest validation, and concrete URL extraction.
- `app/routes.ts`: official filesystem discovery and exported build-time manifest.
- `app/routes/_index.tsx`: client-only root locale selection.
- `app/routes/$locale.tsx`: locale validation, i18n provider, shared navigation, and outlet.
- `app/routes/$locale.{_index,about,services,404,$}.tsx`: localized route modules and structural catch-all.
- `app/components/content-page.tsx`: shared placeholder page structure.
- `app/components/not-found-page.tsx`: shared localized 404 body.
- `app/root.tsx`: document shell with route-derived `html lang` and generic root error boundary.
- `scripts/finalize-static-build.ts`: manifest-based static artifact validation and build-only artifact removal.
- `react-router.config.ts`: static settings, manifest-driven prerender list, and build-end validation.
- `tests/e2e/routing.spec.ts`: production artifact routing and locale browser behavior.

### Task 1: Locale Configuration and Detection

**Files:**

- Create: `app/i18n/config.ts`
- Create: `app/i18n/config.test.ts`

- [ ] **Step 1: Write failing locale behavior tests**

Test exact matching, ordered preferences, base-language matching, fallback, guards, and pathname parsing:

```ts
import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  getLocaleFromPathname,
  isSupportedLocale,
  selectPreferredLocale,
} from "./config";

describe("locale configuration", () => {
  it.each([
    [["en"], "en"],
    [["pt-BR"], "pt-BR"],
    [["en-US"], "en"],
    [["pt-PT"], "pt-BR"],
    [["fr-FR", "en-GB"], "en"],
    [[], "pt-BR"],
  ] as const)("selects %s as %s", (languages, expected) => {
    expect(selectPreferredLocale(languages)).toBe(expected);
  });

  it("uses the accepted default locale", () => {
    expect(defaultLocale).toBe("pt-BR");
  });

  it("recognizes only configured canonical locale keys", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("pt-BR")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });

  it.each([
    ["/en/about", "en"],
    ["/pt-BR/services", "pt-BR"],
    ["/fr/about", undefined],
    ["/", undefined],
  ] as const)("reads the locale from %s", (pathname, expected) => {
    expect(getLocaleFromPathname(pathname)).toBe(expected);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- app/i18n/config.test.ts`

Expected: FAIL because `./config` does not exist.

- [ ] **Step 3: Implement the typed locale source of truth**

Create `config.ts` with `locales` as an `as const` object, `SupportedLocale = keyof typeof locales`, `defaultLocale: SupportedLocale = "pt-BR"`, an `isSupportedLocale` own-property guard, exact-then-base-language matching over the ordered input, and first-path-segment parsing. Lowercase values only for comparison; always return canonical configured keys.

- [ ] **Step 4: Run the focused test and typecheck**

Run: `npm test -- app/i18n/config.test.ts && npm run typecheck`

Expected: PASS with all locale cases green and no TypeScript errors.

- [ ] **Step 5: Commit the locale unit**

```bash
git add app/i18n/config.ts app/i18n/config.test.ts
git commit -m "feat: define locale routing policy"
```

### Task 2: Canonical URL Manifest Model

**Files:**

- Create: `app/routing/canonical-url-manifest.ts`
- Create: `app/routing/canonical-url-manifest.test.ts`

- [ ] **Step 1: Write failing manifest generation tests**

Use synthetic `RouteConfigEntry[]` matching `flatRoutes()` output. Assert that `:locale` index/about/services/404 leaves produce four logical entries and eight concrete paths, while `/` and `:locale/*` are excluded. Assert `/en/`, `/pt-BR/`, sibling maps, and `kind: "utility"` for 404.

- [ ] **Step 2: Write failing rejection tests**

Add table-driven tests proving generation rejects unresolved parameters (`:locale/blog/:slug`), uppercase non-locale segments (`:locale/About`), `.html`, duplicate logical paths, and non-locale public leaves. Export and test `validateCanonicalUrlManifest` with a deliberately removed `pt-BR` sibling so the error includes the logical page ID and missing locale.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- app/routing/canonical-url-manifest.test.ts`

Expected: FAIL because the manifest module does not exist.

- [ ] **Step 4: Implement the pure manifest model**

Define these public contracts:

```ts
export type CanonicalUrlManifestEntry = {
  id: string;
  kind: "page" | "utility";
  pattern: string;
  urls: Record<SupportedLocale, string>;
};

export type CanonicalUrlManifest = readonly CanonicalUrlManifestEntry[];

export function createCanonicalUrlManifest(
  routes: readonly RouteConfigEntry[],
): CanonicalUrlManifest;

export function validateCanonicalUrlManifest(
  manifest: CanonicalUrlManifest,
): void;

export function getCanonicalUrls(manifest: CanonicalUrlManifest): string[];
```

Traverse nested route entries while accumulating paths. Include only index or leaf patterns rooted at `:locale`; exclude root infrastructure and splats. Convert `:locale` to logical `/`, static suffixes to lowercase logical paths, derive IDs (`home` for `/`, otherwise slash segments joined by `.`), classify `/404` as utility, and expand locales. Sort entries by logical path and each entry's URLs by configured locale order so output is deterministic. Keep validation helpers focused so each function remains below complexity 10.

- [ ] **Step 5: Run focused tests and coverage**

Run: `npm test -- app/routing/canonical-url-manifest.test.ts && npm run coverage`

Expected: PASS and global coverage remains above configured thresholds.

- [ ] **Step 6: Commit the manifest unit**

```bash
git add app/routing/canonical-url-manifest.ts app/routing/canonical-url-manifest.test.ts
git commit -m "feat: generate canonical localized URLs"
```

### Task 3: Typed Locale-Bound Translations

**Files:**

- Create: `app/i18n/types.ts`
- Create: `app/i18n/translations/common.ts`
- Create: `app/i18n/translations/home.ts`
- Create: `app/i18n/translations/about.ts`
- Create: `app/i18n/translations/services.ts`
- Create: `app/i18n/translations/not-found.ts`
- Create: `app/i18n/i18n.tsx`
- Create: `app/i18n/i18n.test.tsx`

- [ ] **Step 1: Write failing provider tests**

Render a probe under `I18nProvider locale="en"` and `locale="pt-BR"`; assert `translate("home.title")` returns the locale-specific placeholder. Assert `useI18n()` outside the provider throws a clear error.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- app/i18n/i18n.test.tsx`

Expected: FAIL because the provider does not exist.

- [ ] **Step 3: Define exhaustive page-scoped dictionaries**

Define one schema per translation file and export a registry satisfying `Record<SupportedLocale, ScopeTranslation>`. Include navigation labels plus `title` and `description` for each page. Use brief demonstrative copy, including English `Page not found` and Portuguese `Página não encontrada`; do not add business claims.

In `types.ts`, compose:

```ts
export type Translation = {
  common: CommonTranslation;
  home: HomeTranslation;
  about: AboutTranslation;
  services: ServicesTranslation;
  notFound: NotFoundTranslation;
};

export type TranslationScope = Paths<Translation>;
```

Implement `Paths<T>` so only string leaves produce valid dotted scopes.

- [ ] **Step 4: Implement immutable context and translator**

Build the complete `Record<SupportedLocale, Translation>` once from the page registries. Bind `translate(scope)` to the provider's locale and resolve dotted paths without changing global locale state. Return only strings and throw for an impossible malformed runtime scope.

- [ ] **Step 5: Run tests, typecheck, and lint**

Run: `npm test -- app/i18n/i18n.test.tsx && npm run typecheck && npm run lint`

Expected: PASS; invalid translation keys are rejected by TypeScript.

- [ ] **Step 6: Commit the localization slice**

```bash
git add app/i18n
git commit -m "feat: add typed route translations"
```

### Task 4: Localized Route Components

**Files:**

- Create: `app/components/content-page.tsx`
- Create: `app/components/not-found-page.tsx`
- Create: `app/routes/_index.tsx`
- Create: `app/routes/_index.test.tsx`
- Create: `app/routes/$locale.tsx`
- Create: `app/routes/$locale.test.tsx`
- Create: `app/routes/$locale._index.tsx`
- Create: `app/routes/$locale.about.tsx`
- Create: `app/routes/$locale.services.tsx`
- Create: `app/routes/$locale.404.tsx`
- Create: `app/routes/$locale.$.tsx`
- Delete: `app/routes/home.tsx`
- Delete: `app/routes/home.test.tsx`
- Delete: `app/welcome/welcome.tsx`
- Delete: `app/welcome/logo-light.svg`
- Delete: `app/welcome/logo-dark.svg`
- Modify: `app/root.tsx`
- Modify: `app/root.test.tsx`

- [ ] **Step 1: Write failing root redirect tests**

Render the root index route in a memory router, mock `navigator.languages`, and assert navigation replaces `/` with `/en/` for `en-US` and `/pt-BR/` for unsupported languages. Assert the route shows a neutral `Selecting language` status before the effect completes.

- [ ] **Step 2: Write failing locale layout and page tests**

Render the locale layout with an outlet for each supported locale. Assert translated navigation and page headings, relative links resolving to sibling routes, localized 404 copy, and an unsupported `fr` parameter throwing a 404 response rather than selecting a fallback locale.

- [ ] **Step 3: Run route tests and verify RED**

Run: `npm test -- 'app/routes/*.test.tsx'`

Expected: FAIL because the new route modules do not exist.

- [ ] **Step 4: Implement the root and locale layouts**

Use `useNavigate` in `_index.tsx` and call `navigate(`/${selectPreferredLocale(navigator.languages)}/`, { replace: true })` in an effect. In `$locale.tsx`, validate `params.locale`, throw `new Response("Not Found", { status: 404 })`when unsupported, and otherwise wrap`<Outlet />`in`I18nProvider`. Render navigation with relative `<Link to=".">`, `<Link to="about">`, and `<Link to="services">` so UI does not maintain a second concrete URL table.

- [ ] **Step 5: Implement shared placeholder pages and catch-all**

`ContentPage` accepts translation scopes for title and description. Home, About, and Services call it with their page scopes. `NotFoundPage` uses `notFound.title` and `notFound.description`; both `$locale.404.tsx` and `$locale.$.tsx` render it. Do not add loaders or actions.

- [ ] **Step 6: Make the document language route-driven**

In `root.tsx`, use `useLocation()` and `getLocaleFromPathname(location.pathname) ?? defaultLocale` in `Layout`, then set `<html lang={locales[locale].htmlLang}>`. Keep the root error boundary generic so unsupported locale errors never display another locale's content. Update `root.test.tsx` to render `Layout` inside a memory router for `/en/about` and `/pt-BR/about`.

- [ ] **Step 7: Remove generated demo orphans and run tests**

Run: `npm test && npm run typecheck && npm run lint`

Expected: PASS with no imports or tests referencing the generated Welcome demo.

- [ ] **Step 8: Commit the localized vertical slice**

```bash
git add app
git commit -m "feat: add localized placeholder routes"
```

### Task 5: Filesystem Discovery and Manifest-Driven Prerendering

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/routes.ts`
- Modify: `react-router.config.ts`
- Modify: `tests/react-router-config.test.ts`

- [ ] **Step 1: Install the official route-convention package**

Run: `npm install --save-dev @react-router/fs-routes@^8`

Expected: `package.json` and lockfile add the React Router v8 filesystem route package without unrelated dependency changes.

- [ ] **Step 2: Write failing route/config assertions**

Update the config test to await filesystem routes, generate the manifest, and assert the canonical URL list is exactly:

```ts
[
  "/en/",
  "/pt-BR/",
  "/en/404",
  "/pt-BR/404",
  "/en/about",
  "/pt-BR/about",
  "/en/services",
  "/pt-BR/services",
];
```

Assert config remains `ssr: false` and its prerender paths equal `["/", ...canonicalUrls]` rather than `true`.

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test -- tests/react-router-config.test.ts`

Expected: FAIL because routes still use the explicit index helper and prerender is boolean.

- [ ] **Step 4: Wire filesystem routes and one manifest instance**

Implement `app/routes.ts` as:

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

import {
  createCanonicalUrlManifest,
  getCanonicalUrls,
} from "./routing/canonical-url-manifest";

export const routes = await flatRoutes();
export const canonicalUrlManifest = createCanonicalUrlManifest(routes);
export const canonicalUrls = getCanonicalUrls(canonicalUrlManifest);

export default routes satisfies RouteConfig;
```

Set `react-router.config.ts` to `ssr: false` and `prerender: ["/", ...canonicalUrls]`. Do not add concurrency or runtime server options.

- [ ] **Step 5: Generate route types and run tests**

Run: `npm run typecheck && npm test -- tests/react-router-config.test.ts`

Expected: PASS and `.react-router/types` contains generated types for all filesystem route modules.

- [ ] **Step 6: Commit framework routing**

```bash
git add package.json package-lock.json app/routes.ts react-router.config.ts tests/react-router-config.test.ts
git commit -m "feat: prerender filesystem routes from manifest"
```

### Task 6: Manifest-Based Static Artifact Validation

**Files:**

- Create: `scripts/finalize-static-build.ts`
- Create: `scripts/finalize-static-build.test.ts`
- Delete: `scripts/finalize-static-build.mjs`
- Delete: `scripts/finalize-static-build.test.mjs`
- Delete: `scripts/finalize-static-build-cli.mjs`
- Modify: `react-router.config.ts`
- Modify: `package.json`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Write failing artifact fixture tests**

Create temporary `build/client` trees from a two-entry manifest. Cover: complete nested HTML success; missing manifest HTML; unexpected `fr/about/index.html`; wrong `<html lang>`; unknown localized anchor href; missing root; missing SPA-fallback evidence; and server directory/fallback removal after success. Assert failure messages include the offending URL or artifact path.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- scripts/finalize-static-build.test.ts`

Expected: FAIL because the TypeScript validator does not exist.

- [ ] **Step 3: Implement manifest-based validation**

Export:

```ts
export function finalizeStaticBuild(
  clientDirectory: string,
  manifest: CanonicalUrlManifest,
): void;
```

Build the expected HTML set from `/` plus every manifest URL using native nested `index.html` mapping. Recursively enumerate actual HTML files, allowing `__spa-fallback.html` only as temporary build evidence. Compare sets, read each localized artifact, verify its `<html lang>`, and inspect only anchor `href` values beginning with `/`; permit `/` infrastructure and require all others in the manifest set. Validate first, then remove `build/server` and `__spa-fallback.html`.

- [ ] **Step 4: Wire `buildEnd` and remove the CLI stage**

Import `canonicalUrlManifest` and `finalizeStaticBuild` in `react-router.config.ts`. Add a `buildEnd` hook that resolves `build/client` from `import.meta.url` and calls the validator. Change `build` to `react-router build`. Update Vitest coverage includes from `scripts/**/*.mjs` to `scripts/**/*.{mjs,ts}`; do not alter thresholds or exclusions to hide new code.

- [ ] **Step 5: Run focused tests and a production build**

Run: `npm test -- scripts/finalize-static-build.test.ts && npm run build`

Expected: PASS; output contains all eight localized nested HTML files and `index.html`, while `build/server` and `build/client/__spa-fallback.html` are absent after `buildEnd`.

- [ ] **Step 6: Commit static validation**

```bash
git add scripts react-router.config.ts package.json vitest.config.ts
git commit -m "build: validate manifest static output"
```

### Task 7: Production Browser Coverage

**Files:**

- Delete: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/routing.spec.ts`

- [ ] **Step 1: Write production routing tests**

Use Playwright request assertions for all manifest URLs and heading assertions for Home, About, Services, and localized 404 in both locales. Verify navigation links stay in the active locale. Use browser contexts with `locale: "en-US"`, `locale: "pt-PT"`, and `locale: "fr-FR"` to assert `/` redirects respectively to `/en/`, `/pt-BR/`, and default `/pt-BR/`. Assert `/fr/about` and `/en/not-published` return HTTP 404.

- [ ] **Step 2: Run E2E and verify failures are meaningful**

Run: `npm run test:e2e`

Expected before final fixes: any failure identifies route output, locale selection, status handling, or browser console errors; no test uses a history fallback.

- [ ] **Step 3: Fix only behavior exposed by E2E tests**

Adjust route components, relative links, locale matching, or artifact validation at their source. Do not alter `sirv` preview to single-page mode and do not suppress the automatic console/page-error fixture.

- [ ] **Step 4: Re-run E2E**

Run: `npm run test:e2e`

Expected: all routing tests pass in headless Chromium against `build/client`.

- [ ] **Step 5: Commit browser coverage**

```bash
git add tests/e2e app scripts
git commit -m "test: verify localized static routing"
```

### Task 8: Complete Validation and Architecture Review

**Files:**

- Modify only files implicated by validation or review findings.

- [ ] **Step 1: Run the canonical local gate**

Run: `npm run check`

Expected: formatting, lint, typecheck, unit tests, coverage, build, and static artifact validation all pass under the Node.js version pinned in `.nvmrc`, with no engine warning.

- [ ] **Step 2: Run browser verification once more**

Run: `npm run test:e2e`

Expected: all Chromium tests pass with no unexpected console or page errors.

- [ ] **Step 3: Inspect final static output**

Run: `git status --short && npm run build`

Expected: build success; localized nested HTML exists, unsupported locale HTML does not exist, and no server or SPA fallback remains.

- [ ] **Step 4: Review against accepted decisions**

Confirm every public route is locale-prefixed except `/`, all concrete URLs originate in the generated manifest, all routes are prerendered, no actions/API/backend/runtime server exist, translations are exhaustive and locale-bound, and validation was not weakened. Fix every high or medium finding and rerun Steps 1-2.

- [ ] **Step 5: Commit review fixes when present**

Inspect `git status --short` and `git diff`, stage only the exact files changed to resolve review findings, and commit them with `git commit -m "fix: resolve phase 1 architecture findings"`. Skip this step when review produces no changes; never create an empty commit.
