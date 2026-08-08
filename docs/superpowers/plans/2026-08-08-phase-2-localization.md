# Phase 2 Localization Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the route-driven typed localization system with `i18n-js` pluralization, manifest-based language switching, and deterministic static validation for English and Brazilian Portuguese.

**Architecture:** Page-scoped TypeScript dictionaries are assembled into one exhaustive locale registry and passed to a locale-bound `i18n-js` instance behind `useI18n()`. The generated canonical URL manifest is delivered by the prerendered locale route loader, allowing switch links to select exact localized siblings without rewriting paths or introducing a second URL inventory.

**Tech Stack:** TypeScript 5.9, React 19, React Router 8 Framework Mode with `ssr: false`, `i18n-js` 4.5.3, Vitest, React Testing Library, Playwright

---

## File Structure

### Create

- `app/i18n/translations/index.ts`: assemble the exhaustive runtime translation registry.
- `app/i18n/types.type-test.ts`: compile-time contracts for translation paths, plural calls, complete copy, and complete locale registration.

### Rename

- `scripts/canonical-manifest-file.ts` to `scripts/canonical-manifest-file.server.ts`: mark filesystem access as build-only before importing it from a route loader.

### Modify

- `package.json` and `package-lock.json`: pin `i18n-js` 4.5.3.
- `app/i18n/types.ts`: define `Plural`, plain and plural paths, options, and translator overloads.
- `app/i18n/translations/common.ts`: add the localized language-switcher label.
- `app/i18n/translations/home.ts`: add representative plural copy.
- `app/i18n/i18n.tsx`: use a locale-bound strict `i18n-js` engine.
- `app/i18n/i18n.test.tsx`: cover plural branches, strict misses, and provider isolation.
- `app/routing/canonical-url-manifest.ts`: resolve exact manifest entries by pathname.
- `app/routing/canonical-url-manifest.test.ts`: cover every representative sibling and unknown paths.
- `app/routes.ts`, `react-router.config.ts`, and `scripts/canonical-manifest-file.test.ts`: update the server-only manifest-file import.
- `app/routes/$locale.tsx`: load manifest data and render alternate-locale links.
- `app/routes/$locale.test.tsx`: cover loader forwarding and language-switch links.
- `app/routes/$locale._index.tsx`: render a plural translation through the hydrated route context.
- `tests/e2e/routing.spec.ts`: verify hydrated translations, page identity, and no locale persistence.
- `vitest.config.ts`: remove exclusions that reference the deleted scaffold.

### Delete

- `app/locales/en-US.ts`
- `app/locales/pt-BR.ts`
- `app/locales/index.ts`
- `app/locales/index.test.ts`
- `app/locales/types.ts`

## Task 1: Pin the Runtime Translation Engine

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Activate the repository Node version**

Run:

```bash
source "$HOME/.nvm/nvm.sh" && nvm use
```

Expected: `Now using node v22.22.2`.

- [ ] **Step 2: Install the approved exact version**

Run:

```bash
npm install --save-exact i18n-js@4.5.3
```

Expected: `package.json` contains `"i18n-js": "4.5.3"` under `dependencies`, and the lockfile includes `i18n-js`, `make-plural`, `lodash`, and `bignumber.js`.

- [ ] **Step 3: Verify dependency resolution**

Run:

```bash
npm ls i18n-js
```

Expected: `i18n-js@4.5.3` and exit code 0.

- [ ] **Step 4: Commit the dependency decision**

```bash
git add package.json package-lock.json
git commit -m "build: add localization runtime"
```

## Task 2: Define Typed Plain and Plural Translation Contracts

**Files:**

- Create: `app/i18n/types.type-test.ts`
- Modify: `app/i18n/types.ts`

- [ ] **Step 1: Add failing compile-time usage fixtures**

Create `app/i18n/types.type-test.ts` with valid calls and errors TypeScript must enforce:

```ts
import type { SupportedLocale } from "./config";
import type { HomeTranslation } from "./translations/home";
import type { Translate, Translation, TranslationScope } from "./types";

declare const translate: Translate;

translate("about.title");
translate("home.exampleCount", { count: 3 });

// @ts-expect-error invalid translation path
translate("about.missing");
// @ts-expect-error plural internals are not public paths
translate("home.exampleCount.zero");
// @ts-expect-error plural translations require count
translate("home.exampleCount");

const scope: TranslationScope = "services.title";
void scope;

// @ts-expect-error required localized copy is missing
const incompleteHome = { title: "Home" } satisfies HomeTranslation;
void incompleteHome;

declare const completeTranslation: Translation;
// @ts-expect-error every configured locale must be registered
const incompleteRegistry = { en: completeTranslation } satisfies Record<
  SupportedLocale,
  Translation
>;
void incompleteRegistry;
```

- [ ] **Step 2: Run type checking to prove the contract is absent**

Run:

```bash
npm run typecheck
```

Expected: FAIL because `Translate`, plural-aware paths, and `home.exampleCount` do not exist, and at least one `@ts-expect-error` is unused.

- [ ] **Step 3: Implement the minimal type model**

Replace the path section of `app/i18n/types.ts` with:

```ts
export type Plural = {
  zero: string;
  one: string;
  other: string;
};

type Paths<T, Kind extends "plain" | "plural"> = {
  [Key in keyof T & string]: T[Key] extends Plural
    ? Kind extends "plural"
      ? Key
      : never
    : T[Key] extends string
      ? Kind extends "plain"
        ? Key
        : never
      : T[Key] extends Record<string, unknown>
        ? `${Key}.${Paths<T[Key], Kind>}`
        : never;
}[keyof T & string];

export type PlainTranslationScope = Paths<Translation, "plain">;
export type PluralTranslationScope = Paths<Translation, "plural">;
export type TranslationScope = PlainTranslationScope | PluralTranslationScope;

export type TranslationOptions = Record<string, string | number>;

export type Translate = {
  (scope: PlainTranslationScope, options?: TranslationOptions): string;
  (
    scope: PluralTranslationScope,
    options: TranslationOptions & { count: number },
  ): string;
};
```

Keep the existing `Translation` scopes and imports. In `HomeTranslation`, add `exampleCount: Plural` and import `Plural` as a type.

- [ ] **Step 4: Run type checking and observe dictionary failures**

Run:

```bash
npm run typecheck
```

Expected: FAIL because both locale values in `homeTranslations` are missing `exampleCount`; no invalid-key fixture should escape the expected-error checks.

## Task 3: Complete Dictionaries and the Exhaustive Registry

**Files:**

- Create: `app/i18n/translations/index.ts`
- Modify: `app/i18n/translations/common.ts`
- Modify: `app/i18n/translations/home.ts`
- Test: `app/i18n/types.type-test.ts`

- [ ] **Step 1: Add complete localized plural and switcher copy**

Add this field to `CommonTranslation`:

```ts
languageSwitcherLabel: string;
```

Use `"Choose language"` for `en` and `"Escolher idioma"` for `pt-BR`.

Add these values to the Home dictionaries:

```ts
// en
exampleCount: {
  zero: "No examples",
  one: "One example",
  other: "%{count} examples",
},

// pt-BR
exampleCount: {
  zero: "Nenhum exemplo",
  one: "Um exemplo",
  other: "%{count} exemplos",
},
```

- [ ] **Step 2: Assemble the only runtime translation registry**

Create `app/i18n/translations/index.ts`:

```ts
import type { SupportedLocale } from "../config";
import type { Translation } from "../types";
import { aboutTranslations } from "./about";
import { commonTranslations } from "./common";
import { homeTranslations } from "./home";
import { notFoundTranslations } from "./not-found";
import { servicesTranslations } from "./services";

export const translations = {
  en: {
    common: commonTranslations.en,
    home: homeTranslations.en,
    about: aboutTranslations.en,
    services: servicesTranslations.en,
    notFound: notFoundTranslations.en,
  },
  "pt-BR": {
    common: commonTranslations["pt-BR"],
    home: homeTranslations["pt-BR"],
    about: aboutTranslations["pt-BR"],
    services: servicesTranslations["pt-BR"],
    notFound: notFoundTranslations["pt-BR"],
  },
} satisfies Record<SupportedLocale, Translation>;
```

- [ ] **Step 3: Verify all compile-time contracts**

Run:

```bash
npm run typecheck
```

Expected: PASS. This proves invalid keys, plural internals, missing count, missing copy, and incomplete locale registration are rejected.

- [ ] **Step 4: Commit typed dictionary completion**

```bash
git add app/i18n/types.ts app/i18n/types.type-test.ts app/i18n/translations
git commit -m "feat: complete typed translation schema"
```

## Task 4: Bind `i18n-js` to Localization Context

**Files:**

- Modify: `app/i18n/i18n.tsx`
- Test: `app/i18n/i18n.test.tsx`

- [ ] **Step 1: Add failing runtime behavior tests**

Extend the probe to accept an optional count and add tests that assert:

```tsx
function PluralProbe({ count }: { count: number }) {
  const { translate } = useI18n();
  return <p>{translate("home.exampleCount", { count })}</p>;
}
```

Use `it.each` to cover `0`, `1`, and `2` in both locales, expecting `No examples`, `One example`, `2 examples`, `Nenhum exemplo`, `Um exemplo`, and `2 exemplos`. Add a test rendering English and Portuguese providers as siblings and assert both titles remain correct. Add a strict-miss probe that casts `"home.missing"` to `TranslationScope` and expect rendering to throw a missing-translation error.

- [ ] **Step 2: Run the focused test to prove the current resolver is insufficient**

Run:

```bash
npm test -- app/i18n/i18n.test.tsx
```

Expected: FAIL because plural lookup returns an object and runtime misses do not use strict `i18n-js` behavior.

- [ ] **Step 3: Replace the local resolver with a locale-bound engine**

In `app/i18n/i18n.tsx`, import `I18n`, `defaultLocale`, the registry, and `Translate`. Implement:

```ts
function createTranslate(locale: SupportedLocale): Translate {
  const i18n = new I18n(translations, {
    locale,
    defaultLocale,
    enableFallback: false,
    missingBehavior: "error",
  });

  return ((scope: TranslationScope, options?: TranslationOptions) =>
    i18n.t(scope, options) as string) as Translate;
}
```

Set `I18nValue.translate` to `Translate`, call `createTranslate(locale)` inside `I18nProvider`, and delete the hand-written reducer. Do not export or mutate an `I18n` singleton.

- [ ] **Step 4: Run focused and type tests**

Run:

```bash
npm test -- app/i18n/i18n.test.tsx && npm run typecheck
```

Expected: all i18n tests pass and TypeScript exits 0.

- [ ] **Step 5: Commit the locale-bound engine**

```bash
git add app/i18n/i18n.tsx app/i18n/i18n.test.tsx
git commit -m "feat: bind translation runtime to locale"
```

## Task 5: Resolve Localized Siblings from the Canonical Manifest

**Files:**

- Modify: `app/routing/canonical-url-manifest.ts`
- Test: `app/routing/canonical-url-manifest.test.ts`

- [ ] **Step 1: Add failing exact-path tests**

Reuse the complete manifest fixture and add:

```ts
it.each([
  ["/en/", "/pt-BR/"],
  ["/en/about", "/pt-BR/about"],
  ["/en/services", "/pt-BR/services"],
  ["/en/404", "/pt-BR/404"],
] as const)("resolves the localized sibling for %s", (pathname, expected) => {
  expect(getLocalizedUrlsForPathname(manifest, pathname)["pt-BR"]).toBe(
    expected,
  );
});

it("rejects a pathname outside the manifest", () => {
  expect(() =>
    getLocalizedUrlsForPathname(manifest, "/en/not-published"),
  ).toThrow("Canonical URL not found: /en/not-published");
});
```

- [ ] **Step 2: Run the manifest test to prove the resolver is absent**

Run:

```bash
npm test -- app/routing/canonical-url-manifest.test.ts
```

Expected: FAIL because `getLocalizedUrlsForPathname` is not exported.

- [ ] **Step 3: Implement exact manifest lookup**

Add:

```ts
export function getLocalizedUrlsForPathname(
  manifest: CanonicalUrlManifest,
  pathname: string,
): Record<SupportedLocale, string> {
  const entry = manifest.find((candidate) =>
    supportedLocales.some((locale) => candidate.urls[locale] === pathname),
  );
  if (!entry) throw new Error(`Canonical URL not found: ${pathname}`);
  return entry.urls;
}
```

Do not normalize or rewrite the pathname; exact manifest membership is the contract.

- [ ] **Step 4: Run the focused test**

Run:

```bash
npm test -- app/routing/canonical-url-manifest.test.ts
```

Expected: all canonical manifest tests pass.

- [ ] **Step 5: Commit manifest sibling resolution**

```bash
git add app/routing/canonical-url-manifest.ts app/routing/canonical-url-manifest.test.ts
git commit -m "feat: resolve localized manifest siblings"
```

## Task 6: Deliver Manifest Data Through the Prerendered Locale Route

**Files:**

- Rename: `scripts/canonical-manifest-file.ts` to `scripts/canonical-manifest-file.server.ts`
- Modify: `app/routes.ts`
- Modify: `react-router.config.ts`
- Modify: `scripts/canonical-manifest-file.test.ts`
- Modify: `app/routes/$locale.tsx`
- Modify: `app/routes/$locale._index.tsx`
- Test: `app/routes/$locale.test.tsx`
- Test: `tests/e2e/routing.spec.ts`

- [ ] **Step 1: Mark manifest filesystem access as server-only**

Rename the file and update the imports in `app/routes.ts`, `react-router.config.ts`, and `scripts/canonical-manifest-file.test.ts`. Do not change helper behavior.

- [ ] **Step 2: Add failing route tests for manifest data and switch links**

In the memory-router fixture, provide a loader returning a complete Home/About/Services/404 manifest. Add assertions that:

- `/en/about` renders `Português` with `href="/pt-BR/about"`;
- `/pt-BR/services` renders `English` with `href="/en/services"`;
- `/en/` targets `/pt-BR/` with its trailing slash;
- `/en/404` targets `/pt-BR/404`;
- the active locale is not offered as a target;
- the switcher navigation is named `Choose language` or `Escolher idioma`.

Add a direct `clientLoader` test with a `serverLoader` spy that resolves the manifest. Assert supported locales return that manifest and unsupported locales still throw a 404 response.

In `tests/e2e/routing.spec.ts`, add this page-identity table before implementing the switcher:

```ts
const languageSwitchCases = [
  ["/en/", "/pt-BR/", "Modelo de site estático"],
  ["/en/about", "/pt-BR/about", "Sobre"],
  ["/en/services", "/pt-BR/services", "Serviços"],
  ["/en/404", "/pt-BR/404", "Página não encontrada"],
] as const;
```

For each case, navigate to the English URL, click `Português`, assert the exact sibling URL and localized heading, and assert `document.documentElement.lang === "pt-BR"`.

- [ ] **Step 3: Run the route test to prove links are absent**

Run:

```bash
npm test -- 'app/routes/$locale.test.tsx' && npm run test:e2e -- --grep "preserves logical page identity"
```

Expected: both commands FAIL because the switcher and route loader are not implemented.

- [ ] **Step 4: Add the build-time loader and client forwarding**

In `app/routes/$locale.tsx`, add:

```ts
export function loader() {
  return readCanonicalManifest();
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    throw new Response(null, { status: 404 });
  }
  return serverLoader();
}
```

The loader runs only while prerendering. React Router writes static `.data` payloads for client navigation; no runtime server is introduced.

- [ ] **Step 5: Render alternate locales from manifest URLs**

In `LocalizedLayout`, read `useLoaderData<typeof loader>()`, `useLocation()`, locale metadata, and supported locales. Resolve the current entry with `getLocalizedUrlsForPathname`. Render a second `<nav>` whose translated accessible label comes from `common.languageSwitcherLabel`, filter out the current locale, and use `entry.urls[targetLocale]` directly as each `<Link to>`.

In `app/routes/$locale._index.tsx`, call `useI18n()` and render `translate("home.exampleCount", { count: 2 })` below the existing content. This demonstrates that the same typed plural translator remains available in the hydrated route tree.

- [ ] **Step 6: Run route, manifest-file, and type tests**

Run:

```bash
npm test -- 'app/routes/$locale.test.tsx' scripts/canonical-manifest-file.test.ts && npm run typecheck && npm run test:e2e -- --grep "preserves logical page identity"
```

Expected: all focused unit and browser tests pass and generated route types accept the loader/clientLoader contract.

- [ ] **Step 7: Prove the loader remains fully static**

Run:

```bash
npm run build
```

Expected: every localized HTML artifact and its data payload are generated, switch links pass static internal-link validation, `build/server` is removed, and no Node runtime artifact remains.

- [ ] **Step 8: Commit the static language switcher**

```bash
git add app/routes.ts react-router.config.ts scripts app/routes/'$locale.tsx' app/routes/'$locale._index.tsx' app/routes/'$locale.test.tsx' tests/e2e/routing.spec.ts
git commit -m "feat: add manifest-driven language switching"
```

## Task 7: Remove the Parallel Locale Scaffold

**Files:**

- Delete: `app/locales/en-US.ts`
- Delete: `app/locales/pt-BR.ts`
- Delete: `app/locales/index.ts`
- Delete: `app/locales/index.test.ts`
- Delete: `app/locales/types.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Delete the obsolete empty locale implementation**

Remove all files under `app/locales/`. The exhaustive registry under `app/i18n/translations/index.ts` is now the only translation store.

- [ ] **Step 2: Remove stale coverage configuration**

Delete any `app/locales/**` exclusion from `vitest.config.ts`; leave all thresholds unchanged.

- [ ] **Step 3: Verify no obsolete imports remain**

Run:

```bash
rg "app/locales|from .*locales" app scripts tests vitest.config.ts
```

Expected: no matches for the deleted scaffold. Imports from `app/i18n/config` are valid and remain.

- [ ] **Step 4: Run type and unit validation**

Run:

```bash
npm run typecheck && npm test
```

Expected: PASS with no reduction in test count other than removal of the obsolete empty-scaffold test.

- [ ] **Step 5: Commit consolidation**

```bash
git add -A app/locales vitest.config.ts
git commit -m "refactor: remove duplicate locale scaffold"
```

## Task 8: Verify Browser Localization Behavior

**Files:**

- Test: `tests/e2e/routing.spec.ts`

- [ ] **Step 1: Add hydration and no-persistence assertions**

Extend the browser coverage added in Task 6. On `/en/`, assert `2 examples` is visible after the page is interactive. In a fresh browser context, switch from English to Portuguese and assert `document.cookie` is empty and both `localStorage.length` and `sessionStorage.length` are zero.

- [ ] **Step 2: Run the full browser suite**

Run:

```bash
npm run test:e2e
```

Expected: all Chromium tests pass, every switch preserves identity, both locale trees remain prerendered, and the shared fixture reports no console or page errors.

- [ ] **Step 3: Commit browser acceptance coverage**

```bash
git add tests/e2e/routing.spec.ts
git commit -m "test: verify localized language switching"
```

## Task 9: Validate and Review Phase 2

**Files:**

- Review: all Phase 2 changes

- [ ] **Step 1: Format without weakening rules**

Run:

```bash
npm run format
```

Expected: only Phase 2 files receive formatting changes.

- [ ] **Step 2: Run canonical validation under the pinned Node version**

Run:

```bash
source "$HOME/.nvm/nvm.sh" && nvm use && npm run check
```

Expected: formatting, lint, TypeScript, Vitest, coverage, build, prerender, static links, and HTML language validation all pass.

- [ ] **Step 3: Run browser validation again**

Run:

```bash
npm run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 4: Run an ADR-focused architecture review**

Review against ADR 003, ADR 007, ADR 008, ADR 013, ADR 014, ADR 021, and ADR 023. Confirm there is no mutable global locale, runtime server, locale persistence, cross-locale fallback, path-rewriting switcher, duplicate translation registry, or missing static sibling.

Expected: no high or medium findings. Fix root causes and rerun Steps 2-4 if any blocking finding appears.

- [ ] **Step 5: Inspect the final phase diff**

Run:

```bash
git status --short && git diff --check && git log --oneline -10
```

Expected: no unintended files, no whitespace errors, and a coherent Phase 2 commit sequence ready for Phase 3.
