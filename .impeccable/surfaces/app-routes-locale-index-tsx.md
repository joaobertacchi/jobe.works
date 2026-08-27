---
version: 1
slug: "app-routes-locale-index-tsx"
primary_target: "app/routes/$locale._index.tsx"
related_targets: ["app/routes/$locale.tsx"]
---

# Home — jobe.works

## Scope and visitor mode

- Localized homepage (`app/routes/$locale._index.tsx`) in Persuade mode. The visitor decides whether JOBE has the senior judgment to understand a complex product and whether to book a Product Readiness Call.
- Preserve the current section inventory and routes: hero, services, StockCast case band, how-it-works funnel, shared header/footer, consent, en and pt-BR.

## Audience, job, action, and proof

- Founders and technical leaders with an AI product under production pressure or a team needing senior architecture direction.
- The first viewport must establish founder-led senior technical judgment, show diagnosis as JOBE's mechanism, and keep the Product Readiness Call action obvious.
- Proof is carried by architecture diagrams, diagnostic-scorecard grammar, a concise João Bertacchi annotation, the StockCast path, and the call → diagnosis → directed engagement method. No invented scores, metrics, credentials, customers, or outcomes.

## Chosen direction and memorable moment

- Visual world: **Systems Wayfinding** — João turns a complex system into one legible route from symptoms to a directed engineering decision.
- Approved composition: **Folded Atlas**, approved 2026-08-27. Comp: `.impeccable/mocks/home-systems-folded-atlas.webp`.
- First viewport: three unequal planes — light proposition plane, dominant deep-blue topology plane, narrow decision rail — crossed by one continuous route through a central Diagnosis junction.
- Memorable moment: the route physically crosses all three folds and resolves at the Product Readiness Call; on mobile the same signature becomes a vertical route rail, never disappears.

## Component and material grammar

- Color strategy: committed deep engineering blue covering 35–45% of the first viewport; near-white, ink, and pale route blue only. Light and dark themes share the same topology; no gradients or second accent.
- Type: authoritative compressed signage-derived grotesk for display and indexed labels; readable workhorse sans for prose. No monospace costume. Final font must be locally shipped and license-compatible.
- Geometry: hard-edged technical plates, clipped corners, fold seams, 1–2px topology routes, circular nodes, indexed legend marks. Almost no rounded containers; no shadows except physical fold separation if needed.
- Interaction: one authored route-resolution sequence; hover/focus connects a service or method step to its path; reduced motion shows the final complete topology.

## Approved-comp implementation inventory

| Ingredient | Commitment | Medium |
|---|---|---|
| Header | JOBE on proposition plane; compact service/case/contact routes; language and one compact theme control | Semantic HTML/CSS |
| Display headline | Very tall condensed silhouette; occupies most of the left plane; en/pt-BR remains legible without shrinking into body scale | Local webfont + semantic `h1` |
| Folded atlas shell | Three unequal planes at desktop, visible seams, clipped outside edges; stacked vertical route on mobile | CSS grid, pseudo-elements, clip-path |
| Architecture topology | Approximately 18–24 paths/nodes over most of the blue plane; central diagnosis junction; not decorative fake data | Authored responsive SVG with accessible summary |
| Continuous route | 2–4px path crossing proposition, topology, and decision rail, then continuing through later sections | SVG/CSS; motion-path or stroke reveal only where safe |
| João annotation | Compact factual label `JOÃO BERTACCHI` plus approved/placeholder founder note; attached to route without invented title | Semantic aside + CSS plate |
| Primary action | Large indexed route plate in decision rail; clipped corners and arrow are structural, not a generic button | Semantic link + CSS/SVG arrow |
| Secondary StockCast action | Quieter indexed route plate under the primary action | Semantic link + CSS |
| Theme/language utilities | Compact labeled controls at the end of the decision rail; mobile-safe | Existing behavior, redesigned semantic controls |
| Services section | Three destinations on one connected route, never floating cards | Semantic list + authored SVG/CSS route |
| StockCast band | Evidence checkpoint with one honest placeholder artifact until real case material exists | Semantic section + SVG scorecard/plate placeholder |
| How-it-works | Three connected stations; Diagnosis receives strongest structural emphasis | Semantic ordered list + SVG/CSS route |
| Footer | Quiet terminal node with actionable email and subordinate utilities | Semantic HTML/CSS |
| Consent | Compact first layer that never covers primary actions; detailed preferences remain in Customize | Existing consent behavior, redesigned CSS/markup as needed |

## Responsive and state commitments

- Desktop preserves the 38/44/18 visual hierarchy implied by the comp, adjusted only as needed for real copy.
- Tablet reduces topology density and stacks the decision rail without losing the route junction.
- Mobile becomes one vertical route rail with proposition, topology, primary action, services, case, and method attached in sequence.
- Support light, dark, and system preferences; keyboard focus; reduced motion; Portuguese expansion; consent open/closed; long service titles; missing real case artifact.

## Constraints and anti-goals

- Static prerendered React Router site; no backend or runtime server. Typed localization, localized SEO, analytics boundary, consent behavior, and accessible semantics remain intact.
- Do not fabricate a logo, biography, title, metrics, scores, case outcomes, testimonials, or credentials.
- Reject generic split heroes, wireframe cubes, floating service cards, bento grids, dashboard chrome, gradients, glow, glass, neon hacker styling, and decorative circuitry.

## Unresolved decisions

- Real founder-note sentence and final StockCast architecture/scorecard material must be supplied later; ship honest placeholder treatment meanwhile.
- Final display typeface is resolved during implementation from locally shippable, license-compatible candidates, judged against the approved comp's condensed silhouette.
- Contact-form and analytics providers remain outside this homepage visual redesign.
