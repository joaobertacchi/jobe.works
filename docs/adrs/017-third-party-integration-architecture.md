# ADR 017 — Third-Party Integration Architecture

**Status:** Accepted

## Context

Websites created from the template may integrate with third-party services for capabilities such as:

- lead forms;
- CRM;
- email delivery;
- scheduling;
- maps;
- chat;
- analytics;
- advertising;
- payment-related links or services;
- other SaaS APIs.

The project is a static-site harness intended to remain simple for both developers and AI coding agents.

An earlier architectural principle established that third-party integrations should be centralized rather than scattered throughout page and component code.

However, most integrations use one selected provider for one capability.

Creating generic provider interfaces and adapters for every service would introduce speculative abstraction without a demonstrated need.

Analytics is an exception because:

- multiple analytics providers commonly operate simultaneously;
- consent applies across multiple trackers;
- application events benefit from a provider-independent event model.

Ordinary integrations do not need to follow the analytics abstraction model.

## Decision

Third-party integrations must be **centralized but not generically abstracted by default**.

Provider-specific APIs, types, concepts, and SDKs are allowed inside dedicated integration modules.

Do not introduce generic provider interfaces solely to make a single provider theoretically replaceable.

The architectural goal is:

> isolate third-party dependencies, not hide their existence.

## Integration Structure

Provider integrations live in a dedicated integration area.

Conceptually:

```text id="r83ie7"
app/
  integrations/
    hubspot/
      client.ts
      forms.ts

    calendly/
      client.ts

    maps/
      ...
```

The exact directory organization may evolve as a fork grows.

The important constraint is that provider-specific implementation details should have an obvious home.

## No Speculative Provider Abstraction

For a website using one CRM provider, do not create architecture such as:

```ts id="tdgvu2"
interface LeadProvider {
  submitLead(...): Promise<void>;
}

class HubSpotLeadProvider implements LeadProvider {
  // ...
}
```

unless the project actually has a reason to support interchangeable implementations.

A direct provider integration is preferred:

```text id="cuz0aq"
ContactForm
    ↓
HubSpot integration
    ↓
HubSpot
```

rather than:

```text id="50tjbb"
ContactForm
    ↓
LeadService
    ↓
LeadProvider
    ↓
HubSpotAdapter
    ↓
HubSpot
```

when HubSpot is the only provider.

## Domain-Friendly Helpers

Although generic provider abstraction is not required, integration modules may expose functions that make application code clearer.

For example:

```ts id="xfmcbl"
submitHubSpotLead(...)
```

or:

```ts id="8l1342"
submitContactForm(...)
```

may both be reasonable depending on the site.

The deciding factor is code clarity, not provider independence.

A domain-friendly helper does not imply that a generic multi-provider architecture must exist underneath it.

## Provider-Specific Types

Provider-specific types may be used within the integration layer.

Application code should avoid unnecessary dependence on large vendor-specific response objects when only a small result is required.

For example, an integration function may normalize a complex provider response into:

```ts id="qv9x16"
type SubmissionResult = {
  success: boolean;
};
```

when that simplification has immediate value.

This is ordinary encapsulation, not a requirement to create a generic provider system.

## Integration Reuse

Before adding a new provider, developers and AI agents should check whether the project already contains an integration serving the same purpose.

Prefer extending or reusing the existing integration where appropriate.

Do not add a second provider for the same capability merely because an implementation example is easier to generate.

## Browser-Safe Integrations

The normal static-site integration path is:

```text id="rsm50l"
browser
   ↓
third-party browser-safe API or SDK
```

This is appropriate when:

- the provider explicitly supports browser-side integration;
- no secret credential is required;
- the operation does not depend on trusted server execution;
- privacy requirements are satisfied.

## Environment Configuration

Provider configuration should generally be supplied through environment variables.

Examples may include:

```text id="1pgzn3"
VITE_HUBSPOT_PORTAL_ID
VITE_POSTHOG_KEY
VITE_GA4_MEASUREMENT_ID
VITE_CALENDLY_URL
```

Any value compiled into the static frontend must be treated as public.

Environment variables do not make browser-side values secret.

## Secrets

Secrets must never be embedded into the static client build.

Examples include:

- private API keys;
- client secrets;
- signing secrets;
- privileged bearer tokens;
- administrative credentials.

If a third-party integration requires a secret, it cannot be implemented as an ordinary browser-only integration.

It must trigger the project's backend/serverless exception policy.

## Backend Escalation

A backend or serverless function may be justified when an integration requires:

- secret credentials;
- trusted signature generation;
- privileged API access;
- trusted validation;
- secure webhook processing;
- protection against client-side tampering;
- a provider that does not support safe browser-side requests.

Backend infrastructure remains an explicit architectural exception, not the default implementation path.

Any accepted backend/serverless exception must be documented in a new ADR after it is introduced.

## Integration Preference Order

When implementing a new capability, prefer:

```text id="q8rut6"
1. existing integration already in the project
2. provider-supported browser-safe integration
3. webhook / SaaS automation when appropriate
4. backend/serverless only when genuinely required
```

This preserves the static deployment model for the common case.

## Third-Party Scripts

Third-party scripts should be initialized in a centralized and discoverable location.

Avoid injecting the same vendor script independently from multiple routes or components.

Central initialization helps with:

- duplicate loading;
- configuration;
- lifecycle management;
- consent enforcement;
- debugging;
- removal of providers later.

## Consent and Privacy

Integrations that perform analytics, advertising, tracking, or personal-data processing are subject to ADR 016 — Privacy, Consent, and LGPD Architecture.

Integrations must not bypass the centralized consent model.

For example:

```text id="4r7akx"
component
   ↓
analytics abstraction
   ↓
consent manager
   ↓
marketing provider
```

is preferred over directly initializing or calling a marketing pixel from page code.

## Lead Forms

Lead forms may call a selected form or CRM provider directly through that provider's centralized integration module.

Conceptually:

```text id="ke172q"
ContactForm
    ↓
integration module
    ↓
selected form / CRM provider
```

The base template does not require a generic:

```text id="kqgvcp"
LeadProvider
```

interface.

The selected provider may differ between forks.

## Form Security

A browser-direct form integration is acceptable only if the provider is designed for public client submissions.

Do not expose privileged API credentials to make a server-oriented API callable from the browser.

If a provider requires privileged credentials, use the backend exception process or choose a browser-safe provider.

## Personal Data

Integration modules handling personal data should transmit only the data necessary for the declared purpose.

Do not automatically attach:

- complete browser state;
- arbitrary query parameters;
- cookies;
- analytics identifiers;
- unrelated form fields;

unless explicitly required and reviewed.

## Failure Behavior

Third-party integration failures should be handled intentionally.

A failure should produce appropriate behavior for the capability involved.

For example, if a lead submission fails:

- the user should receive an understandable error;
- the form should preserve recoverable input where appropriate;
- unrelated parts of the website should remain functional.

Third-party failures must not crash the site globally.

## Loading and Performance

Integrations should avoid loading unnecessary third-party JavaScript during initial page rendering.

Where feasible:

- load integrations only when needed;
- defer non-essential scripts;
- respect consent requirements;
- avoid duplicate SDKs serving the same purpose.

Performance optimization should remain proportional to actual need rather than introduce elaborate loading infrastructure prematurely.

## Testing

Integration modules should be structured so that application behavior can be tested without making real third-party requests.

This may be achieved through normal mocking at the module or network boundary.

The template does not require a generic adapter architecture merely to enable testing.

Relevant tests may verify:

```text id="fn4sxi"
✓ expected provider call is made
✓ malformed submission is handled
✓ provider failure produces usable UI behavior
✓ secret configuration is not exposed
✓ consent-controlled integration does not activate prematurely
```

## Agent Guidance

AI agents modifying the project should follow these rules:

1. Look for an existing integration before adding a new provider.
2. Keep provider-specific code inside the integration layer.
3. Do not introduce a generic interface solely for hypothetical provider replacement.
4. Do not call vendor APIs directly from arbitrary route or UI code when a centralized integration exists.
5. Treat all browser-visible environment variables as public.
6. Never expose secret credentials in frontend code.
7. Use backend/serverless only when the integration genuinely requires trusted execution.
8. Apply privacy and consent requirements when the integration processes personal data or performs tracking.
9. Prefer the provider's documented browser-safe integration over custom infrastructure.
10. Do not add additional dependencies or architectural layers without an immediate need.

## Analytics Exception

Analytics follows ADR 015 and deliberately uses a stronger abstraction.

This is because analytics has different characteristics from ordinary integrations:

- multiple providers may operate simultaneously;
- domain events should remain provider-independent;
- consent must be enforced across trackers;
- provider-specific event mapping is useful.

This exception should not be generalized to all integrations.

## Rationale

The architecture seeks to avoid two opposite problems.

### Scattered integrations

Without centralization:

```text id="qgo16j"
route → vendor SDK
component → vendor SDK
footer → vendor SDK
form → vendor API
```

provider behavior becomes difficult to find, review, test, replace, and govern.

### Premature abstraction

With excessive abstraction:

```text id="aqdnjx"
domain service
  ↓
generic interface
  ↓
adapter
  ↓
provider client
  ↓
provider SDK
```

a simple integration gains multiple concepts despite having only one implementation.

Centralized provider-specific modules provide most of the architectural benefit without this additional complexity.

This is especially important for an AI-agent-oriented template, where every architectural layer increases the amount of project-specific knowledge an agent must understand.

## Consequences

### Positive

- Third-party dependencies remain discoverable.
- Fewer unnecessary abstractions.
- Lower conceptual burden for humans and AI agents.
- Providers can use their native APIs naturally.
- Static deployment remains the default.
- Secret-dependent integrations are clearly identified.
- Privacy controls remain centralized.
- Individual forks can select different providers freely.

### Negative

- Replacing a provider may require application-level changes.
- Provider-specific concepts may intentionally appear near integration call sites.
- Similar providers across different forks may have different APIs.
- A generic abstraction may need to be introduced later if multiple implementations become necessary.

These costs are accepted because abstraction should follow demonstrated requirements rather than hypothetical future replacement.

## Rejected Alternatives

### Generic Interface for Every Integration

Rejected as speculative abstraction.

Most websites use one provider for each external capability.

### Direct Vendor Calls Anywhere

Rejected because integrations would become scattered and difficult to govern.

### Shared Universal Integration API

Rejected because CRM, forms, maps, scheduling, email, analytics, and other services have fundamentally different semantics.

### Backend Proxy for Every Integration

Rejected because it violates the static-first deployment model and adds unnecessary infrastructure.

### Environment Variables as Secret Storage

Rejected because values included in the browser build are publicly accessible.

## Future Evolution

If a website genuinely needs multiple interchangeable providers for the same capability, a generic abstraction may be introduced at that time.

Such abstraction should be driven by real duplication or interchangeability requirements, not by template convention.
