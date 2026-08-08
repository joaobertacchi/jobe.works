# ADR 013 — Content Architecture

**Status:** Accepted

## Context

The project is a reusable static-site harness for marketing and content websites, with AI coding agents expected to create and evolve pages after the repository is forked.

Possible content approaches included:

- TS/TSX only;
- Markdown;
- MDX;
- structured content files;
- content collections;
- CMS-oriented abstractions;
- hybrid models.

The current use case does not require blog infrastructure, editorial workflows, or non-developer content authoring.

Localization is already handled through strongly typed, page/feature-scoped TypeScript translation dictionaries.

## Decision

Use **TypeScript and TSX only** for the base template's content architecture.

Ordinary page copy must be stored in the existing typed localization dictionaries rather than embedded as untranslated literals in route components.

The base template will not include:

- Markdown;
- MDX;
- content collections;
- blog infrastructure;
- headless CMS integration;
- CMS abstraction layers.

## Page Model

Pages are implemented as React route modules and composed from the project's component architecture.

Conceptually:

```text
route TSX
    ↓
sections / site / domain components
    ↓
UI primitives
```

Page structure remains in TSX.

Localized textual content is retrieved through the project's generic typed translation API.

Example:

```tsx
export default function AboutPage() {
  return (
    <>
      <Heading size="display">
        {translate("about.title")}
      </Heading>

      <Text>
        {translate("about.description")}
      </Text>
    </>
  );
}
```

## Localization

Ordinary page copy belongs in page/feature-scoped TypeScript translation dictionaries.

For example:

```text
app/i18n/locales/
  en/
    about.ts
    services.ts

  pt-BR/
    about.ts
    services.ts
```

Each locale dictionary must satisfy the corresponding strongly typed translation schema.

Valid translation keys are derived from the `Translation` type through the project's recursive `Paths<T>` mechanism.

This provides compile-time validation for:

- missing translations;
- invalid translation scopes;
- inconsistent locale dictionaries.

## New Pages

After a website is forked, instantiated, and deployed, AI coding agents are expected to create new pages directly in TS/TSX.

Agents must follow the existing project conventions for:

- routing;
- localization;
- component architecture;
- design-system reuse;
- SEO;
- static generation;
- validation.

The template does not introduce a secondary authoring format solely for future page creation.

## Rationale

TS/TSX keeps the agent-facing architecture small.

Using additional content technologies such as Markdown or MDX would require agents to understand:

- multiple authoring formats;
- format-specific loaders;
- content schemas;
- additional build behavior;
- boundaries between React components and content files.

There is no current requirement that justifies this additional complexity.

The existing typed i18n architecture already provides an appropriate location for localized marketing copy.

Because AI agents are the expected mechanism for creating and editing pages, developer-friendly structured source code is sufficient for the intended workflow.

## Consequences

### Positive

- Smaller conceptual surface for AI agents.
- No additional content-processing dependencies.
- Strong TypeScript validation.
- Localization remains consistent across all pages.
- Page structure and content usage remain easy to inspect programmatically.
- New page creation follows normal React conventions.
- The template remains smaller and easier to maintain.

### Negative

- Long-form editorial content is less convenient to author than Markdown.
- Nontechnical content editors are not a primary supported workflow.
- Large amounts of prose may make translation dictionaries comparatively verbose.
- Blog/content-heavy websites may eventually need additional infrastructure.

## Deferred Capabilities

The following may be reconsidered when a real use case exists:

- Markdown;
- MDX;
- blog post collections;
- case-study collections driven by content files;
- CMS integration;
- structured editorial workflows.

If one of these becomes a template-level requirement, the content architecture should be revisited through a new ADR rather than added opportunistically.

## Rejected Alternatives

### Markdown

Rejected for the current base template because there is no active long-form content requirement and it would introduce an additional authoring/build concept.

### MDX

Rejected because embedding React components into Markdown adds further tooling and agent-specific knowledge without solving a current requirement.

### Hybrid TSX + Markdown/MDX

Rejected for now because the additional flexibility does not justify the larger conceptual surface.

### CMS Abstraction

Rejected as premature abstraction.

The template should not introduce CMS-oriented interfaces until a concrete website requires them.

## Future Evolution

This decision intentionally optimizes for the current primary workflow rather than attempting to predict every future website type.

If blog or editorial-content requirements become common, the template may evolve to add a content architecture later.

Such a change should preserve the existing principles of:

- static generation;
- localization correctness;
- SEO readiness;
- low AI-agent conceptual overhead.
