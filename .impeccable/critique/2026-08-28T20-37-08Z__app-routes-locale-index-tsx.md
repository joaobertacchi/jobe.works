---
target: homepage hero (three broken screenshots, /pt-BR)
total_score: 15
max_score: 32
na_heuristics: 7,10
p0_count: 3
p1_count: 2
timestamp: 2026-08-28T20-37-08Z
slug: app-routes-locale-index-tsx
---
# Critique — Homepage hero (`app/routes/$locale._index.tsx` @ `/pt-BR`), three supplied screenshots

**Mode:** Persuade · **World:** Systems Wayfinding / "Folded Atlas" · **Evidence:** dual isolated assessments (design review + Playwright/build evidence against `npm run build` + sirv preview)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Route-resolve animation misinforms — it "connects" what it visually slices through |
| 2 | Match System / Real World | 2 | Wayfinding metaphor right; garbled DIAGNÓSTICO/PRODUTO labels break the signage language |
| 3 | User Control and Freedom | 3 | No traps; theme/language/consent intact; cross-route pointer-events:none; focus unclipped |
| 4 | Consistency and Standards | 2 | Desktop and mobile present two unrelated route systems; junction dot anchors inconsistent |
| 5 | Error Prevention | 1 | Fixed SVG geometry with hard-coded font sizes guarantees label collisions for long locales |
| 6 | Recognition Rather Than Recall | 2 | Comp's legend dropped; broken labels force guessing |
| 7 | Flexibility and Efficiency | n/a | Static Persuade surface; one task path by design |
| 8 | Aesthetic and Minimalist Design | 1 | Route-through-copy, label collisions, stray sliver, cropped plates, letterboxed topology |
| 9 | Error Recovery | 2 | Nothing errors in-user, but the page displays un-recovered layout errors |
| 10 | Help and Documentation | n/a | Marketing homepage; no doc surface in scope |
| **Total** | | **15/32** | **Poor (47%) — major overhaul of the hero required** |

## Design Specificity Verdict

**Authored world, broken signature organs.** The skeleton is unmistakably JOBE's Folded Atlas — three unequal planes, clip-path fold wedges, chamfered plates with rim pseudo-elements, disciplined one-blue tokens, condensed signage display. The left proposition plane is comp-grade. But the memorable moment — the route that crosses every fold — is the failure point. The code draws one horizontal segment at junction height (inevitably through the description band) plus one obstacle-blind straight diagonal; the comp's orthogonal chamfered route from an anchored node below the paragraph was never implemented. Fixed SVG text geometry in a bilingual system overflows the DIAGNÓSTICO plaque in *both* locales. For a brand whose pitch is precision engineering, "their own diagram is broken" contradicts the pitch worse than generic ever could.

## What's Working

1. **Proposition plane is comp-grade** — display clamp, 0.84 leading, 12ch balance, uppercase method hairline; survives pt-BR with three clean lines.
2. **Material grammar is real, not costume** — fold wedges, chamfered plates with unclipped focus outlines, one-hue token architecture, zero shadows/gradients.
3. **Trust strategy implemented** — empty ScoreCard tracks, honest `role="img"` topology, factual founder label; mobile compact CTA exists and sits above the fold.

## Priority Issues

1. **[P0] Fixed SVG text geometry vs locale content** — DIAGNÓSTICO text bbox (73.9u) exceeds its 64u plaque at every breakpoint (confirmed desktop + mobile); junction dots anchored on text baselines garble "02 PRODUTO" and graze OBSERVABILIDADE/04. Root cause, not bug: hard-coded 15–17px SVG font sizes, no measurement, no per-locale sizing. Fix: size plaque/octagon from measured label width, move dot anchors to plate edges. → `$impeccable typeset`
2. **[P0] Cross-route anchorless + obstacle-blind** — Enters at viewport edge x≈1 at y≈447/466, striking the proposition paragraph at 1218 and 1024; diagonal slices 05 OBSERVABILIDADE at desktop and runs a mega back-diagonal (707,466)→(386,911) across the tablet panel. DESIGN.md:195 codified the literal "enters at left edge" contract — the document is the bug; the comp anchors differently. Fix: re-spec to anchored, orthogonal, chamfered segments with non-intersection validation; update DESIGN.md. → `$impeccable adapt`
3. **[P0] Mobile route fiction** — Detached pale rail at x≈27 (y≈157–712) never touches the centered topology column (x≈124–388); two competing systems. Priority inversion: only the secondary 02 plate renders in the wash band (rail's primary hidden ≤48rem) while the compact primary CTA sits far above. Fix: one route system aligned to the SVG column; define the rail's purpose. → `$impeccable adapt`
4. **[P1] No first-viewport fit budget** — Hero min-height 44rem + header ≈780px; at 705/898 viewports the 02 plate crops mid-plate (bottom 749 vs fold 705; 980 vs 898) and the consent banner occludes the CTA column. Fix: `calc(100svh − header)` budget; crop line falls between planes, never through a plate. → `$impeccable adapt`
5. **[P1] `/pt-BR` (slashless) hydration 404** — Prerendered HTML serves 200, then the canonical-pathname guard rejects the slashless locale root and swaps in "Página não encontrada" after JS. Real defect on hosts without slash redirects. → `$impeccable harden`

## Persona Red Flags

- **Jordan (first-timer):** the page's own explanatory device contradicts itself — a route starting nowhere, an illegible junction label, no legend. Leaves with the vocabulary but not the mechanism.
- **Riley (stress tester):** resizing across 72rem triggers the mega-diagonal; slashless URL 404s after hydration; a screenshot of this hero is all a skeptic needs to drop the vendor.
- **Casey (mobile):** compact CTA exists above the fold (good), but mid-page the only visible action is a secondary case-study plate beside a rail that touches nothing — where distracted thumbs bounce.

## Minor Observations

- Detached pale-blue sliver top-right of the panel ≈(960–975, 77–125) — confirmed; the "black fragment" was the intentional dark notch facet (not reproduced as a defect).
- `.atlas-proposition__description` paper background is a mask patch hiding the route collision, not a fix.
- Topology letterboxed: 387px SVG centered in a ≥704px panel — dead blue bands vs the comp's dense plane.
- Services/method connector reaches only stop 01; stops 02/03 nodes orphaned vs the comp's continuous route.
- pt-BR description string begins with 8 literal spaces (`app/i18n/translations/home.ts:153`).
- DESIGN.md grid drift (38/44/13–18 documented vs 37/43/15–20 shipped).
- Cross-route is JS-dependent — absent from prerendered HTML; no-JS visitors lose the signature silently.
- Deterministic detector: exit 0, zero findings (positive control fired). Its rules model CSS anti-patterns, not runtime SVG geometry — this defect class is invisible to it.

## Questions to Consider

1. DESIGN.md codified the literal cross-route contract that produces the collision; the comp anchors differently. Which artifact is the contract, and who route-checks a literal reading before it ships?
2. Is the topology copy-constrained or geometry-adaptive? Right now neither — pick one.
3. Would you hire an engineer whose system diagram has labels overlapping strokes and a route striking through text? Why is the homepage bar lower than the client-work bar?
4. What is the mobile rail *for* — decoration, orientation, or sequence? Answer that and the mobile rebuild designs itself.
