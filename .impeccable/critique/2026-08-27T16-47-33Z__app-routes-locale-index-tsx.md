---
target: current homepage
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-27T16-47-33Z
slug: app-routes-locale-index-tsx
---
Method: dual-agent (A: critique_design_a · B: critique_evidence_b)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Navigation and theme state are legible, but the homepage lacks an active Home state and consent dominates the initial page state. |
| 2 | Match System / Real World | 3 | “Call → Diagnosis → Directed engagement” matches the buying journey; names such as “AI-Native SDLC & Engineering Enablement” still demand insider knowledge. |
| 3 | User Control and Freedom | 3 | Consent provides accept, reject, and customize controls, but the fixed panel cannot be deferred or minimized. |
| 4 | Consistency and Standards | 3 | The component language is cohesive, but the plain language link and boxed three-option theme switcher form an uneven utility cluster. |
| 5 | Error Prevention | 2 | The fixed consent panel covers the hero/services transition and obscures actions, increasing missed-action risk. |
| 6 | Recognition Rather Than Recall | 4 | Descriptive navigation, visible CTAs, and numbered method steps keep memory demands low. |
| 7 | Flexibility and Efficiency | n/a | No meaningful repeat-user workflow exists on this Persuade surface. |
| 8 | Aesthetic and Minimalist Design | 3 | The page itself is restrained; the tall consent panel and dense mobile header break the first-view simplicity. |
| 9 | Error Recovery | 4 | The homepage has no error-prone transactional workflow and its navigation actions are readily reversible. |
| 10 | Help and Documentation | n/a | Not applicable to the homepage’s persuasion task. |
| **Total** |  | **25/32** | **Good foundation; important persuasion gaps** |

## Design Specificity Verdict

**LLM assessment:** Polished and coherent, but only moderately specific to JOBE. The restraint, typography, blue accent, and method sequence convincingly signal a serious engineering consultancy. Most of the composition could still serve another competent AI consultancy unchanged. The strongest proprietary material—the diagnostic method and StockCast proof—gets less visual authorship than the generic three-card service layer. The intended signature is also weakened: the wireframe cube is quieter than the approved dimensional focal motif and disappears entirely below `lg`.

**Deterministic scan:** The automated detector returned **0 findings** for `app/routes/$locale._index.tsx` (exit 0). This confirms that the route avoids the skill’s recognizable implementation anti-patterns; it does not contradict the design review because the major problems are information order, proof density, mobile focus, and consent obstruction rather than detector-rule violations. No false positives were present.

**Visual overlays:** No reliable user-visible overlay is available. Browser discovery returned no browser backend, mutable injection could not be tested, and the intended preview URL returned HTTP 000. The visual fallback was the repository’s existing 1440px and 390px homepage captures in `.impeccable/shots/`, checked against the approved composition and source.

## Overall Impression

The homepage looks disciplined, senior, and trustworthy. Its biggest opportunity is to make JOBE’s diagnostic-first model and evidence feel more distinctive than its service taxonomy. Right now the page says “conversation, not a catalog,” then immediately presents a catalog.

## What’s Working

- **The core visual register is credible.** Tight typography, generous white space, quiet borders, and one blue accent avoid AI-consultancy hype and support the senior, pragmatic positioning.
- **The method sequence is the clearest persuasive section.** “Product Readiness Call → Diagnosis → Directed engagement” turns an abstract consultancy relationship into a legible process.
- **Action hierarchy is generally sound.** The primary booking CTA and secondary StockCast path are visually distinct, repeated consistently, localized, and built with accessible link semantics.

## Cognitive Load and Emotional Journey

The page has moderate cognitive load. It passes chunking, grouping, basic hierarchy, working-memory continuity, and recognizable controls. It struggles with single focus, minimal choices, and progressive disclosure in the first viewport.

- The mobile header exposes roughly eight choices before content: brand/home, three navigation routes, language, and three theme modes.
- With consent visible, the first viewport grows to roughly fifteen actions when hero links and privacy controls are included.
- Offer terminology arrives before concrete evidence: Productization, Fractional CTO, AI-Native SDLC, Engineering Enablement, and Directed engagement.
- The Diagnosis cell compresses architecture, integrations, security, observability, cloud/AI costs, risk, and roadmap into one paragraph.
- The visitor must infer proof from the StockCast title and generic description; the page supplies no visible problem, intervention, artifact, or result.

The emotional journey starts with calm competence, drops sharply when the consent panel becomes the loudest object, becomes ambiguous at the service catalog, recovers through the structured method, and ends with a clear CTA that still lacks immediate reassurance about preparation and outcome.

## Priority Issues

### [P1] Consent obscures the conversion narrative

**Why it matters:** The fixed consent block covers the secondary hero action/services transition on mobile and the services heading on desktop. It becomes the dominant first-view object and makes a polished page feel obstructed.

**Fix:** Replace the tall panel with a compact bottom bar or compact first layer, keep accept and reject equally legible, move detailed preference copy into Customize, and ensure it never covers an actionable page region. Provide a clear defer/minimize path if policy permits.

**Suggested command:** `$impeccable polish`

### [P1] StockCast is named as proof but not shown as proof

**Why it matters:** A skeptical founder or CTO reaches the credibility moment and gets a title, a generic sentence, and another navigation step. That cannot support the surface brief’s promise that StockCast earns belief.

**Fix:** Preview three honest facts: initial condition, JOBE intervention, and observable result. If metrics are unavailable, use qualitative evidence already supportable by source material—a risk category, architecture artifact, decision excerpt, or before/after operating condition—without inventing claims.

**Suggested command:** `$impeccable shape`

### [P2] The section order contradicts “not a catalog”

**Why it matters:** Placing three offer cards directly after that promise asks visitors to self-classify between Sprint, Fractional CTO, and Enablement. This weakens the diagnostic-first differentiator and creates uncertainty for mixed problems.

**Fix:** Move “How it works” ahead of services, or explicitly frame the cards as outcomes that diagnosis may direct. Lead card copy with recognizable situations rather than offer names.

**Suggested command:** `$impeccable clarify`

### [P2] The signature disappears on mobile

**Why it matters:** `HeroSection` hides the isometric motif below `lg`, removing the approved memorable moment from an entire device class. The mobile hero becomes a competent document header rather than a branded experience.

**Fix:** Keep a simplified, cropped, or softly positioned version of the geometry near the headline on small screens; preserve readability and performance while retaining the signature.

**Suggested command:** `$impeccable adapt`

### [P2] Header utilities overpower mobile navigation

**Why it matters:** The three theme buttons plus language and primary navigation create a dense two-row control panel before the visitor sees the promise. The utility layer receives more interaction weight than the brand.

**Fix:** Collapse theme choice into one compact control/menu, shorten the locale label, and use a conventional mobile navigation disclosure so JOBE and the primary route retain hierarchy.

**Suggested command:** `$impeccable adapt`

## Persona Red Flags

**Founder with an AI product under production pressure:** The headline matches the problem, but StockCast provides no concrete comparable evidence before the booking ask. The founder must leave the page or take the claim on faith.

**CTO seeking architecture direction:** The three service cards appear immediately after “not a catalog,” encouraging a choice between Sprint and Fractional CTO even when the visitor’s problem spans both. The dense Diagnosis paragraph also makes the process look broad rather than decisively prioritized.

**Referral arriving for StockCast:** On mobile, the consent panel pushes or obscures the secondary case path, and the later case band still offers no meaningful preview. The referral takes two navigation steps before receiving proof.

## Minor Observations

- The wireframe grid-and-cube motif is less memorable than the approved composition’s stronger blue focal geometry.
- Service cards look substantial but are static; either give them a clear exploratory affordance or make them read less like selectable products.
- The footer email is plain text rather than a direct contact link.
- The case-band primary button competes visually with the actual conversion CTA.
- The homepage has no active Home indication in the primary navigation.

## Questions to Consider

- If JOBE’s differentiation is diagnosis, why is the first substantial section a catalog of offers?
- What can a skeptical CTO learn about StockCast in ten seconds that cannot be inferred from “engineering consultancy”?
- Is exposing three theme choices worth more than preserving a focused mobile first impression?
- If the isometric motif is the memorable moment, can the system claim to work while removing it on every sub-`lg` screen?
