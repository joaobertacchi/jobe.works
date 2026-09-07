---
target: homepage after redesign
total_score: 14
max_score: 24
na_heuristics: 3,7,9,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-27T20-28-50Z
slug: app-routes-locale-index-tsx
---
# Critique — Homepage (Folded Atlas redesign, visual pass)

Method: dual-agent (A: ses_fbb2a7842ffeHpePyGFApfcB2m · B: ses_fbb2a41feffewWR1szdMozUqfk)
Target: `app/routes/$locale._index.tsx` · Mode: Persuade · Live inspection: 1440×900 (en, pt-BR, dark) + 390×844, screenshots + computed-style forensics + detector overlay on 3 views.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Scorecard "pending" honest; route animation resolves into geometric contradiction |
| 2 | Match System / Real World | 3 | Topology fits audience; mobile renumbering (04/05 change meaning) breaks the model |
| 3 | User Control and Freedom | n/a | Persuade surface; only exits are consent choices, which work |
| 4 | Consistency and Standards | 1 | Three route strokes, three chamfer values, five left edges (16/32/58/137/1), 04/05 renumbering |
| 5 | Error Prevention | 3 | Consent dialog careful; duplicated ctaId pollutes attribution |
| 6 | Recognition Rather Than Recall | 3 | Indexed rails excellent; severed route forces guessing |
| 7 | Flexibility and Efficiency | n/a | Homepage, no repeated flows |
| 8 | Aesthetic and Minimalist Design | 2 | Stray clipped circles, dangling stubs, double grids, duplicated tagline |
| 9 | Error Recovery | n/a | No user-input errors possible |
| 10 | Help and Documentation | n/a | Marketing homepage |
| **Total** | | **14/24** | **Acceptable (58%)** |

## Design Specificity Verdict

**LLM assessment:** The Folded Atlas is genuinely authored for JOBE — diagnostic topology, honest empty scorecard, indexed decision rail, and "evaluate first, then direct" copy could not be pasted onto an agency template. The tragedy is execution: the one device that makes it a system — the continuous route resolving at the decision — is the least finished thing on the page, so it currently reads as three disconnected map decorations plus a stray clipped circle.

**Deterministic scan:** CLI: 0 findings across 7 markup files. Browser overlay found 7–8 anti-patterns per view (en desktop, pt-BR desktop, en mobile): `text-overflow` on `h1.atlas-display` (87–118px overflow — corroborates the fictional 7ch measure against "ENGINEERING"), `all-caps-body`, `gray-on-color`, `overused-font` (roboto fallback sniff), `kicker-above-heading`, `em-dash-overuse` (10), `bounce-easing` (`var(--animate-bounce)`), `line-length` (~93 chars). False positives: `all-caps-body` and `kicker-above-heading` are the committed signage/index pattern; `gray-on-color` text on deep blue passes WCAG; `overused-font` is a fallback-name sniff. Genuine catches the visual review hadn't quantified: the h1 overflow, `bounce-easing` (a bounce easing violates the flat-by-fold system), and ~93-char line length.

## Overall Impression

The concept wins; the geometry loses. Live inspection confirms the user's misalignment instinct and escalates it: the signature route misses the CTA by 29px, the junction node floats 64px from the DIAGNOSIS plaque, and dark-mode hover makes the primary CTA label literally white-on-white. None of this is a design problem — it's a tolerance problem. For a brand selling engineering precision, the page currently ships console warnings.

## What's Working

1. **The honest empty scorecard** — taxonomy-as-proof is a differentiated persuasion device, flawless in both locales and themes.
2. **Type voice** — Barlow Condensed signage vs open body is a real, ownable wayfinding character; both locales hold at display size.
3. **Indexed decision rail** (01/02) — exemplary Persuade-mode IA: two options, explicit priority, structural.

## Priority Issues

**P0 — Route terminus misses the primary CTA; junction misses the junction** (route SVG endpoint renders at (1424,481); plate right edge x=1395, center y=547; mid node (791,447) vs octagon (855,417)). The page's promised money shot — "resolves at the primary action" — overshoots into the screen edge and dies half-clipped; a stray ring floats below-left of the real DIAGNOSIS octagon; start node is punched in half at the left edge. Fix: compute route endpoints from the plates' real boxes (anchor terminus to plate left-center with a node ON the chamfer), draw the junction node from the octagon's rendered position, and reconcile the three stroke systems (4px blue-soft / 8px near-white / 2px brand) into one family. *Suggested command: /impeccable polish*

**P0 — Dark-mode hover/focus renders the primary CTA label white-on-white; focus ring clipped and invisible** (app.css:541-544 + 520-524, verified computed styles). Hover/focus fills near-white with white text on the page's most important action; the outline is clipped at notched corners and `--brand`-on-navy is near-invisible in light mode. WCAG 2.4.7/1.4.11 failure on the conversion target. Fix: dark hover/focus fills a dark tone with light text; give focus a high-contrast outline that survives clip-path (inset or unclipped wrapper). *Suggested command: /impeccable audit*

**P1 — Mobile topology renumbers the system** (systems-topology.tsx mobile variant: 01, 02, 04, 05; desktop 01–07). Three stations vanish and 04/05 change meaning per breakpoint (04 = Security desktop, Architecture mobile). Same system, two contradictory legends. Fix: keep global station IDs stable; ship a subset, not a re-index. *Suggested command: /impeccable polish*

**P1 — Left-edge anarchy and unregistered grids** (header underline spans x 16–187; brand x=32; text edge x=58; header container x=137; atlas border x=1; panel hairline at 33.3% vs junction at 50%; second SVG gridline grid at different fractions). Five competing left edges and two misaligned hairline grids on the blue panel — the most visible "misalignment" class the user noticed. Fix: one content-left token; align underline and plane paddings to it; align or delete the pseudo-grid. Chamfers: 12.8/16/12px where spec commits 0.8rem everywhere. *Suggested command: /impeccable polish*

**P2 — Consent banner covers 28% of the mobile viewport and reserves only 88px** (240px banner vs 5.5rem reserve). Covers the hero lede on load; spec commits "compact, never covers primary actions." Fix: collapsed single-row mobile bar (text + Accept/Reject; Customize behind) and reserve from measured height. *Suggested command: /impeccable adapt*

**P2 — h1 display measure is fictional** (`max-width: 7ch` vs "ENGINEERING" = 11ch; overflow 87–118px by view). Fix: set a real ch measure (e.g. 12ch) or drop the clamp; also remove the `--animate-bounce` easing (violates the flat system) and tighten ~93-char lines. *Suggested command: /impeccable typeset*

## Persona Red Flags

**Jordan (first-timer):** a line pierces the booking plate and dies at the screen edge — teaches that the precision aesthetic is skin-deep exactly at the conversion moment; duplicated tagline ("Three offers, one method…" twice per scroll) reads as template filler.
**Riley (stress tester):** tabs to the CTA and the label disappears (dark) or the ring is invisible (light); resizes and node 04 changes meaning. Trust in "we map systems correctly" does not survive.
**Casey (mobile):** meets a 240px consent wall covering the lede, then a topology that silently drops 3 of 7 dimensions. No horizontal scroll (verified) — Casey's story is interruption, not breakage.
**Skeptical technical founder:** will actually read the topology — and finds a junction node floating 64px off its plaque, misaligned hairlines, inconsistent chamfers. The empty scorecard wins respect; the geometry loses it. Also: Mobile Product Rescue / React Native (the claimed differentiator) appears nowhere on the homepage.

## Minor Observations

- `SC–00` en dash vs em dashes elsewhere; pt-BR "CONECTAR O CASO STOCKCAST" translates "See the StockCast case" as "Connect" (verb mismatch).
- Services stop titles: 14px baseline drift between 1-line and 2-line columns; method stops aligned.
- Route stubs run 377px past the last node; method line passes behind the Diagnosis plate; footer node dot is orphaned ~1300px from any route.
- Theme switcher ships Light/Dark/System (3 options) vs DESIGN.md's committed two-option control; Dark theme junction plaque goes near-black on blue (low contrast); consent banner stays light-themed on ink page.
- Duplicate `ctaId: "hero-book-call"` on two different buttons; scorecard rows coupled to i18n object order (`Object.values().slice(0,5)`).
- DESIGN.md sidecar (`.impeccable/design.json`) predates the latest DESIGN.md edit.

## Questions to Consider

1. If the route can't yet be computed from the plates' real geometry, should it ship at all — or is a broken signature worse than a withheld one?
2. Does the page need the Light/Dark/System triad exposed, or is "System" the only honest default for a site with no photographs to color-manage?
3. Should the topology hide its decorative off-canvas stubs rather than clipping nodes mid-glyph — withholding as honesty, like the scorecard?
