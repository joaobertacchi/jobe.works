# Design - Phases 8 and 9: Third-Party Integration and Production Assets

**Date:** 2026-08-11
**Status:** Approved

## Scope

Implement Phase 8 (a representative browser-safe third-party integration) and Phase 9 (representative production asset handling) from `docs/PHASES.md`.

The implementation follows ADR 017 (Third-Party Integration Architecture), ADR 020 (Images, Assets, Fonts, and Cache Invalidation), and the existing localization, analytics, consent, privacy, and static-build architecture. The two phases remain independent vertical slices.

## Phase 8 Architecture

Add a localized contact form to the existing Services page. The form is a domain component and calls one centralized built-in mock provider module under:

```text
app/integrations/example-contact/
```

The integration is direct and provider-shaped. Do not add a generic provider interface, route action, backend, serverless function, secret, SDK, or dependency.

The browser-side submission payload contains only:

```ts
type ExampleContactSubmission = {
  name: string;
  email: string;
  message: string;
  marketingOptIn: boolean;
  attribution: CampaignAttribution;
};
```

The existing unchecked `FormPrivacyNotice` marketing opt-in remains separate from contact submission and cookie consent. The form does not inspect analytics consent.

On successful submission, the form calls:

```ts
capture({
  eventName: 'lead_submitted',
  formId: 'services-contact',
});
```

The existing analytics manager remains the sole consent-enforcement point. Personal data and attribution are never added to the analytics event.

## Contact Form Behavior

`ContactForm` uses native form controls and existing UI primitives. All labels, validation messages, and status text remain in typed localized dictionaries.

The required fields are:

- name;
- email;
- message.

The email receives a simple format check. Validation errors are associated with their fields, and submission status is announced through an accessible live region.

Submission follows this flow:

```text
submit
  -> validate locally
  -> disable duplicate submission
  -> submitExampleContact(fields, marketingOptIn, attribution)
  -> success: capture lead_submitted, reset fields, show confirmation
  -> failure: preserve fields, show a localized retry message
```

The built-in mock provider resolves asynchronously without network access or credentials. Tests replace the integration module to exercise rejection. Provider failure remains local to the form and does not affect the rest of the site.

Only the existing typed `CampaignAttribution` object is attached to provider submissions. The implementation does not attach a complete URL, query string, arbitrary query parameters, cookies, analytics identifiers, or unrelated browser state.

## Phase 9 Architecture

Add one representative application image at:

```text
app/assets/images/about-workflow.svg
```

The About route imports it through Vite using `?no-inline`, ensuring the production build emits a separate content-hashed asset, and renders it with a direct `<img>` element and alternative text from the typed About dictionary.

Keep the existing system font stack. Do not add a custom font, remote font provider, image component, optimization pipeline, or empty `fonts/` and `icons/` directories.

The existing `public/favicon.ico` and `public/social-card.svg` remain examples of files whose stable URLs are intentional.

## Static Asset Validation

Extend static-build finalization to inspect generated local `<img src>` references.

For each local image reference, validation verifies that:

- the referenced file exists under `build/client`;
- application images emitted under `/assets/` follow Vite's default `<source-name>-<hash>.<extension>` filename shape, with a non-empty generated hash segment.

External URLs and data URLs are ignored. A missing local image or an unhashed application image under `/assets/` fails the production build with a focused error.

This validation remains part of `finalizeStaticBuild`, so it runs through the existing `npm run build` and `npm run validate:static` paths. No custom asset manifest is introduced.

## Testing

### Phase 8

Unit and component tests cover:

- required-field validation;
- invalid email validation;
- successful submission and reset;
- duplicate-submit prevention;
- preserved input and retry messaging on provider failure;
- unchecked marketing opt-in;
- exact allowlisted attribution forwarding;
- `lead_submitted` emission without personal data.

The mock integration contract is tested independently.

Playwright exercises the Services form with and without analytics consent. Contact submission succeeds in both states, while the development console tracker receives `lead_submitted` only when analytics consent is enabled. Provider failure is covered at the component boundary rather than through a production-only failure trigger.

### Phase 9

Static finalizer tests cover:

- an existing hashed local image;
- a missing local image;
- an unhashed application image under `/assets/`;
- ignored external and data image URLs.

The About route test verifies direct image markup and localized alternative text.

## Verification

Activate the Node.js version from `.nvmrc`, then run:

```bash
npm run check
npm run test:e2e
```

After deterministic validation passes, run the architecture-review subagent against the phase changes and fix all high and medium findings.

## Out of Scope

- A named real provider or provider SDK.
- Provider credentials or required environment configuration.
- A generic lead-provider abstraction.
- A new contact route.
- Route actions, backend APIs, serverless functions, or runtime servers.
- Personal data in analytics events.
- Arbitrary campaign/query parameter capture.
- Custom fonts or font preloading.
- Image optimization or responsive-image infrastructure.
- Deployment-provider cache configuration.
