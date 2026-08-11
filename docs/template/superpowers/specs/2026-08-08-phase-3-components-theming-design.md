# Phase 3 Component and Theming Foundation Design

## Scope

Phase 3 implements the component and styling foundation defined by `docs/template/PRD.md`, ADR 011, ADR 012, ADR 013, and ADR 023. It turns the localized placeholder pages into a pleasant representative website slice that teaches the accepted component layers, Tailwind conventions, responsive composition, and theme behavior through working code.

The phase creates only components used by the representative pages. It does not provide a finished design system, introduce a component generator or variant library, add speculative form controls, create multi-brand themes, or add image infrastructure.

## Chosen Approach

Build a small warm-editorial component system with Tailwind CSS 4 and plain TypeScript class maps. Standard Tailwind scales remain the default for spacing, sizing, typography, layout, breakpoints, radii, and shadows. A small CSS custom-property layer represents only theme-sensitive semantic colors.

No component or styling dependency is added. Tailwind and ordinary React composition already provide the required behavior, and a variant library would add conceptual surface without reducing meaningful complexity in this representative component set.

## Visual Direction

The example site uses a restrained warm-editorial language:

- parchment-like light surfaces and deep ink foregrounds;
- dark charcoal surfaces and warm light foregrounds in dark mode;
- a muted teal brand accent;
- generous typography and whitespace;
- subtle borders and shadows;
- responsive compositions that remain clear on narrow screens.

The visual identity is intentionally polished but neutral enough for downstream forks to replace. It demonstrates how brand choices should flow through primitives and semantic colors rather than prescribing a permanent template brand.

## Component Layers

The project establishes the accepted structure:

```text
app/components/
  ui/
  domain/
  sections/
  site/
```

Only representative components required by the sample pages are created.

### UI

`components/ui/` contains foundational visual primitives:

- `Button`, with a small semantic variant and size API;
- `Heading`, with semantic element selection and a small visual-level API;
- `Text`, with default and muted tones;
- `Card`, using composition rather than a large configuration object;
- `Container`, for repeated horizontal page bounds.

These components own colors, typography, borders, radii, shadows, component spacing, focus states, and hover states. Plain class maps implement variants. The APIs remain intentionally small and do not expose arbitrary combinations for hypothetical use cases.

### Domain

`components/domain/` contains one `ServiceCard`. It composes `Card`, `Heading`, and `Text` and represents a meaningful content concept used by the Services page. It does not establish a generic card factory.

### Sections

`components/sections/` contains one `HeroSection` used by the Home page. It demonstrates primitive composition plus conventional Tailwind structural layout utilities. The Services route composes `ServiceCard` instances directly in a responsive grid, demonstrating that routes may retain straightforward composition JSX.

### Site

`components/site/` contains the site header, primary navigation, language switcher, and theme switcher. These components express website-specific structure and compose the UI primitives where appropriate.

Route modules may retain simple layout JSX. Existing generic wrappers are removed only when the new representative components supersede them; unrelated route behavior is unchanged.

## Styling and Tokens

`app/app.css` defines CSS custom properties for `background`, `surface`, `foreground`, `muted-foreground`, `border`, `brand`, and `brand-foreground`. Light values live on `:root`; dark values apply through a `.dark` class on the document element.

Tailwind exposes those variables as semantic utilities for use inside UI primitives. Standard utilities remain preferred for all non-theme-sensitive values. Higher component layers may use Tailwind for grid, flex, gap, responsive columns, alignment, and page composition, but do not create a competing visual language with one-off colors or component effects.

No image is required for the representative composition. If implementation reveals a real image need, it uses a direct accessible `<img>` rather than introducing an image abstraction or optimization service.

## Theme Model

The user-facing theme choices are `light`, `dark`, and `system`.

- Choosing `light` stores `light` and applies the light theme.
- Choosing `dark` stores `dark` and applies the dark theme.
- Choosing `system` removes the stored override and follows `prefers-color-scheme`.

This implements ADR 012's rule that an explicit light or dark choice persists while absence of a saved preference means system mode. Theme state remains browser-local and does not affect routing, prerendering, or static deployment.

## Initial Theme Application

A small inline script runs in `<head>` before normal hydration. It reads the saved theme defensively, falls back to `prefers-color-scheme`, applies or removes the document's `.dark` class, and sets the effective `color-scheme` before first paint.

The initialization logic is kept small because it executes as raw browser JavaScript before the application bundle. Invalid or inaccessible storage is treated as no saved preference. The server-rendered document remains valid without JavaScript, while JavaScript-enabled browsers avoid a visible incorrect-theme flash.

The hydrated theme switcher uses the same storage key and effective-theme rules. It listens for operating-system preference changes only while system mode is active. Theme changes update the document immediately and do not require navigation.

## Accessibility and Responsive Behavior

Navigation and switcher controls use explicit accessible names and visible keyboard focus states. Current language and theme state are conveyed semantically rather than by color alone. Heading levels remain structurally valid, and text/background token pairs maintain readable contrast in both themes.

The site header and page compositions use Tailwind's mobile-first breakpoints. Controls remain usable without horizontal overflow, content order remains logical on narrow screens, and desktop layouts gain columns only where space permits.

## Failure Behavior

Invalid stored theme values are ignored. Storage access failures do not prevent rendering or switching for the current page. A missing `matchMedia` implementation in non-browser test environments uses the light effective theme unless explicitly mocked. No theme failure changes localized route state or page content.

## Testing and Validation

Implementation follows test-driven development.

Unit and component tests verify:

- semantic Button variants and sizes;
- Heading element and visual-level behavior;
- Text tones and Card composition;
- the representative domain and section composition;
- accessible site navigation and switchers;
- explicit light and dark application;
- system preference application and OS preference changes;
- persistence of explicit choices;
- removal of persistence when system is selected;
- defensive handling of invalid or unavailable storage.

Playwright tests verify:

- pleasant, usable layouts at representative desktop and mobile viewports;
- explicit light and dark modes;
- system mode under light and dark emulated preferences;
- explicit preference persistence across navigation and reload;
- initial document theme is applied before hydration;
- ordinary loads do not show an incorrect-theme flash;
- language switching still preserves logical page identity;
- no browser console or page errors occur.

Static validation continues to require fully prerendered localized output with no server runtime.

## Acceptance Criteria

Phase 3 is complete when:

- all four accepted component directories exist and contain only used representative components;
- Button, Heading, Text, Card, and Container demonstrate the UI primitive layer;
- one domain component and one section demonstrate composition without speculative abstraction;
- the site header, navigation, language switcher, and theme switcher use the accepted site layer;
- Tailwind standard scales remain the default styling vocabulary;
- a small semantic CSS color-token layer supports light and dark values;
- light, dark, and system modes work in hydrated browser behavior;
- explicit light and dark choices persist and system mode removes the override;
- the effective theme is applied before paint in normal browser loads;
- representative pages are pleasant, responsive, accessible, and fully localized;
- production output remains static and requires no Node.js runtime;
- `npm run check` passes;
- `npm run test:e2e` passes; and
- an ADR-focused architecture review has no high or medium findings.
