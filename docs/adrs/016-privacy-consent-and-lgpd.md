# ADR 016 — Privacy, Consent, and LGPD Architecture

**Status:** Accepted

## Context

Websites created from the template may:

- advertise through paid campaigns;
- use analytics services;
- use advertising pixels;
- collect leads through forms;
- send submitted information to third-party services;
- process personal data;
- transfer personal data to providers outside Brazil.

The initial real-world use case is a Brazilian company website that will advertise services and capture leads.

The website therefore needs an architecture that supports compliance with Brazil's Lei Geral de Proteção de Dados Pessoais — LGPD.

Technical architecture alone cannot guarantee legal compliance. Compliance also depends on the site's:

- actual processing purposes;
- chosen legal bases;
- providers;
- contracts;
- retention policies;
- privacy notices;
- security practices;
- operational handling of data-subject requests.

The template should nevertheless make compliant implementation substantially easier and make accidental privacy violations harder.

## Decision

Privacy and consent are first-class infrastructure capabilities of the template.

Use a centralized consent manager with three provider-neutral categories:

```ts
type ConsentCategory =
  | 'necessary'
  | 'analytics'
  | 'marketing';
```

## Default Consent State

The conservative base-template default is:

```text
necessary → enabled
analytics → disabled
marketing → disabled
```

Analytics and marketing trackers requiring consent are not activated until the visitor makes the applicable affirmative choice.

Individual forks may modify this policy if their legal assessment and provider configuration justify another lawful basis.

## Necessary Category

Necessary functionality does not depend on optional consent.

This category is limited to functionality genuinely required for the website to work or for a user-requested service to operate.

The category must not become a mechanism for bypassing analytics or marketing consent.

## Analytics Category

The analytics category covers services used primarily to understand website usage and performance.

Possible examples:

```text
GA4
PostHog
other audience-measurement services
```

Whether a specific analytics implementation can lawfully operate without consent depends on its configuration, purpose and applicable legal analysis.

The base template therefore takes the conservative approach of requiring analytics consent.

## Marketing Category

Marketing consent covers technologies used for activities such as:

- advertising measurement;
- retargeting;
- advertising audiences;
- behavioral advertising;
- marketing-platform conversion tracking.

Examples may include:

```text
Meta Pixel
LinkedIn Insight Tag
Google Ads advertising functionality
```

These remain separate from ordinary analytics consent.

Accepting analytics must not automatically enable marketing tracking.

## Consent Banner

The base template includes a configurable consent banner.

The first-level interface should provide comparably accessible actions for:

```text
Accept all
Reject non-essential
Customize
```

The interface must avoid intentionally manipulative patterns that make rejection materially harder than acceptance.

## Custom Consent Screen

The customization interface allows the user to independently configure at least:

```text
Analytics
Marketing
```

Necessary processing remains enabled where it is genuinely required.

## Consent Persistence

The visitor's consent decision is persisted.

Conceptually:

```ts
type StoredConsent = {
  version: number;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};
```

The exact browser storage mechanism is an implementation detail.

## Consent Versioning

Consent state is versioned.

A website fork may increase the consent version following a material change in processing practices that requires a new choice.

Old incompatible consent state is then treated as unresolved.

## Consent Withdrawal

Visitors must have an accessible mechanism to change or withdraw their optional consent.

The base layout should provide a persistent entry point such as:

```text
Cookie settings
```

typically exposed through the site footer.

Changing consent must update which optional integrations are permitted to operate.

## Central Consent Enforcement

Components and routes must not implement vendor-specific consent checks.

Invalid pattern:

```ts
if (hasConsent) {
  fbq(...);
}
```

Preferred architecture:

```text
component
    ↓
capture(event)
    ↓
analytics manager
    ↓
consent manager
    ↓
eligible integrations
```

This ensures privacy logic is centralized and easier to validate.

## Tracker Consent Requirements

Every optional analytics or marketing tracker declares its consent requirement.

Conceptually:

```ts
{
  tracker: posthogTracker,
  consentCategory: 'analytics',
}
```

or:

```ts
{
  tracker: metaTracker,
  consentCategory: 'marketing',
}
```

The analytics manager invokes only eligible trackers.

## Script Loading

Where practical, optional vendor scripts themselves should not be loaded before the required consent exists.

The architecture should not merely suppress event calls while loading tracking scripts that independently perform disallowed storage or tracking.

## Google Consent Mode

Google Consent Mode is a provider-specific implementation detail.

It is not the project's generic consent model.

Conceptually:

```text
ConsentManager
      ↓
Google adapter
      ↓
Google Consent Mode
```

The Google adapter is responsible for mapping generic website consent state into the appropriate Google consent signals.

Google-specific terminology must not leak throughout application components.

## Lead Forms

Lead-form processing is separate from cookie consent.

Submitting a contact form must not automatically be treated as consent to all analytics, advertising, or unrelated marketing uses.

A typical lead form may collect only data necessary for its stated purpose, for example:

```text
name
work email
company
message
```

The exact fields belong to the fork.

## Data Minimization

Forms should request only data reasonably necessary for the declared purpose.

The template should discourage collecting extra personal information merely because it may later be useful.

## Form Privacy Notice

A lead form should display concise contextual information explaining how the submitted information will be used.

For example, conceptually:

```text
We use the information provided to respond to your inquiry.
See our Privacy Notice for more information.
```

The text itself is fork-specific and localized.

## Separate Marketing Opt-In

Consent for ongoing promotional communication should be separated from the contact-form action when applicable.

For example:

```text
[ ] I would like to receive occasional updates and offers.
```

Such a choice must not be preselected.

The ability to request contact must not unnecessarily depend on consent to unrelated promotional messages.

## Legal Bases

The template must not assume that all personal-data processing uses consent as its legal basis.

LGPD provides multiple legal bases.

Each website fork is responsible for determining and documenting the appropriate legal basis for each processing purpose.

Where legitimate interest is relied upon, the fork should document its assessment of:

- purpose;
- necessity;
- reasonable expectations;
- balancing against data-subject rights;
- safeguards.

## Privacy Notice

The template includes localized privacy-notice placeholder routes.

For example:

```text
/en/privacy
/pt-BR/privacy
```

The final notice is site-specific legal content and must be completed by the fork owner.

## Privacy Notice Scope

The privacy notice should address, as applicable:

- identity of the controller;
- categories of personal data processed;
- purposes of processing;
- applicable legal bases;
- contact/lead forms;
- analytics;
- cookies and similar technologies;
- advertising and marketing technologies;
- campaign attribution;
- providers/processors;
- data sharing;
- international data transfers;
- retention periods or criteria;
- security practices;
- data-subject rights;
- consent withdrawal;
- how rights may be exercised;
- relevant privacy/controller contact information.

## Cookie Information

Cookie/tracking information may be part of the broader privacy notice or provided separately.

Regardless of document structure, the visitor must have convenient access to relevant tracking information from the consent interface.

## International Data Transfers

The architecture assumes that some website forks may use foreign SaaS providers.

Provider evaluation must therefore consider whether personal information is transferred internationally and what transfer mechanism and contractual safeguards apply.

This applies particularly to services such as:

- analytics platforms;
- CRM systems;
- form processors;
- email services;
- advertising platforms.

The template does not attempt to automate the legal determination.

## Third-Party Provider Selection

A website fork collecting leads should evaluate service providers for factors including:

- data-processing terms;
- security;
- data location;
- subprocessors;
- deletion capabilities;
- retention controls;
- mechanisms for data-subject requests;
- international-transfer safeguards.

The base template remains provider-neutral.

## Campaign Attribution

UTM campaign parameters may be parsed before optional consent because parsing the current URL does not itself require sending information to a tracker.

The base template keeps parsed campaign state in memory.

It does not persist campaign attribution before the relevant privacy requirements have been satisfied.

## Campaign Data and Leads

If appropriate for the site's disclosed purpose, explicitly allowlisted campaign attribution may be associated with a submitted lead.

For example:

```text
source
medium
campaign
```

The application must not automatically send complete URLs, arbitrary query parameters, cookies, or unrelated browser information into the lead-management provider.

## Personal Data in Analytics

Analytics events must not automatically capture arbitrary personal information.

Typed event schemas serve as a privacy boundary as well as a correctness boundary.

Sensitive or unnecessary personal data must not be introduced into analytics event payloads without explicit architectural and privacy review.

## Static Deployment

The privacy architecture must preserve the project's static deployment model.

Consent management and tracking decisions execute in the browser.

No application backend is required solely for consent management.

Third-party form or CRM integrations remain subject to the backend exception and integration policies established elsewhere.

## Validation

The project's canonical validation flow should mechanically test privacy invariants where feasible.

Examples include:

```text
✓ analytics trackers do not execute before analytics consent

✓ marketing trackers do not execute before marketing consent

✓ Reject non-essential leaves optional trackers disabled

✓ changing consent updates eligible trackers

✓ stored consent is versioned

✓ privacy routes exist for every configured locale

✓ cookie/settings control is accessible after the initial banner closes
```

Where script loading can be tested reliably:

```text
✓ non-essential tracking scripts do not load before applicable consent
```

Not every legal requirement can or should be converted into a build-time rule.

## Agent Guidance

AI agents modifying a fork should follow these principles:

1. Do not add tracking directly inside page code.
2. Add providers through the centralized integration layer.
3. Classify new trackers as necessary, analytics, or marketing.
4. Do not send arbitrary form data to analytics.
5. Do not make marketing opt-in a condition for an unrelated contact request.
6. Update the privacy notice when introducing material new processing.
7. Treat a new provider or materially different processing purpose as a privacy-relevant architectural change.

## Rationale

Privacy architecture is most reliable when enforcement occurs centrally rather than relying on every component author or AI agent remembering provider-specific rules.

A small consent taxonomy gives agents a simple mental model while remaining provider-neutral.

Separating:

```text
necessary
analytics
marketing
```

also prevents acceptance of behavioral analytics from unintentionally enabling advertising and retargeting.

The architecture favors a conservative default because the template is intended to provide a safe starting point rather than make jurisdiction-specific assumptions on behalf of each fork.

## Consequences

### Positive

- LGPD-aware behavior exists from the beginning of a project.
- Optional tracking is centrally controlled.
- New analytics providers inherit the same consent architecture.
- Marketing and analytics remain distinct.
- Visitors can reject or revoke optional tracking.
- Lead-form privacy is considered separately from cookies.
- AI agents have a small and explicit privacy model.
- Provider-specific consent APIs do not leak into components.

### Negative

- Consent infrastructure adds complexity to otherwise simple static sites.
- Some analytics data is lost when visitors reject tracking.
- Legal content still requires fork-specific review.
- Provider configuration can change the actual compliance posture.
- International-transfer compliance cannot be solved purely by frontend architecture.

## Rejected Alternatives

### Load All Trackers Immediately

Rejected as an inappropriate default for an LGPD-oriented template.

### Single Accept Button

Rejected because visitors need meaningful control over optional processing.

### One Combined Analytics/Marketing Consent

Rejected because behavioral analytics and advertising have materially different purposes.

### Consent Checks in Individual Components

Rejected because enforcement would become fragmented and easy to bypass.

### Treat Contact Submission as Marketing Consent

Rejected because requesting a response and subscribing to ongoing promotional communication are separate purposes.

### Require Consent as the Legal Basis for All Processing

Rejected because LGPD provides multiple legal bases and the appropriate basis depends on the processing purpose.

## Compliance Boundary

This ADR defines technical architecture supporting LGPD-compliant implementations.

It does not constitute a determination that every website fork is legally compliant.

The fork owner remains responsible for the site's actual processing activities, legal bases, notices, contracts, retention, security and operational compliance.
