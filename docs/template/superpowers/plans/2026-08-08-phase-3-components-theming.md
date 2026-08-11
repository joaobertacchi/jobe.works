# Phase 3 Component and Theming Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pleasant warm-editorial component foundation with representative UI, domain, section, and site layers plus flash-free light, dark, and system themes.

**Architecture:** Stateless primitives own the visual language, while domain, section, site, and route components compose them with Tailwind layout utilities. A small browser theme module owns storage and effective-theme behavior; a static inline script applies the effective class before styles and hydration, while the route remains the only locale and manifest-data boundary.

**Tech Stack:** TypeScript 5.9, React 19, React Router 8 Framework Mode, Tailwind CSS 4, Vitest, React Testing Library, Playwright

---

## File Structure

### Create

- `app/components/ui/button.tsx`: semantic native button variants and sizes.
- `app/components/ui/heading.tsx`: semantic heading element independent from visual level.
- `app/components/ui/text.tsx`: paragraph or span with default and muted tones.
- `app/components/ui/card.tsx`: composable themed surface.
- `app/components/ui/container.tsx`: shared responsive horizontal bounds.
- `app/components/ui/primitives.test.tsx`: contracts for all five primitives.
- `app/components/domain/service-card.tsx`: representative content concept composed from primitives.
- `app/components/domain/service-card.test.tsx`: service-card structure.
- `app/components/sections/hero-section.tsx`: representative Home hero composition.
- `app/components/sections/hero-section.test.tsx`: hero semantics and heading structure.
- `app/components/site/primary-navigation.tsx`: localized locale-preserving navigation.
- `app/components/site/language-switcher.tsx`: manifest URL map rendered as alternate-locale links.
- `app/components/site/theme-switcher.tsx`: accessible light, dark, and system controls.
- `app/components/site/site-header.tsx`: responsive site composition.
- `app/components/site/site-components.test.tsx`: navigation, language, theme, and header behavior.
- `app/theme.ts`: theme types, storage helpers, effective-theme application, and bootstrap script.
- `app/theme.test.ts`: pure behavior matrix and pre-hydration script tests.
- `tests/e2e/components-theming.spec.ts`: browser theme, responsive layout, persistence, and no-flash acceptance.

### Modify

- `app/app.css`: Tailwind semantic color mappings and warm light/dark palettes.
- `app/root.tsx`: pre-hydration script, hydration warning boundary, fonts, and primitive-based errors.
- `app/root.test.tsx`: document bootstrap order and root error rendering.
- `app/i18n/translations/common.ts`: site identity, navigation label, and theme controls.
- `app/i18n/translations/home.ts`: editorial hero copy while retaining plural schema coverage.
- `app/i18n/translations/about.ts`: representative About copy.
- `app/i18n/translations/services.ts`: three named localized services.
- `app/i18n/translations/not-found.ts`: polished utility copy.
- `app/routes/$locale.tsx`: compose `SiteHeader` and pass manifest sibling URLs.
- `app/routes/$locale.test.tsx`: localized site composition.
- `app/routes/$locale._index.tsx`: compose `HeroSection`.
- `app/routes/$locale.about.tsx`: compose primitives directly.
- `app/routes/$locale.services.tsx`: compose a responsive `ServiceCard` grid.
- `app/routes/$locale.404.tsx`: compose primitives directly.
- `app/routes/$locale.$.tsx`: reuse localized 404 composition.
- `tests/e2e/routing.spec.ts`: update placeholder-copy assertions while preserving route contracts.

### Delete

- `app/components/content-page.tsx`
- `app/components/not-found-page.tsx`

### Intentionally Unchanged

- `package.json` and `package-lock.json`: no component, variant, theme, or state dependency is needed.
- `react-router.config.ts`: keep `ssr: false` and complete canonical prerendering.
- `playwright.config.ts`: retain Chromium and existing failure artifacts.

## Task 1: Establish the Phase 2 Baseline

**Files:**

- Review: Phase 2 implementation and working tree

- [ ] **Step 1: Activate the pinned Node version**

Run:

```bash
source "$HOME/.nvm/nvm.sh" && nvm use
```

Expected: `Now using node v22.22.2`.

- [ ] **Step 2: Verify Phase 2 before changing visuals**

Run:

```bash
npm run check && npm run test:e2e
```

Expected: both commands pass. Stop and fix Phase 2 root causes before continuing if they do not.

- [ ] **Step 3: Confirm no dependency change is required**

Use Tailwind, React, and plain class maps already installed. Do not add a variant library, class-merging library, icon package, theme package, or global state package.

## Task 2: Create the Button Primitive

**Files:**

- Create: `app/components/ui/button.tsx`
- Create: `app/components/ui/primitives.test.tsx`

- [ ] **Step 1: Write failing Button tests**

Create `app/components/ui/primitives.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("UI primitives", () => {
  it("renders the default primary button with safe native behavior", () => {
    render(<Button>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-brand", "min-h-11");
  });

  it("applies semantic Button variants, sizes, and native props", () => {
    render(
      <Button variant="secondary" size="sm" disabled className="w-full">
        Change theme
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Change theme" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("border-border", "min-h-9", "w-full");
  });
});
```

- [ ] **Step 2: Run the test to prove the primitive is absent**

Run:

```bash
npm test -- app/components/ui/primitives.test.tsx
```

Expected: FAIL because `./button` does not exist.

- [ ] **Step 3: Implement the minimal semantic API**

Create `app/components/ui/button.tsx` with native button props, these maps, and simple class joining:

```tsx
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-brand text-brand-foreground hover:opacity-90",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-background",
} as const;

const sizes = {
  sm: "min-h-9 px-3 py-2 text-sm",
  lg: "min-h-11 px-5 py-3 text-base",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = "primary",
  size = "lg",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        variants[variant],
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
npm test -- app/components/ui/primitives.test.tsx
```

Expected: both Button tests pass.

- [ ] **Step 5: Commit Button**

```bash
git add app/components/ui/button.tsx app/components/ui/primitives.test.tsx
git commit -m "feat: add button primitive"
```

## Task 3: Create Typography and Surface Primitives

**Files:**

- Create: `app/components/ui/heading.tsx`
- Create: `app/components/ui/text.tsx`
- Create: `app/components/ui/card.tsx`
- Create: `app/components/ui/container.tsx`
- Modify: `app/components/ui/primitives.test.tsx`

- [ ] **Step 1: Add failing primitive contracts**

Extend the test file to assert:

```tsx
render(
  <Heading as="h2" level="display">
    Independent semantics
  </Heading>,
);
expect(
  screen.getByRole("heading", { level: 2, name: "Independent semantics" }),
).toHaveClass("text-4xl");

render(<Text tone="muted">Supporting copy</Text>);
expect(screen.getByText("Supporting copy")).toHaveClass(
  "text-muted-foreground",
);

render(<Text as="span">Inline copy</Text>);
expect(screen.getByText("Inline copy").tagName).toBe("SPAN");

render(<Card className="mt-4">Card content</Card>);
expect(screen.getByText("Card content")).toHaveClass("bg-surface", "mt-4");

render(<Container className="py-8">Contained</Container>);
expect(screen.getByText("Contained")).toHaveClass("max-w-6xl", "py-8");
```

- [ ] **Step 2: Run the test to prove the modules are absent**

Run:

```bash
npm test -- app/components/ui/primitives.test.tsx
```

Expected: FAIL on missing Heading, Text, Card, and Container imports.

- [ ] **Step 3: Implement Heading**

Use `as?: "h1" | "h2" | "h3"`, `level?: "display" | "section" | "card"`, ordinary heading attributes, and this map:

```ts
const levels = {
  display: "font-serif text-4xl font-semibold leading-tight sm:text-6xl",
  section: "font-serif text-3xl font-semibold leading-tight sm:text-4xl",
  card: "font-serif text-xl font-semibold leading-snug",
} as const;
```

Default to `as="h2"` and `level="section"`. Join the selected class, `text-foreground`, and caller `className`.

- [ ] **Step 4: Implement Text, Card, and Container**

`Text` supports `as?: "p" | "span"` and `tone?: "default" | "muted"`; default to a paragraph and map muted to `text-muted-foreground`. `Card` is a `div` with `rounded-2xl border border-border bg-surface p-6 shadow-sm`. `Container` is a `div` with `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8`. All accept and append native `className`.

- [ ] **Step 5: Run all primitive tests**

Run:

```bash
npm test -- app/components/ui/primitives.test.tsx
```

Expected: all primitive tests pass.

- [ ] **Step 6: Commit the primitive set**

```bash
git add app/components/ui
git commit -m "feat: add typography and surface primitives"
```

## Task 4: Define Theme State and Pre-Hydration Behavior

**Files:**

- Create: `app/theme.ts`
- Create: `app/theme.test.ts`

- [ ] **Step 1: Write the complete failing behavior matrix**

In `app/theme.test.ts`, cover:

- stored `light` over a dark system;
- stored `dark` over a light system;
- absent or invalid storage following light and dark system values;
- throwing storage treated as system without throwing;
- `persistTheme("light")` and `persistTheme("dark")` using `setItem`;
- `persistTheme("system")` using `removeItem`;
- `applyTheme` toggling `.dark` and setting `style.colorScheme`;
- bootstrap behavior for the same cases.

Use this contract in test imports:

```ts
export const THEME_STORAGE_KEY = "theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";
export type Theme = "light" | "dark" | "system";
export type EffectiveTheme = Exclude<Theme, "system">;
export type ThemeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function readTheme(storage?: ThemeStorage): Theme;
export function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): EffectiveTheme;
export function applyTheme(theme: EffectiveTheme, root: HTMLElement): void;
export function persistTheme(theme: Theme, storage?: ThemeStorage): void;
export const themeInitializationScript: string;
```

Execute the static script with `new Function(themeInitializationScript)()` after stubbing `localStorage` and `matchMedia` on `globalThis`.

- [ ] **Step 2: Run the test to prove the theme module is absent**

Run:

```bash
npm test -- app/theme.test.ts
```

Expected: FAIL because `app/theme.ts` does not exist.

- [ ] **Step 3: Implement pure theme helpers**

Implement the exported contracts. `readTheme` returns only stored `light` or `dark`; every other value and storage exception returns `system`. `resolveTheme` returns the explicit theme or maps system preference to light/dark. `persistTheme` removes the key for system and catches storage errors. `applyTheme` uses:

```ts
root.classList.toggle("dark", theme === "dark");
root.style.colorScheme = theme;
```

When optional storage is absent, resolve `window.localStorage` only inside the function and only when `window` exists.

- [ ] **Step 4: Add the fixed bootstrap string**

Export this constant without interpolating user data:

```ts
export const themeInitializationScript = `(() => {
  const root = document.documentElement;
  let saved;
  try { saved = localStorage.getItem("theme"); } catch {}
  const prefersDark = typeof matchMedia === "function" &&
    matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = saved === "dark" || (saved !== "light" && prefersDark);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
})();`;
```

- [ ] **Step 5: Run the theme behavior tests**

Run:

```bash
npm test -- app/theme.test.ts
```

Expected: all behavior-table and bootstrap tests pass.

- [ ] **Step 6: Commit the theme model**

```bash
git add app/theme.ts app/theme.test.ts
git commit -m "feat: add browser theme model"
```

## Task 5: Initialize Theme Before Hydration

**Files:**

- Modify: `app/root.tsx`
- Test: `app/root.test.tsx`

- [ ] **Step 1: Add failing document-shell assertions**

Extend the existing `Document` test to assert:

- `suppressHydrationWarning` is true on `<html>`;
- the first executable script in `<head>` contains `THEME_STORAGE_KEY` and `prefers-color-scheme`;
- the bootstrap script appears before `<Links />`;
- the font stylesheet requests both Inter and Source Serif 4.

- [ ] **Step 2: Run the root test to prove bootstrap is absent**

Run:

```bash
npm test -- app/root.test.tsx
```

Expected: FAIL because no theme script or hydration warning boundary exists.

- [ ] **Step 3: Add the static script to the document head**

Import `themeInitializationScript`. Set `suppressHydrationWarning` only on `<html>` and render:

```tsx
<script>{themeInitializationScript}</script>
```

after viewport metadata and before `<Meta />` and `<Links />`. Keep the script static and do not use route data, browser data, or user content.

- [ ] **Step 4: Update editorial font loading**

Keep the two preconnect entries and change the Google Fonts stylesheet to request Inter and Source Serif 4. Do not add a font package or local asset pipeline.

- [ ] **Step 5: Run the root tests**

Run:

```bash
npm test -- app/root.test.tsx
```

Expected: the document and existing error-boundary tests pass.

- [ ] **Step 6: Commit pre-hydration initialization**

```bash
git add app/root.tsx app/root.test.tsx
git commit -m "feat: initialize theme before hydration"
```

## Task 6: Build the Accessible Theme Switcher

**Files:**

- Create: `app/components/site/theme-switcher.tsx`
- Create: `app/components/site/site-components.test.tsx`
- Modify: `app/i18n/translations/common.ts`

- [ ] **Step 1: Extend typed localized controls**

Add to `CommonTranslation` and both locale values:

```ts
siteName: string;
navigationLabel: string;
theme: {
  label: string;
  light: string;
  dark: string;
  system: string;
}
```

English values are `Agent-ready sites`, `Primary navigation`, `Theme`, `Light`, `Dark`, and `System`. Brazilian Portuguese values are `Sites prontos para agentes`, `Navegação principal`, `Tema`, `Claro`, `Escuro`, and `Sistema`.

- [ ] **Step 2: Write failing ThemeSwitcher tests**

Create a controllable `MediaQueryList` test double and render the component inside `I18nProvider`. Assert:

- the group has localized accessible name `Theme`;
- exactly one of Light, Dark, and System is pressed after mount;
- selecting Dark stores `dark`, applies `.dark`, and sets dark color scheme;
- selecting Light stores `light` and removes `.dark`;
- selecting System removes the key and follows the media query;
- a media-query change updates only system mode;
- explicit modes ignore later media changes;
- throwing storage and missing `matchMedia` do not throw and use light.

- [ ] **Step 3: Run the focused test to prove the component is absent**

Run:

```bash
npm test -- app/components/site/site-components.test.tsx
```

Expected: FAIL because `ThemeSwitcher` does not exist.

- [ ] **Step 4: Implement the hydrated switcher**

Initialize state to `system` so prerendered and first hydration markup match. In an effect, read storage, resolve the media preference, apply the effective theme, and update state. Render three `Button variant="secondary" size="sm"` controls inside a localized `role="group"`, using `aria-pressed` for selection.

On selection, call `persistTheme`, apply the effective theme synchronously, then update state. In a separate effect, subscribe to `matchMedia(THEME_MEDIA_QUERY).change` only while state is `system`; remove the listener on cleanup. Do not persist the effective system result.

- [ ] **Step 5: Run component and type tests**

Run:

```bash
npm test -- app/components/site/site-components.test.tsx && npm run typecheck
```

Expected: all switcher behavior passes and both locale dictionaries satisfy the expanded schema.

- [ ] **Step 6: Commit the theme switcher**

```bash
git add app/components/site/theme-switcher.tsx app/components/site/site-components.test.tsx app/i18n/translations/common.ts
git commit -m "feat: add accessible theme switcher"
```

## Task 7: Extract Site Navigation, Language Switching, and Header

**Files:**

- Create: `app/components/site/primary-navigation.tsx`
- Create: `app/components/site/language-switcher.tsx`
- Create: `app/components/site/site-header.tsx`
- Modify: `app/components/site/site-components.test.tsx`
- Modify: `app/routes/$locale.tsx`
- Test: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Add failing site-composition tests**

Inside a memory router and `I18nProvider`, test that `PrimaryNavigation` renders localized Home, About, and Services links under the localized navigation label and sets `aria-current="page"` on the active destination.

Test `LanguageSwitcher` with:

```ts
const urls = { en: "/en/about", "pt-BR": "/pt-BR/about" } as const;
```

Assert English context renders only `Português` targeting `/pt-BR/about`, while Portuguese context renders only `English` targeting `/en/about`.

Test `SiteHeader` renders site identity, primary navigation, language navigation, and theme group without a menu abstraction.

- [ ] **Step 2: Run the focused tests to prove site components are absent**

Run:

```bash
npm test -- app/components/site/site-components.test.tsx 'app/routes/$locale.test.tsx'
```

Expected: FAIL on missing site components and old inline-header expectations.

- [ ] **Step 3: Implement PrimaryNavigation**

Use `useI18n()` and `NavLink`. Build exact links from the active locale: `/${locale}/`, `/${locale}/about`, and `/${locale}/services`. Use `end` for Home. The `<nav>` receives `translate("common.navigationLabel")`; active links use `aria-current` from `NavLink` and a brand-colored text class.

- [ ] **Step 4: Implement LanguageSwitcher**

Accept:

```ts
type LanguageSwitcherProps = {
  urls: Record<SupportedLocale, string>;
};
```

Read the current locale from `useI18n()`, filter it from `supportedLocales`, and render exact `urls[targetLocale]` values under `translate("common.languageSwitcherLabel")`. Do not inspect or rewrite `location.pathname`.

- [ ] **Step 5: Implement SiteHeader and route composition**

`SiteHeader` accepts the same `urls` prop and composes `Container`, site identity, `PrimaryNavigation`, `LanguageSwitcher`, and `ThemeSwitcher` in a wrapping mobile-first flex layout.

In `$locale.tsx`, keep loader data and pathname resolution at the route boundary:

```tsx
const urls = getLocalizedUrlsForPathname(manifest, pathname);
return (
  <>
    <SiteHeader urls={urls} />
    <Outlet />
  </>
);
```

Remove the private inline navigation and switcher markup.

Replace raw headings and paragraphs in the unsupported-locale and locale error states with `Heading` and `Text`. Keep their structural `<main>` elements and existing status behavior unchanged.

- [ ] **Step 6: Run site and localized-route tests**

Run:

```bash
npm test -- app/components/site/site-components.test.tsx 'app/routes/$locale.test.tsx'
```

Expected: site tests pass, existing locale links remain exact, and unsupported-locale behavior remains unchanged.

- [ ] **Step 7: Commit the site layer**

```bash
git add app/components/site app/routes/'$locale.tsx' app/routes/'$locale.test.tsx'
git commit -m "feat: add localized site header"
```

## Task 8: Add the Representative Domain and Section Layers

**Files:**

- Create: `app/components/domain/service-card.tsx`
- Create: `app/components/domain/service-card.test.tsx`
- Create: `app/components/sections/hero-section.tsx`
- Create: `app/components/sections/hero-section.test.tsx`

- [ ] **Step 1: Write failing ServiceCard tests**

Render `ServiceCard` with title and description. Assert it renders an `article`, an `h2`, and the description. Do not assert implementation-only React component names.

- [ ] **Step 2: Write failing HeroSection tests**

Render `HeroSection` with eyebrow, title, and description. Assert one `section`, one `h1`, the eyebrow, and description. Assert the section contains the shared maximum-width container class and mobile-first vertical spacing.

- [ ] **Step 3: Run both tests to prove the layers are absent**

Run:

```bash
npm test -- app/components/domain/service-card.test.tsx app/components/sections/hero-section.test.tsx
```

Expected: FAIL because both modules are missing.

- [ ] **Step 4: Implement ServiceCard by composition**

Accept only `{ title: string; description: string }`. Render an `<article>` containing `Card`, `Heading as="h2" level="card"`, and `Text tone="muted"`. Do not add icons, links, badges, slots, or configuration objects.

- [ ] **Step 5: Implement HeroSection by composition**

Accept only `{ eyebrow: string; title: string; description: string }`. Render a `<section>` with `Container`, `Text as="span"`, `Heading as="h1" level="display"`, and `Text tone="muted"`. Use structural Tailwind utilities for a restrained max-width and responsive spacing. Do not add a speculative CTA.

- [ ] **Step 6: Run both focused tests**

Run:

```bash
npm test -- app/components/domain/service-card.test.tsx app/components/sections/hero-section.test.tsx
```

Expected: all domain and section tests pass.

- [ ] **Step 7: Commit representative composition**

```bash
git add app/components/domain app/components/sections
git commit -m "feat: add representative content composition"
```

## Task 9: Compose Fully Localized Representative Pages

**Files:**

- Modify: `app/i18n/translations/home.ts`
- Modify: `app/i18n/translations/about.ts`
- Modify: `app/i18n/translations/services.ts`
- Modify: `app/i18n/translations/not-found.ts`
- Modify: `app/routes/$locale._index.tsx`
- Modify: `app/routes/$locale.about.tsx`
- Modify: `app/routes/$locale.services.tsx`
- Modify: `app/routes/$locale.404.tsx`
- Modify: `app/routes/$locale.$.tsx`
- Modify: `app/routes/$locale.test.tsx`
- Modify: `tests/e2e/routing.spec.ts`
- Delete: `app/components/content-page.tsx`
- Delete: `app/components/not-found-page.tsx`

- [ ] **Step 1: Add failing localized route expectations**

Extend route tests to assert:

- Home renders a localized eyebrow and its `h1` through `HeroSection`;
- About renders localized `h1` and body copy;
- Services renders localized `h1` plus three service `article` elements and `h2` headings;
- 404 renders localized utility copy;
- both English and Brazilian Portuguese satisfy the same structure.

Update Playwright heading values only where the placeholder copy changes. Remove the temporary visible `2 examples` browser assertion from Phase 2; plural behavior remains covered by type, unit, and provider tests.

- [ ] **Step 2: Run route tests to prove representative copy is absent**

Run:

```bash
npm test -- 'app/routes/$locale.test.tsx'
```

Expected: FAIL because the existing routes still render generic placeholders.

- [ ] **Step 3: Expand page-scoped schemas and both locale dictionaries**

Use these shapes:

```ts
type HomeTranslation = {
  eyebrow: string;
  title: string;
  description: string;
  exampleCount: Plural;
};

type ServicesTranslation = {
  title: string;
  description: string;
  items: {
    foundation: { title: string; description: string };
    localization: { title: string; description: string };
    delivery: { title: string; description: string };
  };
};
```

Keep About and NotFound as explicit title/description objects, but replace placeholder prose with concise representative English and Portuguese copy. Keep all user-facing copy in these dictionaries.

- [ ] **Step 4: Compose the routes**

Home passes translated eyebrow/title/description into `HeroSection`. About and 404 use `main`, `Container`, `Heading`, and `Text` directly. Services uses one `h1`, introduction text, and exactly three explicit `ServiceCard` instances inside:

```tsx
<div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
```

Do not translate arrays or return structured values from `translate`; call each named leaf path explicitly.

- [ ] **Step 5: Reuse localized 404 composition for the splat route**

Keep `$locale.$.tsx` delegating to the localized 404 route component. Do not create another copy or add a fallback redirect.

- [ ] **Step 6: Delete superseded generic wrappers**

Delete `content-page.tsx` and `not-found-page.tsx`. Verify no imports remain.

- [ ] **Step 7: Run route, type, and routing browser tests**

Run:

```bash
npm test -- 'app/routes/$locale.test.tsx' && npm run typecheck && npm run test:e2e -- tests/e2e/routing.spec.ts
```

Expected: all representative content renders in both locales, manifest language switching still preserves identity, and no copy literal is introduced in route TSX.

- [ ] **Step 8: Commit localized page composition**

```bash
git add -A -- app/components/content-page.tsx app/components/not-found-page.tsx app/i18n/translations/home.ts app/i18n/translations/about.ts app/i18n/translations/services.ts app/i18n/translations/not-found.ts 'app/routes/$locale._index.tsx' 'app/routes/$locale.about.tsx' 'app/routes/$locale.services.tsx' 'app/routes/$locale.404.tsx' 'app/routes/$locale.$.tsx' 'app/routes/$locale.test.tsx' tests/e2e/routing.spec.ts
git commit -m "feat: compose localized example pages"
```

## Task 10: Apply the Warm Editorial Tailwind Theme

**Files:**

- Modify: `app/app.css`
- Modify: `app/root.tsx`
- Test: `tests/e2e/components-theming.spec.ts`

- [ ] **Step 1: Write failing browser style and responsive assertions**

Create `tests/e2e/components-theming.spec.ts`. Before changing CSS, assert on `/en/services` that:

- computed body background and foreground differ between explicit light and dark modes;
- the page has no horizontal overflow at 390x844;
- three service articles stack at the same left coordinate on mobile;
- desktop at 1280x800 produces at least two distinct card left coordinates;
- header navigation and all theme controls remain visible.

- [ ] **Step 2: Run the focused test against old CSS**

Run:

```bash
npm run test:e2e -- tests/e2e/components-theming.spec.ts
```

Expected: FAIL because semantic tokens, editorial colors, and final responsive styling are not defined.

- [ ] **Step 3: Replace broad media-query styling with semantic tokens**

Use:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --font-sans:
    "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji";
  --font-serif: "Source Serif 4", ui-serif, Georgia, serif;
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
}

:root {
  --background: oklch(0.974 0.014 84);
  --surface: oklch(0.995 0.006 84);
  --foreground: oklch(0.23 0.025 52);
  --muted-foreground: oklch(0.48 0.025 60);
  --border: oklch(0.85 0.025 75);
  --brand: oklch(0.42 0.075 185);
  --brand-foreground: oklch(0.98 0.01 90);
}

.dark {
  --background: oklch(0.18 0.015 55);
  --surface: oklch(0.23 0.016 55);
  --foreground: oklch(0.92 0.018 82);
  --muted-foreground: oklch(0.72 0.02 75);
  --border: oklch(0.35 0.02 65);
  --brand: oklch(0.72 0.08 180);
  --brand-foreground: oklch(0.17 0.02 180);
}

html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}

body {
  @apply min-h-screen bg-background font-sans text-foreground antialiased;
}
```

Do not add semantic spacing, typography, radius, shadow, or breakpoint tokens.

- [ ] **Step 4: Use primitives in root error rendering**

Replace raw root error headings and paragraphs with `Heading` and `Text`, keeping `<main>`, `<pre>`, and `<code>` structural/debug elements. Use only layout utilities outside primitives.

- [ ] **Step 5: Build to verify Tailwind utility generation**

Run:

```bash
npm run build
```

Expected: Tailwind generates semantic utilities, every locale prerenders, the pre-hydration script remains before stylesheet links, and static validation passes.

- [ ] **Step 6: Run focused browser styling tests**

Run:

```bash
npm run test:e2e -- tests/e2e/components-theming.spec.ts
```

Expected: computed colors differ, mobile has no overflow, and cards use responsive columns.

- [ ] **Step 7: Commit the visual foundation**

```bash
git add app/app.css app/root.tsx tests/e2e/components-theming.spec.ts
git commit -m "style: add warm editorial theme"
```

## Task 11: Complete Browser Theme and No-Flash Acceptance

**Files:**

- Modify: `tests/e2e/components-theming.spec.ts`

- [ ] **Step 1: Add the explicit and system theme journeys**

Cover:

1. no stored value plus emulated light preference produces no `.dark`;
2. no stored value plus emulated dark preference produces `.dark`;
3. selecting Light stores `light` and removes `.dark`;
4. selecting Dark stores `dark` and adds `.dark`;
5. selecting System removes the storage key and follows media preference;
6. `page.emulateMedia({ colorScheme: "dark" })` updates live in system mode;
7. media changes do not override explicit Light or Dark;
8. explicit preference survives route navigation and reload;
9. language switching preserves theme;
10. invalid stored values follow system mode without console errors.

- [ ] **Step 2: Add keyboard and semantic assertions**

Verify one `h1` per representative page, Services uses `h2` card headings, `Tab` reaches navigation and theme controls with a non-zero computed outline, and selected controls expose `aria-pressed` rather than color-only state.

- [ ] **Step 3: Add parser-order no-flash evidence**

Fetch `/en/` with Playwright's request fixture and assert the inline script text appears before the first stylesheet link in raw HTML.

Before navigation, use `page.addInitScript` to seed `theme=dark` and instrument `DOMTokenList.prototype.toggle` so applying `dark` records `performance.mark("theme-applied")`. Under an emulated light OS preference, navigate and wait for first-contentful-paint. Assert:

```ts
expect(themeApplied).toBeLessThanOrEqual(firstContentfulPaint);
```

Also assert `<html>` already has `.dark` and inline `style.colorScheme === "dark"` after navigation. The test must fail if hydration is the first code to correct the theme.

- [ ] **Step 4: Run the focused browser suite**

Run:

```bash
npm run test:e2e -- tests/e2e/components-theming.spec.ts
```

Expected: all explicit, system, persistence, responsive, accessibility, and no-flash tests pass with no console or page errors.

- [ ] **Step 5: Commit browser acceptance**

```bash
git add tests/e2e/components-theming.spec.ts
git commit -m "test: verify responsive theme behavior"
```

## Task 12: Validate and Review Phase 3

**Files:**

- Review: all Phase 3 changes

- [ ] **Step 1: Format without weakening rules**

Run:

```bash
npm run format
```

Expected: only intentional Phase 3 files change.

- [ ] **Step 2: Run canonical validation under the pinned Node version**

Run:

```bash
source "$HOME/.nvm/nvm.sh" && nvm use && npm run check
```

Expected: formatting, lint, TypeScript, Vitest, coverage, complexity, build, prerender, static links, and HTML language validation all pass.

- [ ] **Step 3: Run the complete browser suite**

Run:

```bash
npm run test:e2e
```

Expected: routing, localization, desktop/mobile composition, explicit themes, system mode, persistence, and no-flash behavior all pass in Chromium.

- [ ] **Step 4: Run an ADR-focused architecture review**

Review against ADR 003, ADR 007, ADR 008, ADR 011, ADR 012, ADR 013, ADR 014, ADR 021, and ADR 023. Confirm there is no backend, runtime server, duplicate visual language, speculative component set, unnecessary dependency, multi-brand theme, untranslated page copy, manually rewritten locale URL, or weakened validation.

Expected: no high or medium findings. Fix root causes and rerun Steps 2-4 if any blocking finding appears.

- [ ] **Step 5: Inspect the final phase diff**

Run:

```bash
git status --short && git diff --check && git log --oneline -15
```

Expected: no unintended files, no whitespace errors, and a coherent Phase 3 commit sequence.
