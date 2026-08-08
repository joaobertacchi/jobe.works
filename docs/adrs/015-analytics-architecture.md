# ADR 015 — Analytics Architecture

**Status:** Accepted

## Context

Analytics is a mandatory capability of the static website harness.

Websites created from the template may need to:

- understand visitor behavior;
- measure conversions;
- measure marketing campaign performance;
- capture lead-generation events;
- integrate with multiple analytics providers;
- integrate with advertising platforms;
- remain compatible with privacy and consent requirements.

The template is primarily used by AI coding agents after a website is forked. Therefore, analytics should expose a small, strongly typed, provider-independent API.

Page and component code should not contain direct calls to vendor SDKs.

## Decision

Use a **centralized, provider-independent analytics abstraction** based on strongly typed domain events.

Application code emits typed events through a single analytics API.

Conceptually:

```text
React component
      ↓
capture(event)
      ↓
analytics abstraction
      ↓
consent + attribution
      ↓
eligible tracker adapters
      ↓
GA4 / PostHog / other providers
```

## Typed Event Model

Analytics events are modeled as a discriminated TypeScript union.

Example:

```ts
type CtaPressedEvent = {
  eventName: 'cta_pressed';
  ctaId: string;
  context: string;
};

type LeadSubmittedEvent = {
  eventName: 'lead_submitted';
  formId: string;
};

type AnalyticsCustomEvent =
  | CtaPressedEvent
  | LeadSubmittedEvent;
```

The event name is the discriminator.

This allows TypeScript to validate:

- valid event names;
- required attributes;
- attribute types;
- invalid event/event-property combinations.

## Public API

Components use a generic typed capture function.

Conceptually:

```tsx
const capture = useAnalytics();

capture({
  eventName: 'cta_pressed',
  ctaId: 'hero-contact',
  context: 'homepage',
});
```

Components must not invoke analytics-provider SDKs directly.

## Event Taxonomy

The template provides only a small set of example events demonstrating the architecture.

Possible examples include:

```text
cta_pressed
lead_submitted
```

The full event taxonomy belongs to each website fork.

As the website evolves, developers or AI agents add domain-specific events to the discriminated union.

The template does not attempt to predict the complete analytics taxonomy for future sites.

## Tracker Interface

Analytics providers implement a common tracker abstraction.

Conceptually:

```ts
export type Tracker = (
  event: AnalyticsCustomEvent,
) => void | Promise<void>;
```

Infrastructure state such as the list of trackers must remain separate from the analytics event itself.

Prefer:

```ts
trackEvent(trackers, event);
```

rather than embedding tracker instances into an event object.

## Multiple Providers

Multiple trackers may be active simultaneously.

For example:

```text
capture(event)
   ├── GA4
   ├── PostHog
   └── development console tracker
```

Each provider is implemented through a centralized adapter.

## Provider Isolation

Provider-specific APIs and SDKs belong only in integration/tracker code.

Conceptually:

```text
app/
  analytics/
    types.ts
    use-analytics.ts
    manager.ts
    attribution.ts
    trackers/
      ga4.ts
      posthog.ts
      console.ts
```

The exact file structure may evolve, but vendor dependencies must not be scattered throughout routes and components.

## Provider Configuration

Provider identifiers and public client configuration are supplied through environment variables.

Examples:

```text
VITE_GA4_MEASUREMENT_ID
VITE_POSTHOG_KEY
VITE_POSTHOG_HOST
VITE_META_PIXEL_ID
```

Because production is a static browser application, values embedded in the client build must never be treated as secrets.

The template documentation must make this explicit.

## Optional Providers

Analytics providers are optional.

If the required environment configuration for a provider is absent, that provider is not registered.

A newly forked template must continue to build and run without a configured external analytics provider.

## Development Tracker

The template should provide a lightweight development tracker.

Conceptually:

```ts
const consoleTracker: Tracker = event => {
  console.debug('[analytics]', event);
};
```

This provides immediate visibility into generated events without requiring a third-party service.

It also facilitates development, automated browser testing, and AI-agent validation.

## Failure Isolation

Analytics must never break normal website behavior.

Failure of one tracker:

- must not prevent the requested user action;
- must not prevent other trackers from running;
- must not propagate into application functionality.

Tracker execution should therefore be isolated.

Conceptually:

```ts
for (const tracker of trackers) {
  try {
    await tracker(event);
  } catch (error) {
    reportAnalyticsError(error);
  }
}
```

Development may expose these failures for debugging, while production site functionality remains unaffected.

## Page Views

Page-view tracking is an infrastructure concern.

Individual routes should not need to explicitly emit page-view events.

The analytics layer should observe React Router navigation and dispatch page-view information centrally.

This ensures newly created pages receive page-view analytics automatically.

## Campaign Attribution

The analytics infrastructure supports standard campaign attribution parameters.

The initial allowlist is:

```text
utm_source
utm_medium
utm_campaign
utm_id
utm_term
utm_content
```

Campaign parameters are parsed centrally rather than individually by routes or forms.

Conceptually:

```ts
type CampaignAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  campaignId?: string;
  term?: string;
  content?: string;
};
```

## Attribution Scope

The base template implements simple landing/current-visit attribution.

It does not implement a sophisticated multi-touch attribution engine.

Analytics and advertising platforms may independently apply their own attribution models.

## Attribution Persistence

Campaign attribution is kept in memory by default.

The base template does not persist campaign attribution across sessions.

A fork may introduce first-touch or longer-term attribution persistence if its requirements justify it and the applicable privacy policy permits it.

## Attribution and Leads

When a lead is submitted, known allowlisted campaign attribution may be associated with the lead where appropriate.

This allows a business to answer questions such as:

```text
Which campaign generated this inquiry?
```

without copying arbitrary browser state into the CRM or form provider.

## Explicit Attribution Allowlist

The analytics infrastructure must never automatically capture arbitrary query parameters.

Only explicitly supported attribution parameters should be processed.

In particular, code should not automatically send:

- the complete query string;
- arbitrary form fields;
- arbitrary URL parameters;
- authentication tokens;
- personal information found in URLs.

## Advertising Click Identifiers

Provider-specific advertising identifiers such as:

```text
gclid
gbraid
wbraid
fbclid
```

are not normalized into the generic UTM model.

If required, they are handled by the relevant provider integration subject to consent and privacy requirements.

## Consent Integration

Analytics dispatch occurs through the centralized consent architecture defined by ADR 016.

Trackers declare which consent category they require.

Conceptually:

```ts
{
  tracker: posthogTracker,
  consentCategory: 'analytics',
}
```

The component emitting an event does not inspect consent state.

## Analytics vs Marketing

The architecture distinguishes behavioral analytics from advertising/marketing tracking.

Typical analytics integrations include:

```text
GA4
PostHog
Plausible
```

Typical marketing integrations include:

```text
Meta Pixel
Google Ads
LinkedIn Insight Tag
```

They may consume the same internal domain events, but their activation is governed by different consent categories.

## Vendor Event Mapping

Internal event names remain independent from vendor-specific event names.

For example:

```text
internal event       Meta
-----------------    ----
lead_submitted   →   Lead
```

The provider adapter performs this translation.

Application components therefore remain stable if providers are changed.

## Testing

The analytics architecture should support testing through fake or mock trackers.

Tests should be able to verify:

- an expected event was emitted;
- the event contains the expected typed properties;
- provider failure does not break application behavior;
- trackers are invoked according to consent state;
- page navigation generates page views;
- attribution uses only allowlisted parameters.

## Rationale

The centralized typed abstraction provides strong architectural guidance using ordinary TypeScript rather than custom enforcement tooling.

This is especially valuable for AI agents because the type system communicates:

- which events exist;
- which parameters they require;
- where provider integrations belong.

Provider independence also avoids coupling page code to analytics vendors.

## Consequences

### Positive

- Strong event type safety.
- Small API for developers and agents.
- Multiple analytics providers supported.
- Providers can be changed without rewriting page components.
- Analytics failures are isolated.
- Page views work automatically.
- Campaign attribution is consistent.
- Consent can be applied centrally.
- No analytics provider is mandatory.

### Negative

- Provider adapters require maintenance.
- Some vendor-specific features may not map cleanly to generic events.
- All domain events must be explicitly modeled.
- Advanced attribution requires fork-specific extension.

## Rejected Alternatives

### Direct Vendor Calls from Components

Rejected because they create vendor coupling, scatter tracking logic, and make consent enforcement harder.

### Free-Form Event API

For example:

```ts
capture('anything', arbitraryObject);
```

Rejected because it removes compile-time guarantees and gives agents excessive freedom to create inconsistent event taxonomies.

### Single Analytics Provider

Rejected because marketing websites commonly use more than one analytics or advertising service.

### Analytics Events Containing Tracker Instances

Rejected because event data and infrastructure concerns should remain separate.

### Multi-Touch Attribution Engine

Rejected as unnecessary complexity for the base template.
