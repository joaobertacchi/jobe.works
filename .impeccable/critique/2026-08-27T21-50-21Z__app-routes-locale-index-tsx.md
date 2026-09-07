---
target: homepage post-fix
total_score: 20
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 1
timestamp: 2026-08-27T21-50-21Z
slug: app-routes-locale-index-tsx
---
# Critique — Homepage (Folded Atlas, post-fix pass)

Method: dual-agent (A: ses_fbad92678ffeJHXmfmh0wJRamO · B: ses_fbad918d5ffeHaIldQykStBD9q)
Target: `app/routes/$locale._index.tsx` · Mode: Persuade · Live inspection of the production build at 1440×900 (en, pt-BR, dark) + 390×844, keyboard walk, hover/focus states, detector overlay on 3 views.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Theme aria-pressed, route draw-on, honest pending; no feedback on CTA navigation |
| 2 | Match System / Real World | 4 | Topology, scorecard, station indexing speak fluent engineer |
| 3 | User Control and Freedom | 3 | Reversible controls; banner requires a choice |
| 4 | Consistency and Standards | 3 | Internally near-flawless; chrome/content edge misregistration breaks own spec |
| 5 | Error Prevention | n/a | Persuade homepage — no input paths |
| 6 | Recognition Rather Than Recall | 4 | Persistent header, CTA repeated 3×, route metaphor carries context |
| 7 | Flexibility and Efficiency | n/a | One-page funnel |
| 8 | Aesthetic and Minimalist Design | 3 | Ruthless palette discipline; first viewport near upper bound |
| 9 | Error Recovery | n/a | No error states on homepage |
| 10 | Help and Documentation | n/a | Nothing to document |
| **Total** | | **20/24** | **Good (83%)** |

## Design Specificity Verdict

**LLM assessment:** Authored, not category-interchangeable. The topology stations are JOBE's actual diagnostic domains, the SC-00 honest-empty scorecard, the named founder annotation, and the "evaluate, diagnose, direct" method line could not be pasted onto a different consultancy without lying. Weak spot: the founder note and "How it works" copy are safe; specificity is carried by structure more than voice.

**Deterministic scan:** CLI clean (0 findings, 7 files). Browser overlay: 8–10 findings per view, dominated by committed-pattern false positives (all-caps signage, index-above-heading, palette tint on deep blue, Roboto fallback sniff, advisory em-dash count). Real catches: mobile h1 overflow (~26–38px, font-timing sensitive; confirmed visually at 6px from the viewport edge) and ~93-char consent-banner copy measure on mobile. Three text-occlusion findings are the detector flagging its own overlay labels — dismissed.

## Overall Impression

The fix pass worked. The signature moment is now geometrically exact (route-through-junction Δ0.2px, terminus-to-plate Δ0.7px, junction centered on panel Δ0.5px, single 12.8px chamfer token), the dark theme no longer sabotages its own CTA, and the page's persuasion structure — peak, honest valley, reassured close — is engineered, not accidental. What remains is the last mile: keyboard entry (no skip link, CTA is the 10th stop), the mobile top screen (consent wall over the lede, near-edgeless h1, four competing left edges), and one weak hover affordance in dark.

## What's Working

1. **Measured, not decorative, signature** — the route resolving into the plate is exact, and it does the convincing: complexity → one directed decision.
2. **The Empty Evidence Rule in practice** — SC-00 admits "pending real case material"; a trust asset no template would ship.
3. **Craft discipline** — stop titles baseline-aligned to 0.1px across columns; one blue across both themes; signage-vs-body voice.

## Priority Issues

1. **[P1] No skip link; the CTA is the 10th keyboard stop.** Keyboard/AT users traverse 9 header controls before the page's primary action. Fix: visually-hidden skip-to-content link as focus stop #1. → `/impeccable audit`
2. **[P2] Registration breaks its own spec.** Desktop chrome edge x=32 vs content edge x=58 (DESIGN.md promises a shared content edge); mobile has four left edges (16/20/29/56) and two parallel vertical rails where the brief commits to one. Fix: one `--atlas-edge` token consumed by header padding, section padding, and rail gutter — or refine the spec line. → `/impeccable layout`
3. **[P2] Mobile consent banner (241px, 29% of viewport) covers the hero lede on load.** CTA survives (spec ✓) but the value proposition is obscured until interaction. Fix: compact mobile variant (collapsed text + Customize disclosure, ≤140px). → `/impeccable adapt`
4. **[P2] Dark-theme primary hover is a weak affordance** — blue → darker paper is a chroma-only shift, easily missed; light theme gets a true inversion, dark doesn't. Fix: dark hover/focus fills near-white ink with dark paper text. → `/impeccable polish`
5. **[P3] Mobile h1 has no right gutter** — "ENGINEERING" ends 6px from the viewport edge. Fix: cap mobile display size or add a measure that fits the longest word. → `/impeccable typeset`

## Persona Red Flags

**Jordan (first-timer):** "Productization Sprint," "AI-Native SDLC," "Observability" assume fluency; the route metaphor and "not a catalog" lede rescue comprehension, but what a Readiness Call *is* lives three sections down.
**Riley (stress tester):** 9-stop keyboard gauntlet before content; banner forces a choice; everything else survives navigation and toggling.
**Casey (mobile):** CTA visible on load ✓, no horizontal scroll ✓; banner over the lede, near-edgeless h1, and four left edges make the top screen feel unfinished next to desktop precision.
**Skeptical technical founder:** the empty scorecard earns respect — but it's the *only* proof artifact, and the founder note is a slogan, not João's voice. A skeptic has nothing to verify except the email link.

## Minor Observations

- Footer terminal node reads as orphaned; a short stub route from the method CTA would land the metaphor.
- Consent emphasis: filled "Accept all" vs outlined "Reject" — a nudge compliance teams may question.
- "SDLC Nativo em IA & Enablement de Engenharia" is clunky pt-BR.
- The Diagnosis paragraph enumerates 7 evidence domains in one sentence — the densest load on the page.
- Overlay artifacts from this scan were written to the temp dir, not the repo.

## Questions to Consider

- Does the topology earn all 7 station labels in 2 seconds, or would progressive reveal on scroll sharpen the first impression?
- Should "JOÃO BERTACCHI / Evaluate first. Direct the right engagement second." carry an actual sentence from the founder? The page's most human slot has its least human copy.
- If evidence is genuinely pending, is a diagnosis-in-progress teaser stronger than an empty table that visually promises data it can't deliver?
