---
name: JOBE — Engineering that Works
description: Systems Wayfinding — a folded engineering atlas where one route crosses every fold and resolves at a directed decision. Deep engineering blue, compressed signage type, precise topology.
colors:
  background: "oklch(1 0 0)"
  surface: "oklch(0.985 0.002 90)"
  foreground: "oklch(0.17 0.012 262)"
  muted-foreground: "oklch(0.44 0.018 262)"
  border: "oklch(0.9 0.006 90)"
  hairline: "oklch(0.92 0.006 90)"
  brand: "oklch(0.36 0.13 262)"
  brand-foreground: "oklch(0.99 0.002 90)"
  atlas-blue: "oklch(0.36 0.14 262)"
  atlas-blue-soft: "oklch(0.74 0.07 258)"
  atlas-blue-deep: "oklch(0.29 0.12 262)"
  atlas-route: "oklch(0.36 0.14 262)"
  atlas-canvas: "oklch(0.995 0.003 258)"
  atlas-paper: "oklch(0.985 0.004 255)"
  atlas-wash: "oklch(0.965 0.016 258)"
  atlas-diagnosis: "oklch(0.95 0.025 258)"
  atlas-action-secondary: "oklch(0.975 0.012 258)"
  atlas-on-blue-muted: "oklch(0.86 0.028 258)"
  atlas-ink: "oklch(0.16 0.016 262)"
  atlas-fold: "oklch(0.9 0.012 258)"
  dark-background: "oklch(0.17 0.014 262)"
  dark-surface: "oklch(0.21 0.016 262)"
  dark-foreground: "oklch(0.93 0.008 90)"
  dark-muted-foreground: "oklch(0.72 0.014 262)"
  dark-border: "oklch(0.3 0.016 262)"
  dark-hairline: "oklch(0.27 0.014 262)"
  dark-brand: "oklch(0.62 0.12 258)"
  dark-brand-foreground: "oklch(0.15 0.02 262)"
  dark-atlas-blue: "oklch(0.31 0.12 262)"
  dark-atlas-blue-soft: "oklch(0.71 0.08 258)"
  dark-atlas-blue-deep: "oklch(0.22 0.09 262)"
  dark-atlas-route: "oklch(0.68 0.12 258)"
  dark-atlas-canvas: "oklch(0.14 0.016 262)"
  dark-atlas-paper: "oklch(0.2 0.016 262)"
  dark-atlas-wash: "oklch(0.29 0.026 262)"
  dark-atlas-diagnosis: "oklch(0.33 0.04 260)"
  dark-atlas-action-secondary: "oklch(0.25 0.025 262)"
  dark-atlas-on-blue-muted: "oklch(0.82 0.03 258)"
  dark-atlas-ink: "oklch(0.94 0.008 90)"
  dark-atlas-fold: "oklch(0.31 0.02 262)"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(4rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.03em"
    textTransform: "uppercase"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 5vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  subhead:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.4rem, 2.2vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1rem, 1.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.09em"
    textTransform: "uppercase"
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
chamfer: "0.8rem"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  section: "64px"
---

# Design System: JOBE — Engineering that Works

## Overview

**Creative North Star: "The Folded Atlas."**

JOBE's homepage reads like a folded engineering atlas: it turns a complex product system into one legible route that crosses every fold and resolves at a directed decision. The system refuses the generic split hero, technical cube, and service-card catalog that every AI-generated consultancy page defaults to. Instead the surface is built from three unequal planes — proposition on the left, a dominant deep engineering-blue topology panel in the center, and a decision rail on the right — stitched together by a single route that runs from context through diagnosis to production and settles at the primary action.

The material is paper-and-precision, never glass. Surfaces fold and clip with the angular corners of a technical blueprint; the brand reads as signage rather than marketing gloss. The one accent, a committed deep engineering blue, does the structural work — it carries the topology, the case plate, and the primary action — while near-white paper and ink carry the reading. Everything is legible in both light and dark, in English and Brazilian Portuguese, with no fabricated score, metric, customer, or credential.

**Key Characteristics:**

- Three-plane hero (proposition / topology / decision rail) with one route crossing every fold.
- Compressed Barlow Condensed signage typography, all uppercase, tight leading.
- A single deep engineering blue as the structural accent on white/ink paper.
- Clipped, angled plates (blueprint corners) and hairline fold lines — no shadows, no glass, no gradients.
- Precision SVG topology: dashed secondary routes, a resolving primary route, station nodes, and a diagnosis junction.
- Published evidence only — the case plate shows real StockCast figures from the case study; nothing is fabricated.

## Colors

Tight two-tone engineering palette: deep blue on neutral paper/ink. The blue is the structural and accent voice; paper and ink carry text. Both themes are supported, with the blue deepening in dark mode to preserve contrast against near-white labels.

### Primary

- **Engineering Blue** (`--atlas-blue`, `oklch(0.36 0.14 262)`; dark `oklch(0.31 0.12 262)`): The single accent. Fills the topology panel, StockCast case plate, primary action, and the mobile CTA. Never a second hue.
- **Engineering Blue Soft** (`--atlas-blue-soft`, `oklch(0.74 0.07 258)`; dark `oklch(0.71 0.08 258)`): The route and wire color on the blue panel — the track that crosses the fold, the cross-route stroke, and secondary topology strokes. Reads as lightened blue, never a new hue.
- **Engineering Blue Deep** (`--atlas-blue-deep`, `oklch(0.29 0.12 262)`; dark `oklch(0.22 0.09 262)`): The inset blueprint surface inside the case evidence ledger. It adds depth within a blue region without inventing another hue.
- **Atlas Route** (`--atlas-route`, light `--atlas-blue`; dark `oklch(0.68 0.12 258)`): The route, node, index, and wayfinding-link color on paper. Dark mode remaps the semantic role to a lighter blue instead of mechanically reusing the blue-panel fill.

### Neutral

- **Atlas Paper** (`--atlas-paper`, `oklch(0.985 0.004 255)`; dark `oklch(0.2 0.016 262)`): The primary reading surface. Background of the proposition and method planes, consent banner, and fold highlights. In dark mode it's the ink-dark panel.
- **Atlas Canvas** (`--atlas-canvas`, `oklch(0.995 0.003 258)`; dark `oklch(0.14 0.016 262)`): The quiet page field behind reading sections. It remains nearly neutral but carries enough blue to bind the long page together.
- **Atlas Wash** (`--atlas-wash`, `oklch(0.965 0.016 258)`; dark `oklch(0.29 0.026 262)`): The decision rail and secondary plane surface.
- **Diagnosis Surface** (`--atlas-diagnosis`, `oklch(0.95 0.025 258)`; dark `oklch(0.33 0.04 260)`): The emphasized method station. Its additional chroma signals structural importance while the label, node size, and geometry preserve a non-color cue.
- **Secondary Action Surface** (`--atlas-action-secondary`, `oklch(0.975 0.012 258)`; dark `oklch(0.25 0.025 262)`): The quiet plate behind secondary actions, visibly distinct from both canvas and primary blue.
- **On-Blue Muted** (`--atlas-on-blue-muted`, `oklch(0.86 0.028 258)`; dark `oklch(0.82 0.03 258)`): Secondary text on saturated blue. It is an explicit opaque foreground rather than a context-dependent translucent gray.
- **Atlas Ink** (`--atlas-ink`, `oklch(0.16 0.016 262)`; dark `oklch(0.94 0.008 90)`): Primary text and the diagnosis-junction label fill on the blue panel. Dark mode flips it to near-white for contrast.
- **Atlas Fold** (`--atlas-fold`, `oklch(0.9 0.012 258)`; dark `oklch(0.31 0.02 262)`): Hairline fold lines that divide planes, border the atlas, and separate service/method stops.
- **Brand** (`--brand`, `oklch(0.36 0.13 262)`; dark `oklch(0.62 0.12 258)`): The earlier brand token, retained for the selection pill, inline links, footer node, and site-header underline. Same blue family.
- **Background / Foreground / Border / Hairline**: the neutral canvas values that back the whole site and the consent banner.

### Named Rules

**The One Blue Rule.** Exactly one accent hue. Saturated blue, route blue, paper washes, and diagnosis surfaces vary lightness and chroma within the 258–262° family; `--brand` stays in the same family. Never introduce a second accent, gradient, glass, or neon.

**The Published Evidence Rule.** Any figure on the site must already be published in the case study (`app/i18n/translations/case.ts`). No score, metric, customer, credential, or outcome claim is invented; empty placeholder tracks read as broken and are not used.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow / sans-serif fallback), installed locally via `@fontsource/barlow-condensed` — no remote CDN.
**Body Font:** system sans stack (`ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`).
**Label/Mono Font:** Barlow Condensed, used for every label, index, stop title, and navigation item.

**Character:** Condensed, compressed, signage-like. Uppercase everywhere in display, headline, title, label, and nav. Tight leading and slightly negative tracking make it read like a technical wayfinding board rather than a marketing brochure. The contrast between this compressed display face and the open system body face is the voice of the system.

### Hierarchy

- **Display** (700, `clamp(4rem, 7vw, 6rem)`, 0.84, uppercase, -0.03em): The hero proposition. Max width 12ch; it dominates the first viewport.
- **Headline** (600, `clamp(2.75rem, 5vw, 5rem)`, 0.95, uppercase, -0.02em): Section titles (Services, Como Funciona) and inner-page h1 (`Heading level="display"`).
- **Subhead** (600, `clamp(1.75rem, 3vw, 2.5rem)`, 1, uppercase, -0.02em): h2 inside reading pages (About, Case, Privacy) via `Heading level="section"`.
- **Title** (600, `clamp(1.4rem, 2.2vw, 2rem)`, 1.05, uppercase, -0.02em): Service stop and method stop headings.
- **Body** (400, `clamp(1rem, 1.2vw, 1.125rem)`, 1.65): Descriptions, max ~68ch, `--muted-foreground`.
- **Label** (600, `0.875rem`, 0.09em, uppercase): Index names (JOÃO BERTACCHI, ESTUDO DE CASO), and small utility text.

### Named Rules

**The Signage Rule.** Display/headline/title/label/nav are Barlow Condensed uppercase. Body is the open system stack, lowercase sentence case. The blend of compressed signage and open reading text is the system's voice; never make body copy condensed.

## Layout

The system uses a 96rem (max) atlas width, hairline-bordered on the sides, that reads as a folded sheet. The hero is a three-column grid — `minmax(0,37fr) minmax(0,43fr) minmax(15rem,20fr)` — proposition left, topology center, decision rail right. Each plane is a `.atlas-plane` separated by a 1px `--atlas-fold` rule and given a fold-shaped clip on its shared edge. The hero's height budget is `min(44rem, 100svh - 4.75rem)` so the fold line falls between planes, never through a plate.

Sections below the hero (Services, StockCast Case, How It Works) share the atlas border and a `clamp(4.5rem,6vw,6.5rem)` vertical rhythm, with `var(--atlas-edge)` inline padding. Each section has a three-column heading row (title / description / inline link).

Responsive behavior (three tiers — phone, intermediate, desktop — mirrored by `tests/e2e/layouts.ts`):

- **≤72rem:** Hero collapses to two columns, the decision rail becomes a full-width two-column band, and the actions wrap to two columns.
- **≤48rem:** Hero stacks into a single column, a compact CTA appears immediately after the h1, the desktop topology is exchanged for a dedicated mobile topology — a hub-centered circuit with dashed station connections and the production bullseye as terminus, no through-rail — the decision rail keeps its 01→02 plate sequence, and the cross-route draws in its mobile mode: a left-corridor entry into the hub's left port and the desktop exit docking on the primary plate. Services and method routes become vertical steps along a left rail.

## Elevation & Depth

This system is flat and paper-based. Depth is conveyed by tonal layering and folding, never by shadows, blur, glass, or gradients. A plane overlaps another via `clip-path` fold angles and hairline borders, and the topology route resolves via a `stroke-dasharray` draw-on animation for those who allow motion. There is no `box-shadow` anywhere in the atlas.

**The Flat-By-Fold Rule.** No shadows, no glassmorphism, no gradients. The fold is the depth cue: hairline `--atlas-fold` separators and angular clip-path corners make adjacent planes read as stacked sheets.

## Shapes

Angular, blueprint-like geometry. The signature is the clipped corner: the actions, ui/ primitives, cards, and the Evidence Ledger use a `clip-path` with a notched corner from the shared `--atlas-chamfer` token (0.8rem), and the diagnosis method stop uses an eight-point clipped octagon at the same token. The chamfer reads as a punched plate: the host element is clipped, while two stacked pseudo-elements paint a 1px `--atlas-blue` rim that follows the notch, so cut corners carry a border and keyboard focus outlines stay unclipped. Station nodes are small stroked circles, and route lines use square caps and miter joins. No rounded pill buttons, no soft blobs.

**The Notched-Corner Rule.** Corners are cut, not rounded. The default radius stays small (8px) for incidental chrome; the distinctive actions, plates, case plate, and Evidence Ledger use a notched clip-angle to read as punched blueprint plates.

## Components

### Buttons / Actions

- **Shape:** Notched-corner clip-path (`calc(100% - var(--atlas-chamfer))` chamfer on opposite corners) with a 1px `--atlas-blue` rim painted by stacked pseudo-elements so the cut corners carry a border.
- **Primary action** (`.atlas-action--primary`): `--atlas-blue` fill, white text, min-height 7rem, an index number (01/02) above the label, and a right arrow. Hover/focus is a true inversion in both themes: light fills `--atlas-ink` with white text; dark fills `--atlas-ink` (near-white) with `--atlas-paper` text.
- **Secondary action** (`.atlas-action--secondary`): `--atlas-action-secondary` fill with `--atlas-blue` text and border; dark mode remaps the text and border to `--atlas-route` for contrast.
- **Mobile primary** (`.atlas-mobile-primary`): compact primary CTA shown only at ≤48rem, placed right after the h1.
- **Solid action** (`.atlas-action--solid`): compact blue-filled action used after a route (home and Services method sections).
- **ui/ primitives** (`Button`, `TextLink` primary/inverse → `.ui-action`): the same chamfered rim-and-fill plate in a compact size, Barlow uppercase; `.ui-action--literal` keeps literal strings such as email addresses in their own case. `Button variant="link"` is the underlined text control for low-weight actions (cookie settings, customize). `Card` → `.atlas-plate`: chamfered paper plate with a `--atlas-fold` rim; never rounded or shadowed.
- **Focus:** `outline: 2px solid var(--brand); outline-offset: 3px` on the unclipped host (white on the light case-plate variant).

### Cross-Route (Hero Signature)

`.atlas-cross-route` is measured at runtime from the rendered hero and drawn only after measurement. It is an orthogonal, chamfered circuit-board route in two measured segments, and every segment runs in a measured empty corridor — it must never intersect station plates, labels, or copy:

- **Entry.** It starts at a terminal node docked on the proposition plane's content edge in the gap above the method line ("UMA ROTA…"), runs horizontally across the first fold, turns down the corridor just inside the topology panel's left edge, and terminates at the diagnosis junction's left centerline port — it is the only stroke entering the junction. The topology's own primary route resumes at the junction's bottom port and carries the route to the production station.
- **Exit.** From the junction's right edge it resumes horizontally above the lower stations, turns down the quiet corridor inside the panel's right edge, crosses the fold, runs above the decision plates, and drops into a terminal node docked on the primary plate's top edge near its left corner.

If a corridor collapses at a given viewport, the route does not draw. It re-measures on resize and after fonts load. At ≤48rem it runs in its mobile mode: the entry departs from a terminal below the method statement, descends the plane's left corridor, and docks into the hub's left port, while the exit keeps the desktop shape, docking on the primary plate.

### Route Grammar

One route family, two tiers. The primary route (cross-route, topology primary route, mobile rails) is 4px on desktop and 3px on mobile with `vector-effect: non-scaling-stroke`; stop lines under service/method stations are 2px. Color follows the surface: `--atlas-blue-soft` on the blue panel, `--atlas-route` on paper.

### Topology (Signature Component)

An accessible SVG frame (`.systems-topology`) rendering the engineering system as a route: Context → Product → Diagnosis → Architecture → Production, with Integrations, Security, and Observability as secondary stations. Dashed secondary routes, a resolving primary route, stroked station nodes, and a diagnosis junction (a filled paper plaque on a wide octagon) that carries an ink label. The junction plaque is sized so the diagnosis label fits inside its circular plaque in both locales — geometry adapts to copy, never the reverse — and secondary routes anchor and dot to plate edges, never to label baselines. Desktop and dedicated mobile variants sit in the same component, with the mobile shown only at ≤48rem; the mobile variant shows a stable subset of the global station numbering (01 Context, 02 Product, 06 Architecture, 07 Production) — it never re-indexes. On mobile, 01 and 02 stack above the junction and 06 below it; every connection lands on the hub's left and right flats — three ports per side, top and bottom edges stay clean. The left flat carries 02 (upper), the primary entry (middle), and 06 (lower); the right flat carries 01 (upper), the primary exit (middle), and 07 Production (lower), whose bullseye terminus hangs below 06 off its own solid lane. The junction plaque flips to ink fill with paper text in dark theme for contrast. All text is `stroke: none` and filled. There is no fabricated data — it is a topology, not a measured diagram.

### Evidence Ledger

`.atlas-evidence` on the blue case plate: a clipped `--atlas-blue-deep` panel with a header row (status and since-date) and a `dl` of four published StockCast figures — label left in `--atlas-on-blue-muted`, value right in the title ramp with tabular numerals. Rows are separated by a translucent white hairline.

### CTA Band

`AtlasCtaBand` (`.atlas-cta-band`): a full-width `--atlas-blue` section closing Services and About — headline, muted-on-blue description, and a white `.atlas-action--light` plus an optional underlined white text link.

### Case (StockCast)

`.atlas-case` is a full-bleed deep-blue plate: left copy (index name, headline, description) and right the Evidence Ledger. Its figures come only from the published case study; it points to the real case via a white "Ver estudo de caso" action.

### Founder Portrait

`.atlas-portrait` on About: a 4:5 photograph inside a chamfered plate — 1px `--atlas-blue` rim, `--atlas-plate-clip` notches, no shadow or rounding — with a Barlow uppercase caption (name · role). It sits beside the founder text at ≥48rem (15rem column) and above it on phones (≤20rem). Derivatives are AVIF + WebP at 320/480/640w, each ≤24 KB, generated offline with ImageMagick from the original and imported through Vite; never place photographs in `public/`.

### Navigation

Site header uses a `.site-header__inner` grid (wordmark / primary nav / utilities), a 2px brand underline accent, and compressed uppercase nav items. The primary nav lists every content destination (Services, Case study, Readiness Check, About); the current page is marked with `aria-current="page"` and a brand color plus a 2px inset underline, computed from the trailing-slash-normalized pathname so prerendered HTML and the hydrated page agree. Utilities hold the language switcher and a persistent compact `ui-action` booking call (`.site-header__cta`) to Contact. Nav links and utilities keep 2.75rem touch targets. On narrower viewports the nav wraps to a full-width row under the identity row.

### Footer & Consent

Footer is the route terminus: a 2px brand route runs from the page edge along the top border into the brand-stroked node dot. It holds the wordmark, tagline, contact email, a full destination row (Home, Services, Case study, Readiness Check, About, Contact), a legal row (Privacy, Cookie settings as a link-styled button), and the light/dark theme switcher. Header and footer chrome both span the 96rem atlas width, with their content and accents anchored to the shared `--atlas-edge` token (the same edge the hero and sections read from). A visually-hidden skip link is the first focusable element on every localized page. Consent is a fixed bottom banner (`.consent-banner`) that reserves body padding from its measured height (`--consent-banner-height`, floored at 5.5rem) via `:has([data-consent-banner])`; Privacy and Customize are underlined text controls on one row; Accept and Reject are equal-weight chamfered actions side by side (two equal columns on mobile, 2.75rem touch targets).

## Do's and Don'ts

### Do:

- **Do** use the one engineering blue as the structural accent; keep `--atlas-blue` / `--atlas-blue-soft` / `--brand` in the same hue family.
- **Do** keep the three-plane hero with one route crossing every fold and resolving at the primary action.
- **Do** use Barlow Condensed uppercase for display, headline, title, label, and nav.
- **Do** show only figures already published in the case study — never render an invented metric, score, customer, or credential.
- **Do** support both light and dark themes and both en and pt-BR, with a working switch.
- **Do** use notched/clipped or hairline-fold geometry for depth instead of shadows.

### Don't:

- **Don't** introduce a second accent color, gradient, glass, or neon.
- **Don't** use box-shadows or blur to convey depth — the fold is the depth cue.
- **Don't** render fabricated evidence, scores, or outcomes on the Evidence Ledger or anywhere else.
- **Don't** use a generic split hero, technical cube, or a plain service-card catalog.
- **Don't** use rounded-pill buttons or soft blobs; cut corners with notches.
- **Don't** add a backend, server, route action, or runtime server; keep the site static and prerendered.
