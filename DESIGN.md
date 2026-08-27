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
  atlas-paper: "oklch(0.985 0.004 255)"
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
  dark-atlas-paper: "oklch(0.2 0.016 262)"
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
- Explicit, empty scorecard tracks — evidence is never fabricated.

## Colors

Tight two-tone engineering palette: deep blue on neutral paper/ink. The blue is the structural and accent voice; paper and ink carry text. Both themes are supported, with the blue deepening in dark mode to preserve contrast against near-white labels.

### Primary

- **Engineering Blue** (`--atlas-blue`, `oklch(0.36 0.14 262)`; dark `oklch(0.31 0.12 262)`): The single accent. Fills the topology panel, StockCast case plate, primary action, and the mobile CTA. Never a second hue.
- **Engineering Blue Soft** (`--atlas-blue-soft`, `oklch(0.74 0.07 258)`; dark `oklch(0.71 0.08 258)`): The route and wire color on the blue panel — the track that crosses the fold, the cross-route stroke, and secondary topology strokes. Reads as lightened blue, never a new hue.

### Neutral

- **Atlas Paper** (`--atlas-paper`, `oklch(0.985 0.004 255)`; dark `oklch(0.2 0.016 262)`): The reading surface. Background of the proposition plane, decision rail, action cards, and the fold highlight. In dark mode it's the ink-dark panel.
- **Atlas Ink** (`--atlas-ink`, `oklch(0.16 0.016 262)`; dark `oklch(0.94 0.008 90)`): Primary text and the diagnosis-junction label fill on the blue panel. Dark mode flips it to near-white for contrast.
- **Atlas Fold** (`--atlas-fold`, `oklch(0.9 0.012 258)`; dark `oklch(0.31 0.02 262)`): Hairline fold lines that divide planes, border the atlas, and separate service/method stops.
- **Brand** (`--brand`, `oklch(0.36 0.13 262)`; dark `oklch(0.62 0.12 258)`): The earlier brand token, retained for the selection pill, inline links, footer node, and site-header underline. Same blue family.
- **Background / Foreground / Border / Hairline**: the neutral canvas values that back the whole site and the consent banner.

### Named Rules

**The One Blue Rule.** Exactly one accent hue. `--atlas-blue` and `--atlas-blue-soft` are lightness variants of the same hue; `--brand` stays in the same family. Never introduce a second accent, gradient, glass, or neon.

**The Empty Evidence Rule.** The ScoreCard shows empty tracks and a pending status. No score, metric, customer, credential, or outcome claim is ever rendered. `--atlas-blue-soft` fills a track only when real measurement exists.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow / sans-serif fallback), installed locally via `@fontsource/barlow-condensed` — no remote CDN.
**Body Font:** system sans stack (`ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`).
**Label/Mono Font:** Barlow Condensed, used for every label, index, stop title, and navigation item.

**Character:** Condensed, compressed, signage-like. Uppercase everywhere in display, headline, title, label, and nav. Tight leading and slightly negative tracking make it read like a technical wayfinding board rather than a marketing brochure. The contrast between this compressed display face and the open system body face is the voice of the system.

### Hierarchy

- **Display** (700, `clamp(4rem, 7vw, 6rem)`, 0.84, uppercase, -0.03em): The hero proposition. Max width 7ch; it dominates the first viewport.
- **Headline** (600, `clamp(2.75rem, 5vw, 5rem)`, 0.95, uppercase, -0.02em): Section titles (Services, Como Funciona).
- **Title** (600, `clamp(1.4rem, 2.2vw, 2rem)`, 1.05, uppercase, -0.02em): Service stop and method stop headings.
- **Body** (400, `clamp(1rem, 1.2vw, 1.125rem)`, 1.65): Descriptions, max ~68ch, `--muted-foreground`.
- **Label** (600, `0.875rem`, 0.09em, uppercase): Index names (JOÃO BERTACCHI, ESTUDO DE CASO), and small utility text.

### Named Rules

**The Signage Rule.** Display/headline/title/label/nav are Barlow Condensed uppercase. Body is the open system stack, lowercase sentence case. The blend of compressed signage and open reading text is the system's voice; never make body copy condensed.

## Layout

The system uses a 96rem (max) atlas width, hairline-bordered on the sides, that reads as a folded sheet. The hero is a three-column grid — `minmax(0,38fr) minmax(0,44fr) minmax(13rem,18fr)` — proposition left, topology center, decision rail right. Each plane is a `.atlas-plane` separated by a 1px `--atlas-fold` rule and given a fold-shaped clip on its shared edge.

Sections below the hero (Services, StockCast Case, How It Works) share the atlas border and a `clamp(4.5rem,8vw,8rem)` vertical rhythm, with `clamp(1.25rem,4vw,4rem)` inline padding. Each section has a three-column heading row (title / description / inline link).

Responsive behavior:

- **≤72rem:** Hero collapses to two columns, the decision rail becomes a full-width two-column band, and the actions wrap to two columns.
- **≤48rem:** Hero stacks into a single column, a vertical route rail runs down the left, a compact CTA appears immediately after the h1, the desktop topology is exchanged for a dedicated vertical mobile topology, and the cross-route SVG is hidden. Services and method routes become vertical steps along a left rail.

## Elevation & Depth

This system is flat and paper-based. Depth is conveyed by tonal layering and folding, never by shadows, blur, glass, or gradients. A plane overlaps another via `clip-path` fold angles and hairline borders, and the topology route resolves via a `stroke-dasharray` draw-on animation for those who allow motion. There is no `box-shadow` anywhere in the atlas.

**The Flat-By-Fold Rule.** No shadows, no glassmorphism, no gradients. The fold is the depth cue: hairline `--atlas-fold` separators and angular clip-path corners make adjacent planes read as stacked sheets.

## Shapes

Angular, blueprint-like geometry. The signature is the clipped corner: the primary/secondary actions and the ScoreCard use a `clip-path` with a notched corner (`polygon(0 0, calc(100% - 0.8rem) 0, 100% 0.8rem, ...)`), and the diagnosis method stop uses an eight-point clipped octagon. Station nodes are small stroked circles, and route lines use square caps and miter joins. No rounded pill buttons, no soft blobs.

**The Notched-Corner Rule.** Corners are cut, not rounded. The default radius stays small (8px) for incidental chrome; the distinctive actions, case plate, and ScoreCard use a notched clip-angle to read as punched blueprint plates.

## Components

### Buttons / Actions

- **Shape:** Notched-corner clip-path (`calc(100% - 0.8rem)` chamfer on opposite corners), 1px `--atlas-blue` border.
- **Primary action** (`.atlas-action--primary`): `--atlas-blue` fill, white text, min-height 7rem, an index number (01/02) above the label, and a right arrow. Hover/focus fills `--atlas-ink`.
- **Secondary action** (`.atlas-action--secondary`): `--atlas-paper` fill, `--atlas-blue` text, 1px blue border.
- **Mobile primary** (`.atlas-mobile-primary`): compact `--atlas-blue` CTA shown only at ≤48rem, placed right after the h1.
- **Focus:** `outline: 2px solid var(--brand); outline-offset: 3px`.

### Topology (Signature Component)

An accessible SVG frame (`.systems-topology`) rendering the engineering system as a route: Context → Product → Diagnosis → Architecture → Production, with Integrations, Security, and Observability as secondary stations. Dashed secondary routes, a resolving primary route, stroked station nodes, and a diagnosis junction (a filled paper plaque on a small octagon) that carries an ink label. Desktop and dedicated mobile variants sit in the same component, with the mobile shown only at ≤48rem. All text is `stroke: none` and filled, and the diagnosis junction label uses `--atlas-ink` for contrast on the blue panel. There is no fabricated data — it is a topology, not a measured diagram.

### ScoreCard

`.atlas-scorecard` on the blue case plate: a clipped panel with a heading row, five named tracks (Context, Product, Architecture, Integrations, Security), each with an empty track bar and a pending marker. Rows are separated by a translucent white hairline. This is intentionally empty — evidence is never invented.

### Case (StockCast)

`.atlas-case` is a full-bleed deep-blue plate: left copy (index name, headline, description) and right the ScoreCard. It claims no fabricated metrics; it points to the real case via a white "Ver estudo de caso" action.

### Navigation

Site header uses a `.site-header__inner` grid (wordmark / primary nav / utilities), a 2px brand underline accent, and compressed uppercase nav items. The theme switcher is a two-option segmented control (`.theme-switcher`) with an `aria-pressed` state, and the language switcher is a `.language-switcher`. On mobile the nav wraps to a full-width row and utilities right-align.

### Footer & Consent

Footer has a brand-stroked node dot on the top border, the wordmark, a nav row, and a contact email. Consent is a fixed bottom banner (`.consent-banner`) that adds body padding via `:has([data-consent-banner])`, and its controls stack on mobile.

## Do's and Don'ts

### Do:

- **Do** use the one engineering blue as the structural accent; keep `--atlas-blue` / `--atlas-blue-soft` / `--brand` in the same hue family.
- **Do** keep the three-plane hero with one route crossing every fold and resolving at the primary action.
- **Do** use Barlow Condensed uppercase for display, headline, title, label, and nav.
- **Do** keep ScoreCard tracks empty and the status pending — never render an invented metric, score, customer, or credential.
- **Do** support both light and dark themes and both en and pt-BR, with a working switch.
- **Do** use notched/clipped or hairline-fold geometry for depth instead of shadows.

### Don't:

- **Don't** introduce a second accent color, gradient, glass, or neon.
- **Don't** use box-shadows or blur to convey depth — the fold is the depth cue.
- **Don't** render fabricated evidence, scores, or outcomes on the ScoreCard or anywhere else.
- **Don't** use a generic split hero, technical cube, or a plain service-card catalog.
- **Don't** use rounded-pill buttons or soft blobs; cut corners with notches.
- **Don't** add a backend, server, route action, or runtime server; keep the site static and prerendered.
