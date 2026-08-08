# ADR 018 — Configuration and Constants

**Status:** Accepted

## Context

The project needs a simple convention for values that are reused across the website but are not:

- localized page copy;
- secrets;
- provider-specific deployment configuration;
- runtime application state.

Examples may include:

- company name;
- contact details;
- social URLs;
- legal document URLs;
- reusable identifiers;
- other site-wide static values.

A more elaborate configuration architecture was considered, including:

- a central `site.config.ts`;
- multiple typed configuration domains;
- configuration schemas;
- runtime validation;
- environment-specific configuration overlays.

For the current static-site use case, this would introduce unnecessary structure and concepts.

The project favors simple conventions that are easy for both developers and AI coding agents to understand.

## Decision

Do not introduce a dedicated configuration framework or configuration abstraction.

Use ordinary TypeScript constants for reusable, non-localized, non-secret static values.

The default location is:

```text
app/constants/index.ts
```

For example:

```ts
export const COMPANY_NAME = 'Example Company';

export const CONTACT_EMAIL = 'contact@example.com';

export const LINKEDIN_URL =
  'https://www.linkedin.com/company/example';
```

## Splitting Constants

Start with a single constants module.

If it becomes too large or starts mixing unrelated concerns, split it by context.

For example:

```text
app/constants/
  index.ts
  contacts.ts
  social.ts
  legal.ts
```

The split should follow actual growth in the fork rather than being created preemptively.

## Localized Values

Localized values do not belong in `app/constants`.

They belong in the localization architecture defined by ADR 014.

For example:

```text
company phone number → constant

"Talk to our team" → translation dictionary
```

If a value changes depending on locale because it is textual content presented to the user, it should normally be handled through i18n.

## Environment Variables

Environment variables are used for values that are deployment-specific or provider-specific.

Examples may include:

```text
VITE_GA4_MEASUREMENT_ID
VITE_POSTHOG_KEY
VITE_HUBSPOT_PORTAL_ID
```

Environment variables should not be used merely as a replacement for ordinary source-controlled constants.

A stable value that belongs to the website itself should generally remain in TypeScript source.

## Public Environment Configuration

Because production output is a static browser application, values embedded into the frontend build must be treated as public.

Environment variables exposed to client code are configuration, not secrets.

## Secrets

Secrets must never be placed in:

```text
app/constants
```

or in environment variables that are compiled into the static client bundle.

Examples include:

- private API keys;
- client secrets;
- signing secrets;
- privileged credentials;
- private access tokens.

If an integration requires a secret, the backend/serverless exception policy applies.

## No Runtime Configuration Layer

The base template does not include:

- runtime configuration loaders;
- configuration JSON fetched at startup;
- configuration schema frameworks;
- dependency-injected configuration services;
- site configuration registries.

Such infrastructure may be introduced by a fork if a concrete requirement appears.

## No Mandatory Central Site Object

The template does not require all site metadata to be represented as one large object such as:

```ts
const siteConfig = {
  company: {},
  seo: {},
  integrations: {},
  legal: {},
  social: {},
};
```

Simple named constants or focused modules are preferred.

This avoids turning ordinary values into an unnecessary configuration API.

## Duplication Guidance

A value should be moved into `app/constants` when it is meaningfully reused or represents one canonical site-wide value.

Do not extract every literal solely to eliminate all duplication.

For example, a one-off local layout number does not automatically belong in global constants.

The goal is to centralize shared meaning, not create a universal constant registry.

## Agent Guidance

AI agents modifying a fork should follow these rules:

1. Use the existing i18n architecture for localized text.
2. Use environment variables for deployment/provider configuration.
3. Treat browser-visible environment variables as public.
4. Use `app/constants` for stable non-localized values reused across the site.
5. Start with `app/constants/index.ts`.
6. Split constants into context-specific modules only when the file becomes meaningfully large or mixed.
7. Do not introduce a configuration framework without an actual requirement.
8. Never place secrets in frontend constants or client-visible environment variables.

## Rationale

The project deliberately avoids a configuration architecture because the current problem does not require one.

Ordinary TypeScript already provides:

- type checking;
- imports;
- discoverability;
- refactoring support;
- source control;
- editor tooling.

Adding another abstraction would increase the conceptual surface for AI agents and developers without providing meaningful value.

The convention also follows the broader project principle:

> Introduce architecture when there is a demonstrated need, not to anticipate hypothetical complexity.

## Consequences

### Positive

- Very small conceptual surface.
- Easy for AI agents to understand.
- No extra configuration dependencies.
- Reused values remain discoverable.
- Source-controlled site constants are easy to change.
- Context-specific splitting remains available as the project grows.

### Negative

- There is no single schema describing all website configuration.
- Some configuration-related values may live in different places by design.
- Large forks may eventually need stronger organization.
- Environment-variable validation is not automatically provided by this decision.

These tradeoffs are accepted for the base template.

## Rejected Alternatives

### Central `site.config.ts`

Rejected because it would create a configuration abstraction without a current need.

### Multiple Domain Configuration Files from the Start

Rejected because the structure should emerge from actual project growth.

### Runtime Schema Validation for Static Constants

Rejected as unnecessary for source-controlled TypeScript values.

### Environment Variables for All Configuration

Rejected because environment variables are appropriate for deployment/provider differences, not ordinary stable website constants.

### Generic Configuration Service

Rejected as excessive abstraction for a static marketing/content website.

## Future Evolution

If a fork develops substantial configuration complexity, it may introduce:

- domain-specific config modules;
- validation;
- environment schemas;
- runtime configuration;
- a higher-level configuration object.

Such changes should be driven by a concrete requirement and documented in a new ADR if they materially alter the project architecture.
