# ADR 012 — Tailwind, Theming, and Styling Model

**Status:** Accepted

## Context

The project uses Tailwind CSS as its styling technology.

The template is intended to be easy to fork, easy for AI coding agents to understand, and flexible enough for each fork to evolve its own visual identity and design system.

The project should avoid excessive styling restrictions because stricter rules increase:

- adoption friction;
- custom domain knowledge;
- agent reasoning requirements;
- maintenance burden.

At the same time, the template should demonstrate good design-system practices and support light and dark themes.

## Decision

Use Tailwind CSS as a flexible styling foundation.

The template should guide styling primarily through:

- working example components;
- placeholder/example pages;
- a small semantic color-token layer;
- well-structured primitives;
- conventional Tailwind usage.

Styling conventions should generally be taught through examples rather than aggressively enforced through custom lint rules.

## Token Model

Use Tailwind's standard scales by default for:

- spacing;
- sizing;
- typography;
- layout;
- breakpoints;
- radii;
- shadows;
- other common visual values.

Do not create project-specific semantic aliases for standard Tailwind concepts unless the evolving design system demonstrates a clear need.

For example, prefer:

```text
gap-6
px-8
text-lg
rounded-xl
shadow-sm
```

over introducing unnecessary project-specific equivalents.

## Semantic Tokens

Introduce a small semantic theme layer only for values that represent:

- site identity;
- shared visual meaning;
- theme-sensitive values.

Colors are the primary use case.

Typical semantic concepts may include:

```text
brand
brand-foreground
surface
foreground
muted
border
danger
```

The exact token set belongs to the individual website fork and should emerge from its visual requirements.

Semantic tokens are not intended to become a second full styling language layered over Tailwind.

## CSS Custom Properties

Use CSS custom properties underneath the small semantic token layer where runtime theme switching requires them.

Conceptually:

```css
:root {
  --brand: ...;
  --surface: ...;
  --foreground: ...;
  --muted: ...;
  --border: ...;
}

.dark {
  --brand: ...;
  --surface: ...;
  --foreground: ...;
  --muted: ...;
  --border: ...;
}
```

Tailwind exposes those values through corresponding utilities.

CSS variables are used because they provide meaningful runtime theming capability, not because all design values must be converted into CSS variables.

## Component Semantics

The public design-system API should primarily use semantic component props.

Preferred:

```tsx
<Button variant="primary" size="lg">
  Contact us
</Button>
```

Rather than making callers reconstruct visual styling using Tailwind classes.

Likewise:

```tsx
<Text tone="muted" />
<Alert variant="danger" />
```

should express intent at the component API level.

Semantic Tailwind tokens remain an implementation detail of the primitive layer.

## Visual Styling Ownership

Visual styling belongs primarily to `components/ui`.

Primitives should own visual decisions such as:

- color;
- typography;
- border;
- radius;
- shadow;
- interaction states;
- component spacing;
- focus and hover appearance.

Higher layers primarily compose these primitives.

## Tailwind Outside `components/ui`

Tailwind is not mechanically forbidden outside the primitive layer.

Higher layers may use Tailwind for structural composition and layout.

Examples:

```tsx
<section className="grid gap-12 lg:grid-cols-2">
  ...
</section>
```

```tsx
<div className="flex flex-col gap-8">
  ...
</div>
```

This avoids introducing unnecessary wrappers for every layout decision.

Higher layers should generally avoid inventing an independent visual language with arbitrary:

- colors;
- component typography;
- shadows;
- decorative borders;
- radii;
- visual interaction states.

This is primarily a convention demonstrated through examples rather than a rigidly enforced restriction.

## Arbitrary Tailwind Values

Arbitrary Tailwind values are allowed.

Examples:

```text
w-[37rem]
tracking-[0.015em]
```

However, they should be treated as a last resort.

Agents and developers should prefer:

1. existing design-system primitives;
2. existing semantic theme values;
3. Tailwind's standard scale;
4. arbitrary values only when the design genuinely requires them.

The template will not introduce hard validation banning arbitrary values.

## Light and Dark Themes

Light and dark themes are first-class template capabilities.

The architecture should support at least:

```text
light
dark
system
```

where `system` follows the user's operating-system/browser color preference.

Theme selection is client-side behavior and does not alter the static deployment model.

## Theme Persistence

A user's explicit theme choice should be persisted locally in the browser.

Conceptually:

```text
saved preference
      ↓
light / dark

no preference
      ↓
system preference
```

The exact storage implementation is an implementation detail.

## Initial Theme Application

The template should avoid a visible flash of the incorrect theme during page load.

A small pre-hydration initialization script should determine the effective theme before the initial page paint.

It should:

1. inspect any stored user preference;
2. fall back to `prefers-color-scheme`;
3. apply the corresponding theme class or attribute before normal client hydration.

This infrastructure belongs in the template because every fork supporting light/dark themes would otherwise need to solve the same problem.

## Theme Scope

The base template supports one website theme with light and dark variants.

Multiple unrelated runtime themes or multi-brand theming within one site are outside the initial scope.

Individual forks may add such functionality if required.

## Branding

The template does not prescribe a predefined brand.

Each fork defines its own:

- brand colors;
- light palette;
- dark palette;
- typography choices;
- visual primitives;
- logos and imagery;
- component variants.

Branding should flow through the design-system primitive layer rather than being duplicated throughout pages.

## Placeholder and Example Pages

The template should include placeholder/example pages and components demonstrating the intended architecture.

These examples serve as local training material for:

- developers;
- AI coding agents;
- smaller LLMs with limited project context.

Examples should demonstrate:

- file-convention routing;
- localization;
- use of typed translations;
- primitive composition;
- variant props;
- domain components;
- sections;
- Tailwind layout usage;
- light/dark theme behavior;
- semantic token use;
- responsive design.

The examples are intended to communicate conventions through working code rather than extensive prose.

## Example-First Guidance

For styling and component usage, the template favors:

```text
good local examples
+
normal ecosystem conventions
+
review
```

over:

```text
large custom lint rule set
+
template-specific DSLs
+
strict styling restrictions
```

This decision is intended to improve both human adoption and smaller-LLM success rates.

## Class Overrides

The template does not prohibit `className` overrides on components by architectural policy.

Component APIs should still prefer semantic variants and composition where practical.

Individual forks may adopt stricter rules if their design system requires them.

## Variant Implementation

Components should expose semantic variant props where they provide meaningful reuse.

Example:

```tsx
<Button variant="primary" size="lg" />
```

The base architecture does not require a specific variant utility library.

Possible implementations may use:

- plain class maps;
- a lightweight helper;
- a variant library if justified by the fork.

Adding another dependency solely to satisfy template architecture is not required.

## Responsive Design

Use Tailwind's conventional mobile-first responsive model.

Prefer the framework's standard breakpoint system.

Custom or arbitrary breakpoints may be introduced when a site's actual design requires them, but are not a default architectural requirement.

## Typography

Typography should primarily be represented through design-system primitives such as:

```text
Heading
Text
```

These primitives may internally use standard Tailwind typography utilities.

The template does not require a custom semantic typography-token layer.

A typography plugin for long-form prose may be adopted by a fork if its content requirements justify it.

## Styling Validation Philosophy

The template should not aggressively enforce styling conventions with custom static analysis.

Mechanical validation should be reserved for rules whose violation creates clear correctness or architectural problems.

Styling consistency is primarily encouraged through:

- primitives;
- semantic props;
- examples;
- code review;
- downstream development skills or workflows.

Individual forks remain free to introduce stricter linting if desired.

## Rationale

The goal is to provide enough structure for a coherent design system to emerge without turning the template into a proprietary styling framework.

Tailwind already has:

- broad adoption;
- strong LLM training-data coverage;
- concise syntax;
- mature responsive conventions;
- a familiar mental model.

Re-abstracting large portions of Tailwind would reduce these benefits.

At the same time, semantic theme-sensitive colors and primitive component APIs provide useful consistency where raw Tailwind values would otherwise encourage visual drift.

Example-driven guidance also gives AI agents a strong local reference without increasing the number of mandatory template-specific rules.

## Consequences

### Positive

- Low styling-related adoption friction.
- Strong compatibility with existing Tailwind knowledge.
- Smaller conceptual surface for AI agents.
- Light/dark themes work consistently.
- Runtime theme switching does not affect static deployment.
- Design systems remain fork-specific.
- Standard Tailwind knowledge remains useful.
- Examples provide strong local guidance.
- The template avoids excessive custom lint infrastructure.

### Negative

- Styling consistency is not fully mechanically enforced.
- Agents can still introduce one-off visual decisions.
- Individual forks may need periodic refactoring as their design system matures.
- `className` flexibility allows consumers to bypass semantic component APIs.
- Theme and token quality depends partly on development discipline.

## Rejected Alternatives

### Raw Tailwind Values Only

Rejected as the only model because shared semantic colors and runtime light/dark theming benefit from a centralized semantic layer.

### Fully Tokenized Design System

Rejected because converting spacing, typography, sizing, layout, radii, and other standard Tailwind concepts into project-specific semantic aliases would create unnecessary custom vocabulary.

### CSS Variables for Every Design Value

Rejected because runtime indirection provides little benefit for many static values and adds conceptual overhead.

### Strict Tailwind Enforcement Outside `ui`

Rejected because it would make normal page composition unnecessarily difficult.

### Ban Arbitrary Values

Rejected because some designs legitimately require values outside the default Tailwind scale.

### Mandatory Variant Library

Rejected because the design can be implemented with ordinary TypeScript/Tailwind until a site's complexity justifies another dependency.

### Multiple Runtime Themes / Multi-Brand Support

Out of scope for the base template.

The initial architecture supports light, dark, and system preference for a single website identity.
