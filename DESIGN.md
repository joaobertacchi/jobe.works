---
name: JOBE — Engineering that Works
description: The category-standard engineering-consultancy site, played straight at Linear/Stripe-level craft.
colors:
  background: "oklch(1 0 0)"
  surface: "oklch(0.985 0.002 90)"
  foreground: "oklch(0.17 0.012 262)"
  muted-foreground: "oklch(0.44 0.018 262)"
  border: "oklch(0.9 0.006 90)"
  hairline: "oklch(0.92 0.006 90)"
  brand: "oklch(0.36 0.13 262)"
  brand-foreground: "oklch(0.99 0.002 90)"
  dark-background: "oklch(0.17 0.014 262)"
  dark-surface: "oklch(0.21 0.016 262)"
  dark-foreground: "oklch(0.93 0.008 90)"
  dark-muted-foreground: "oklch(0.72 0.014 262)"
  dark-border: "oklch(0.3 0.016 262)"
  dark-hairline: "oklch(0.27 0.014 262)"
  dark-brand: "oklch(0.62 0.12 258)"
  dark-brand-foreground: "oklch(0.15 0.02 262)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.1em"
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
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-foreground}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-foreground}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: JOBE — Engineering that Works

## Overview

**Creative North Star: "The Category Standard, Played Straight"**

JOBE's site is the engineering-consultancy category standard executed at full craft, without irony and without gimmick: a white ground, near-black workhorse sans-serif, one deep engineering blue, hairline rules, and generous white space. The system exists to make the company's diagnostic-first method legible — a structured call, an evidence-based diagnosis, a directed offer — in the register of a serious engineering firm, never a hype page.

Density is moderate and consistent: tight groups, generous section separation, more space above a heading than below it. Depth comes from tonal layering and hairlines, not shadows; the only elevation is a whisper on cards. Motion is a single authored moment (the hero rise) plus restrained hover transitions. The visual voice matches the product promise: engineering that works in production.

**Key Characteristics:**

- One deep engineering-blue accent (brand) on a white/off-white ground
- Workhorse system sans for everything; no display face, no mono costume
- Hairline borders and tonal layering instead of shadows
- Section rhythm of 64–96px with 24px internal card padding
- A single authored motion moment, reduced-motion safe

## Colors

The palette is a restrained neutral ground with one committed blue accent. The accent appears as fields and actions — buttons, active nav, the isometric motif, the funnel numbering — never as scattered decoration.

### Primary

- **Engineering Blue** (oklch(0.36 0.13 262), light; oklch(0.62 0.12 258), dark): the single accent. Used for primary buttons, active navigation, small labels, the hero motif stroke, and the funnel step numbers. White text on it holds ~8.8:1 contrast in light mode.

### Neutral

- **Paper White** (oklch(1 0 0)): page background.
- **Sheet** (oklch(0.985 0.002 90)): surface behind cards, the case band, and form fields — one step off the page.
- **Ink** (oklch(0.17 0.012 262)): body and heading text.
- **Ink Muted** (oklch(0.44 0.018 262)): secondary text (≈7:1 on white).
- **Hairline** (oklch(0.92 0.006 90)): 1px dividers; **Border** (oklch(0.9 0.006 90)): card and field borders.
- Dark mode inverts the ground: deep navy-black background (oklch(0.17 0.014 262)), lifted surfaces (oklch(0.21 0.016 262)), light ink, and a lighter brand blue (oklch(0.62 0.12 258)) that keeps white-adjacent contrast.

### Named Rules

**The Single Accent Rule.** There is exactly one accent in the system. Any second hue on a screen is a defect; emphasis comes from weight, size, and the blue.

**The Tint, Never Gray Rule.** Secondary text is a desaturated blue-tinted ink, never a cold gray.

## Typography

**Display Font:** system-ui stack (ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial)
**Body Font:** the same stack.

**Character:** a workhorse grotesque spoken without affectation — the canon register. The hierarchy carries the page: heavy tight-tracked display for the promise, clean body at 65–75ch measure, small tracked uppercase labels used only as information markers (case label, cross-sell tag), never as decorative kickers.

### Hierarchy

- **Display** (700, clamp(2.25rem, 5vw, 3.75rem), 1.05, -0.03em): page-level promises — the hero headline and page titles. One per page.
- **Headline** (700, clamp(1.875rem, 3vw, 2.25rem), 1.2, -0.025em): section titles.
- **Title** (600, 1.25rem, 1.375): card and sub-section titles.
- **Body** (400, 1rem, 1.625): paragraphs; max measure ≈65–75ch.
- **Label** (600, 0.875rem, +0.1em, uppercase): factual markers only — "Case study", "Cross-sell".

### Named Rules

**The One Page-One Display Rule.** The display level appears once per page; everything below it steps down through headline and title.

**The No-Kicker Rule.** No decorative eyebrow sits above a heading. A small uppercase label is allowed only where it names a category (case, cross-sell) or where the approved composition shows it.

## Layout

A single centered container (max-width 72rem / max-w-6xl) with 16–32px side padding. Sections breathe on a 64px rhythm (96px on large screens): hero py-16 sm:py-24 lg:py-28, standard sections py-16 sm:py-24. Section separation is marked by hairlines (border-t/border-y) or by the tonal surface band of the case section.

Grids: three-up cards at md+ (grid gap 24px, md:grid-cols-3), the hero splits 1.15fr/0.85fr at lg with the motif hidden below lg, the contact page splits 0.9fr/1.1fr at lg, and the funnel is a gap-px grid on a hairline background (three cells separated by 1px rules) at md+ that stacks on mobile. The funnel's numbered steps (01/02/03) carry the sequence of the method, so their numerals are information, not decoration.

## Elevation & Depth

The system is flat by philosophy: depth is conveyed by tonal layering (surface one step off the page background) and 1px hairlines, not by shadows.

### Shadow Vocabulary

- **Card whisper** (Tailwind shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)): the only shadow in the system, on cards and the contact panel. Everything else is flat.

### Named Rules

**The Flat-by-Default Rule.** Surfaces are flat at rest. If an element needs separation, use the surface tone or a hairline; a shadow is the last resort, and only the whisper is allowed.

## Shapes

Corners are gently rounded and consistent: 8px for buttons, inputs, and links; 12px for the funnel container; 16px for cards and the contact panel. Borders are 1px hairlines in the border tone; the only colored rule is a 1px brand left rule on the cross-sell note. The pending case material is marked with a 1px dashed hairline border — a deliberate placeholder signal, not a system style. Dots (8px brand circles) mark lists; the hero motif is an SVG geometry: a brand-stroked isometric cube on a faint hairline grid, never a rendered illustration.

## Components

### Buttons

- **Shape:** rounded rectangle (8px radius), min-height 44px for primary/links, 36px for small secondary.
- **Primary:** brand background (oklch(0.36 0.13 262)), near-white text, padding 12px 20px. Hover darkens by opacity to 90%; focus shows a 2px brand outline offset 2px.
- **Secondary:** surface background, hairline border, ink text; hover shifts text to brand.

### Cards

- **Corner Style:** 16px radius.
- **Background:** surface tone; **Border:** 1px hairline; **Padding:** 24px.
- **Shadow:** the card whisper only.

### Inputs / Fields

- **Style:** surface background, 1px hairline border, 8px radius, 8px 12px padding.
- **Focus:** 2px brand outline offset 2px; **Error:** inline message text naming the problem and the fix.

### Navigation

- Wordmark left ("JOBE", bold, tight tracking), links in a row (14px, medium weight). Active state is brand-colored and semibold; hover shifts to brand. The header carries a bottom hairline; the footer repeats the wordmark with the tagline and email.

### Signature: the Isometric Motif

A pure SVG geometry — a brand-blue isometric cube on a faint hairline grid with wireframe callouts — sits beside the hero headline at lg+. It is the one recurring signature: drawn geometry, flat, aria-hidden, presentational.

## Do's and Don'ts

### Do:

- **Do** let the white ground and hairline rules carry the layout; density comes from content, not boxes.
- **Do** use the brand blue for fields and actions at page scale — buttons, active nav, motif, numbering — not as scattered accents.
- **Do** keep body measure near 65–75ch and one display headline per page.
- **Do** mark placeholders honestly (dashed border, explicit "pending" copy) rather than inventing evidence.

### Don't:

- **Don't** introduce a second accent, a gradient, or glass; there is one blue.
- **Don't** put an eyebrow or kicker above a heading outside the approved annotations.
- **Don't** use hard offset shadows, emoji or glyph icons, or monospace as a "technical" costume.
- **Don't** render illustration where the system draws geometry — the motif is SVG linework, never a shaded scene.
