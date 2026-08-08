# ADR 011 — Component and Design-System Architecture

**Status:** Accepted

## Context

The template repository is intended to bootstrap many independent static marketing/content websites.

The template itself does not ship with a finished design system. Instead, each fork creates its own design system while the website is being developed.

The architecture must therefore:

- provide a clear structure for components;
- encourage reuse;
- allow a design system to emerge naturally;
- remain simple enough for smaller AI coding agents;
- avoid unnecessary custom abstractions;
- preserve flexibility for site-specific design.

Tailwind CSS is the selected styling technology.

## Decision

Use a layer-oriented component architecture with four component categories:

```text
app/
  components/
    ui/
    domain/
    sections/
    site/
```

The design system is created progressively inside each fork rather than inherited as a predefined visual library.

## Component Layers

### `components/ui/`

Contains reusable design-system primitives and foundational visual components.

Examples may include:

- `Button`;
- `Link`;
- `Heading`;
- `Text`;
- `Image`;
- `Input`;
- `Textarea`;
- `Select`;
- `Card`;
- `Container`;
- `Stack`;
- `Grid`;
- `Badge`;
- `Icon`.

The exact primitive set is created as the site evolves.

The `ui` layer owns the site's visual language.

### `components/domain/`

Contains reusable components representing domain or content concepts.

Examples:

- `ServiceCard`;
- `TeamMember`;
- `CaseStudyPreview`;
- `Testimonial`;
- `ProductFeature`.

These components should compose `ui` primitives rather than introduce an independent visual language.

### `components/sections/`

Contains reusable page-level sections.

Examples:

- hero sections;
- feature sections;
- pricing sections;
- testimonial sections;
- FAQ sections;
- CTA sections.

Sections compose primitives and domain components.

### `components/site/`

Contains structural or composed components specific to the website.

Examples:

- site header;
- footer;
- primary navigation;
- locale switcher;
- site-specific shell or layout elements.

These components may not be reusable across unrelated websites, and that is acceptable.

## Directory Organization

The component architecture is organized by architectural layer rather than by feature.

The intended structure is:

```text
components/
  ui/
  domain/
  sections/
  site/
```

This makes component role and reuse expectations explicit.

The template does not introduce a more granular hierarchy such as:

```text
primitives/
composites/
patterns/
organisms/
```

because additional taxonomy would increase conceptual overhead for agents without clear benefit.

## Route Composition

Route modules may contain simple JSX directly.

Components should be extracted when justified by:

- reuse;
- visual complexity;
- interaction;
- meaningful page-section semantics;
- readability;
- maintainability.

The template does not attempt to encode a rigid extraction threshold.

Codebase restructuring and architecture improvement may be performed through:

- developer workflow;
- external AI skills;
- refactoring tools;
- project-specific practices.

The base harness should not become a custom refactoring framework.

## Design System as Development Output

The template does not provide a finished design system.

Instead, a typical fork evolves approximately as:

```text
website requirements
        ↓
design decisions
        ↓
ui primitives
        ↓
domain components
        ↓
sections
        ↓
site composition
```

As new pages are implemented, reusable design decisions should be captured in the `ui` layer rather than repeatedly implemented as one-off styles.

The design system is therefore an explicit output of website development.

## Visual Styling Ownership

Visual styling and design decisions belong primarily to the `ui` primitive layer.

Higher layers should consume semantic component APIs rather than reproduce low-level visual styling.

Preferred:

```tsx
<Button variant="primary" size="lg">
  Contact us
</Button>
```

Rather than:

```tsx
<button className="bg-blue-600 px-6 py-3 text-white">
  Contact us
</button>
```

Higher-level components should generally express intent through component props and composition.

## Tailwind Usage

Tailwind CSS is the styling implementation technology.

Tailwind classes that define the visual language should primarily live inside `components/ui`.

Examples include:

- colors;
- typography;
- borders;
- shadows;
- radii;
- visual states;
- component spacing;
- hover/focus appearance.

Higher layers may use Tailwind utilities for structural layout and composition when introducing a dedicated layout primitive would create unnecessary abstraction.

Examples of acceptable higher-layer usage include:

```tsx
<section className="grid gap-12 lg:grid-cols-2">
  ...
</section>
```

or:

```tsx
<div className="flex flex-col gap-8">
  ...
</div>
```

Higher layers should avoid defining independent visual language such as arbitrary colors, shadows, radii, typography, or component-state styling.

## Design Tokens

Tailwind theme values may be used as the underlying design-token mechanism.

Semantic Tailwind utilities may be introduced when useful, but they are considered implementation details of the primitive/design-system layer.

For example, primitives may internally use concepts such as:

```text
bg-brand
text-foreground
bg-surface
text-muted
```

However, these semantic utility names are not intended to be the primary public API used by page authors.

The preferred public API is semantic React props such as:

```tsx
<Button variant="primary" />
<Text tone="muted" />
<Alert variant="danger" />
```

This keeps consumers coupled to component semantics rather than to styling implementation.

## Primitive Scope

Use a relatively broad primitive set where primitives provide meaningful consistency.

Elements that commonly carry design-system behavior should generally be represented by project primitives.

Examples include:

- buttons;
- links;
- headings;
- body text;
- images;
- form controls;
- cards;
- common layout containers.

The exact set should emerge from real site requirements rather than being exhaustively predefined in the template.

## Raw HTML Policy

Raw HTML is selectively restricted.

HTML elements that belong to the site's design-system primitive layer should normally be used through those primitives outside `components/ui`.

Examples:

```text
button   → Button
input    → Input
textarea → Textarea
img      → Image
a        → Link
h1-h6    → Heading
p        → Text
```

Semantic structural elements may remain directly usable.

Examples include:

- `main`;
- `section`;
- `article`;
- `nav`;
- `header`;
- `footer`.

The goal is not to wrap HTML unnecessarily, but to centralize visual and behavioral consistency where it provides value.

## Variants

Components should use semantic variant props for controlled visual variation.

Example:

```tsx
<Button variant="primary" size="lg" />
<Button variant="secondary" size="sm" />
```

Prefer explicit, meaningful variants over allowing callers to reconstruct component styling with arbitrary utility classes.

Variant APIs should remain small and meaningful.

Avoid highly configurable components with large combinatorial prop surfaces.

## Composition

Composition is preferred for larger component structures.

Example:

```tsx
<Card>
  <CardHeader>
    ...
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

This is preferred over large configuration objects or components with many unrelated presentation props.

Composition should be used where it improves flexibility without making the component API harder to understand.

## Reuse Policy

Reuse follows a tiered model.

### UI primitives

Existing primitives should be reused.

Creating multiple competing primitives for the same foundational behavior should be avoided.

### Domain components

Reuse when the domain concept is equivalent.

Do not force reuse when the underlying semantics differ substantially.

### Sections

Reuse sections when their structure and intent are meaningfully compatible.

Do not distort an existing section simply to avoid creating a new one.

### Site-specific components

Site-specific components may be created freely when they represent unique website structure or composition.

The architecture favors useful reuse rather than reuse as an end in itself.

## Refactoring and Promotion

Components may naturally move between layers as the website evolves.

For example:

```text
site-specific component
        ↓ repeated use
domain component
```

or:

```text
one-off visual pattern
        ↓ generalized behavior
ui primitive
```

The template does not enforce automatic promotion rules.

Refactoring decisions remain part of normal development and review workflows.

## AI-Agent Considerations

This architecture is designed to give agents a small number of clear classification choices.

When creating a component, the agent should ask:

```text
Is it a foundational visual/design primitive?
→ ui

Does it represent a reusable domain/content concept?
→ domain

Is it a reusable page-level section?
→ sections

Is it specific to this website's structure/composition?
→ site
```

The architecture intentionally avoids deeper design-system taxonomies that would require agents to distinguish between ambiguous categories such as atoms, molecules, organisms, composites, and patterns.

## Validation Opportunities

Where practical, the project may mechanically enforce rules such as:

- raw `button` usage outside `ui` is forbidden once a `Button` primitive exists;
- raw form controls outside `ui` are restricted;
- arbitrary visual Tailwind utilities outside `ui` may be restricted;
- design-system primitives should be imported rather than reimplemented;
- invalid architectural imports may be linted.

Such rules should be introduced only where they remain reliable and do not create excessive false positives.

The template should prefer useful deterministic guardrails over overly broad restrictions.

## Rationale

The selected architecture balances:

- design-system consistency;
- low agent conceptual overhead;
- website-specific flexibility;
- Tailwind productivity;
- component reuse;
- progressive design-system emergence.

A predefined design system would unnecessarily constrain the visual identity of independent forks.

A flat component directory would provide too little architectural guidance.

A highly granular design-system taxonomy would increase agent reasoning requirements without improving the primary website-development workflow.

The four-layer model provides enough structure to guide reuse while remaining easy to understand.

## Consequences

### Positive

- Clear component ownership.
- Strong foundation for an emergent design system.
- Small conceptual surface for AI agents.
- Visual design becomes centralized over time.
- Higher layers consume semantic APIs rather than low-level style decisions.
- Tailwind remains available for efficient implementation.
- Site-specific composition remains flexible.
- Domain components have an explicit home.
- Route files do not need to become artificially component-only.

### Negative

- The quality and completeness of the design system depend on development discipline.
- Some visual-styling boundaries require judgment.
- Higher-layer Tailwind layout usage creates a deliberate exception to strict primitive-only styling.
- Component categorization can still occasionally be subjective.
- Refactoring and promotion between layers are not automatically enforced.
- Individual forks may evolve different interpretations of the same architecture.

## Rejected Alternatives

### Flat `components/` Directory

Rejected because it does not communicate component role or reuse expectations clearly enough.

### Feature-Oriented Component Organization

Rejected as the default because layer-oriented organization better matches the design-system and marketing-site use case.

### Highly Granular Design-System Taxonomy

Rejected because additional categories increase agent-specific domain knowledge and classification ambiguity.

### Routes May Only Compose Extracted Sections

Rejected because it creates unnecessary files for trivial page structure.

### Visual Styling Allowed Freely at Every Layer

Rejected because it makes it difficult for a coherent design system to emerge.

### All Tailwind Restricted to `ui`

Rejected as unnecessarily rigid.

Structural layout utilities may be used in higher layers when creating a dedicated layout primitive would not provide meaningful abstraction.

### Raw Tailwind Utilities as the Public Design-System API

Rejected in favor of semantic React component props and composition.

### Prebuilt Design System in the Template

Rejected because each fork should develop a design system appropriate to its own brand and visual requirements.
