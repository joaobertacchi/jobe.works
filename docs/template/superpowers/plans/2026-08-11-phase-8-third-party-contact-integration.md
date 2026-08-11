# Phase 8 Third-Party Contact Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localized Services-page contact form that demonstrates a centralized browser-safe integration, privacy-preserving attribution, usable failure handling, and consent-aware analytics.

**Architecture:** A domain `ContactForm` owns browser form state and calls one direct built-in mock integration under `app/integrations/example-contact/`. It forwards only explicit form fields plus the existing typed UTM attribution, while the existing analytics manager alone decides whether the post-success `lead_submitted` event reaches trackers.

**Tech Stack:** React 19, React Router Framework Mode 8, TypeScript 5.9, typed i18n dictionaries, Vitest, React Testing Library, Playwright.

---

## File Map

- Create `app/integrations/example-contact/submit-example-contact.ts`: provider-shaped submission type and built-in asynchronous mock.
- Create `app/integrations/example-contact/submit-example-contact.test.ts`: contract test proving no configuration or network is required.
- Create `app/components/domain/contact-form.tsx`: validation, submission state, privacy notice composition, attribution forwarding, and success analytics.
- Create `app/components/domain/contact-form.test.tsx`: component behavior at mocked analytics and integration boundaries.
- Modify `app/i18n/translations/services.ts`: exhaustive English and Brazilian Portuguese form copy.
- Modify `app/routes/$locale.services.tsx`: compose the form into a dedicated divided section.
- Modify `app/routes/$locale.test.tsx`: verify localized route composition and analytics payload.
- Modify `tests/e2e/privacy-consent.spec.ts`: prove contact submission is independent from analytics consent and tracking remains consent-gated.

Do not create a route action, backend endpoint, provider interface, environment-variable requirement, SDK, or dependency.

### Task 1: Built-In Example Integration

**Files:**
- Create: `app/integrations/example-contact/submit-example-contact.test.ts`
- Create: `app/integrations/example-contact/submit-example-contact.ts`

- [ ] **Step 1: Write the failing integration contract test**

```ts
import { describe, expect, it } from "vitest";

import { submitExampleContact } from "./submit-example-contact";

describe("submitExampleContact", () => {
  it("accepts a browser-safe submission without credentials or network", async () => {
    await expect(
      submitExampleContact({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "I would like to discuss a static website.",
        marketingOptIn: false,
        attribution: {
          source: "newsletter",
          campaign: "phase-eight",
        },
      }),
    ).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run:

```bash
nvm use
npx vitest run app/integrations/example-contact/submit-example-contact.test.ts
```

Expected: FAIL because `./submit-example-contact` does not exist.

- [ ] **Step 3: Add the minimal provider-shaped integration**

Create `app/integrations/example-contact/submit-example-contact.ts`:

```ts
import type { CampaignAttribution } from "../../analytics/attribution";

export type ExampleContactSubmission = {
  name: string;
  email: string;
  message: string;
  marketingOptIn: boolean;
  attribution: CampaignAttribution;
};

export function submitExampleContact(
  submission: ExampleContactSubmission,
): Promise<void> {
  void submission;
  return Promise.resolve();
}
```

This intentionally models the single selected integration directly. It does not create a `LeadProvider`, issue a request, or accept a secret.

- [ ] **Step 4: Run the focused test**

Run:

```bash
npx vitest run app/integrations/example-contact/submit-example-contact.test.ts
```

Expected: PASS.

- [ ] **Step 5: Record the checkpoint**

Run `git diff --check`. If the user has explicitly authorized commits, commit only these files:

```bash
git add app/integrations/example-contact/submit-example-contact.ts app/integrations/example-contact/submit-example-contact.test.ts
```

### Task 2: Localized Contact Form

**Files:**
- Create: `app/components/domain/contact-form.test.tsx`
- Create: `app/components/domain/contact-form.tsx`
- Modify: `app/i18n/translations/services.ts`

- [ ] **Step 1: Write failing component tests at the integration and analytics boundaries**

Create `app/components/domain/contact-form.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "../../i18n/i18n";
import { ContactForm } from "./contact-form";

const mocks = vi.hoisted(() => ({
  capture: vi.fn(),
  submitExampleContact: vi.fn(),
}));

vi.mock("../../analytics/analytics", () => ({
  useAnalytics: () => ({
    attribution: { source: "newsletter", campaign: "phase-eight" },
    capture: mocks.capture,
  }),
}));

vi.mock(
  "../../integrations/example-contact/submit-example-contact",
  () => ({ submitExampleContact: mocks.submitExampleContact }),
);

function renderForm(locale: "en" | "pt-BR" = "en") {
  return render(
    <I18nProvider locale={locale}>
      <ContactForm />
    </I18nProvider>,
  );
}

function completeRequiredFields() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "I would like to discuss a static website." },
  });
}

describe("ContactForm", () => {
  beforeEach(() => {
    mocks.capture.mockReset();
    mocks.submitExampleContact.mockReset().mockResolvedValue(undefined);
  });

  it("shows localized validation for required fields and invalid email", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(screen.getAllByText("This field is required.")).toHaveLength(3);
    expect(mocks.submitExampleContact).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
  });

  it("forwards only explicit fields and allowlisted attribution", async () => {
    renderForm();
    completeRequiredFields();

    expect(
      screen.getByRole("checkbox", {
        name: "I would like to receive occasional updates and offers.",
      }),
    ).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    await waitFor(() => {
      expect(mocks.submitExampleContact).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "I would like to discuss a static website.",
        marketingOptIn: false,
        attribution: { source: "newsletter", campaign: "phase-eight" },
      });
    });
    expect(mocks.capture).toHaveBeenCalledWith({
      eventName: "lead_submitted",
      formId: "services-contact",
    });
    expect(screen.getByText("Thanks. We will be in touch soon.")).toBeVisible();
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("prevents a duplicate submission while the provider is pending", async () => {
    let resolveSubmission: (() => void) | undefined;
    mocks.submitExampleContact.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmission = resolve;
        }),
    );
    renderForm();
    completeRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    const submittingButton = screen.getByRole("button", { name: "Sending..." });
    expect(submittingButton).toBeDisabled();
    fireEvent.click(submittingButton);

    expect(mocks.submitExampleContact).toHaveBeenCalledOnce();
    resolveSubmission?.();
    await screen.findByText("Thanks. We will be in touch soon.");
  });

  it("preserves recoverable input and does not emit analytics on failure", async () => {
    mocks.submitExampleContact.mockRejectedValue(new Error("Provider failed"));
    renderForm();
    completeRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(
      await screen.findByText(
        "We could not send your inquiry. Keep your details and try again.",
      ),
    ).toBeVisible();
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
    expect(mocks.capture).not.toHaveBeenCalled();
  });

  it("renders the Portuguese form copy", () => {
    renderForm("pt-BR");

    expect(
      screen.getByRole("heading", { name: "Fale sobre seu projeto" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Nome")).toBeVisible();
    expect(screen.getByRole("button", { name: "Enviar solicitação" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test and confirm the component/module failure**

Run:

```bash
npx vitest run app/components/domain/contact-form.test.tsx
```

Expected: FAIL because `contact-form.tsx` and `services.contact.*` translations do not exist.

- [ ] **Step 3: Extend the exhaustive Services translation schema**

Add this property to `ServicesTranslation` after `closing`:

```ts
  contact: {
    title: string;
    description: string;
    fields: {
      name: string;
      email: string;
      message: string;
    };
    submit: string;
    submitting: string;
    success: string;
    error: string;
    validation: {
      required: string;
      email: string;
    };
  };
```

Add this English value after `closing`:

```ts
    contact: {
      title: "Tell us about your project",
      description:
        "This example keeps form state, privacy, attribution, analytics, and the provider boundary visible in one small flow.",
      fields: {
        name: "Name",
        email: "Email",
        message: "Message",
      },
      submit: "Send inquiry",
      submitting: "Sending...",
      success: "Thanks. We will be in touch soon.",
      error:
        "We could not send your inquiry. Keep your details and try again.",
      validation: {
        required: "This field is required.",
        email: "Enter a valid email address.",
      },
    },
```

Add this Brazilian Portuguese value after `closing`:

```ts
    contact: {
      title: "Fale sobre seu projeto",
      description:
        "Este exemplo mantém estado do formulário, privacidade, atribuição, analytics e o limite do provedor visíveis em um fluxo pequeno.",
      fields: {
        name: "Nome",
        email: "E-mail",
        message: "Mensagem",
      },
      submit: "Enviar solicitação",
      submitting: "Enviando...",
      success: "Obrigado. Entraremos em contato em breve.",
      error:
        "Não foi possível enviar sua solicitação. Mantenha seus dados e tente novamente.",
      validation: {
        required: "Este campo é obrigatório.",
        email: "Informe um endereço de e-mail válido.",
      },
    },
```

- [ ] **Step 4: Implement the form with native controls and focused validation**

Create `app/components/domain/contact-form.tsx`:

```tsx
import { useState, type FormEvent } from "react";

import { useAnalytics } from "../../analytics/analytics";
import { useI18n } from "../../i18n/i18n";
import type { Translate } from "../../i18n/types";
import { submitExampleContact } from "../../integrations/example-contact/submit-example-contact";
import { Button } from "../ui/button";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { FormPrivacyNotice } from "./form-privacy-notice";

type ContactFields = {
  name: string;
  email: string;
  message: string;
};

type ContactField = keyof ContactFields;
type FieldErrors = Partial<Record<ContactField, string>>;
type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const emptyFields: ContactFields = { name: "", email: "", message: "" };
const inputClassName =
  "mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function validateContactFields(
  fields: ContactFields,
  translate: Translate,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.name.trim()) errors.name = translate("services.contact.validation.required");
  if (!fields.email.trim()) {
    errors.email = translate("services.contact.validation.required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = translate("services.contact.validation.email");
  }
  if (!fields.message.trim()) errors.message = translate("services.contact.validation.required");
  return errors;
}

export function ContactForm() {
  const { translate } = useI18n();
  const { attribution, capture } = useAnalytics();
  const [fields, setFields] = useState(emptyFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>("idle");

  function updateField(field: ContactField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const nextErrors = validateContactFields(fields, translate);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      await submitExampleContact({
        name: fields.name.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
        marketingOptIn,
        attribution,
      });
      capture({ eventName: "lead_submitted", formId: "services-contact" });
      setFields(emptyFields);
      setMarketingOptIn(false);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function errorFor(field: ContactField) {
    return errors[field] ? `contact-${field}-error` : undefined;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="max-w-xl">
        <Heading>{translate("services.contact.title")}</Heading>
        <Text className="mt-4" tone="muted">
          {translate("services.contact.description")}
        </Text>
      </div>
      <form className="flex max-w-xl flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <label>
          <Text as="span">{translate("services.contact.fields.name")}</Text>
          <input
            aria-describedby={errorFor("name")}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={inputClassName}
            name="name"
            value={fields.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          {errors.name ? <Text id="contact-name-error">{errors.name}</Text> : null}
        </label>
        <label>
          <Text as="span">{translate("services.contact.fields.email")}</Text>
          <input
            aria-describedby={errorFor("email")}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={inputClassName}
            name="email"
            type="email"
            value={fields.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          {errors.email ? <Text id="contact-email-error">{errors.email}</Text> : null}
        </label>
        <label>
          <Text as="span">{translate("services.contact.fields.message")}</Text>
          <textarea
            aria-describedby={errorFor("message")}
            aria-invalid={Boolean(errors.message)}
            className={inputClassName}
            name="message"
            rows={5}
            value={fields.message}
            onChange={(event) => updateField("message", event.target.value)}
          />
          {errors.message ? <Text id="contact-message-error">{errors.message}</Text> : null}
        </label>
        <FormPrivacyNotice
          marketingOptIn={marketingOptIn}
          onMarketingOptInChange={setMarketingOptIn}
        />
        <Button disabled={status === "submitting"} type="submit">
          {status === "submitting"
            ? translate("services.contact.submitting")
            : translate("services.contact.submit")}
        </Button>
        <div aria-live="polite">
          {status === "success" ? <Text>{translate("services.contact.success")}</Text> : null}
          {status === "error" ? <Text>{translate("services.contact.error")}</Text> : null}
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Run the focused component and integration tests**

Run:

```bash
npx vitest run app/components/domain/contact-form.test.tsx app/integrations/example-contact/submit-example-contact.test.ts
```

Expected: PASS. If formatting splits long JSX lines, run `npm run format` and rerun the test.

- [ ] **Step 6: Record the checkpoint**

Run `git diff --check`. If commits are explicitly authorized:

```bash
git add app/components/domain/contact-form.tsx app/components/domain/contact-form.test.tsx app/i18n/translations/services.ts
```

### Task 3: Services Route Composition

**Files:**
- Modify: `app/routes/$locale.services.tsx`
- Modify: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Add a failing localized-route assertion**

Add this test to the `localized route layout` describe block in `app/routes/$locale.test.tsx`:

```tsx
  it("renders the localized Services contact form", async () => {
    renderLocalizedRoute("/pt-BR/services");

    expect(
      await screen.findByRole("heading", { name: "Fale sobre seu projeto" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Nome")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Enviar solicitação" }),
    ).toBeVisible();
  });
```

- [ ] **Step 2: Run the route test and confirm the missing form failure**

Run:

```bash
npx vitest run 'app/routes/$locale.test.tsx' -t 'renders the localized Services contact form'
```

Expected: FAIL because the Services route does not render `ContactForm`.

- [ ] **Step 3: Compose the form without changing routing or SEO**

Add this import to `app/routes/$locale.services.tsx`:

```ts
import { ContactForm } from "../components/domain/contact-form";
```

Add this section after the existing closing `DividedSection`:

```tsx
      <DividedSection className="mt-16">
        <ContactForm />
      </DividedSection>
```

- [ ] **Step 4: Run route and form tests**

Run:

```bash
npx vitest run 'app/routes/$locale.test.tsx' app/components/domain/contact-form.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Record the checkpoint**

Run `git diff --check`. If commits are explicitly authorized:

```bash
git add 'app/routes/$locale.services.tsx' 'app/routes/$locale.test.tsx'
```

### Task 4: Browser-Level Consent Boundary

**Files:**
- Modify: `tests/e2e/privacy-consent.spec.ts`

- [ ] **Step 1: Add failing browser tests for consent-independent submission and consent-aware tracking**

Append these tests:

```ts
async function completeContactForm(page: Page) {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page
    .getByLabel("Message")
    .fill("I would like to discuss a static website.");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Thanks. We will be in touch soon.")).toBeVisible();
}

test("contact submission works without analytics consent and emits no lead event", async ({
  page,
}) => {
  await setStoredConsent(page, {
    version: CONSENT_VERSION,
    analytics: false,
    marketing: false,
    updatedAt: "2026-08-11T00:00:00.000Z",
  });
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/services?utm_source=newsletter&unknown=ignored");
  await completeContactForm(page);
  await settleBrowserEffects(page);
  await analytics.flush();

  expect(
    analytics.events.some((event) => event.eventName === "lead_submitted"),
  ).toBe(false);
});

test("contact submission emits lead_submitted after analytics consent", async ({
  page,
}) => {
  await setStoredConsent(page, {
    version: CONSENT_VERSION,
    analytics: true,
    marketing: false,
    updatedAt: "2026-08-11T00:00:00.000Z",
  });
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/services?utm_source=newsletter");
  await completeContactForm(page);

  await expect
    .poll(() =>
      analytics.events.some(
        (event) =>
          event.eventName === "lead_submitted" &&
          event.formId === "services-contact",
      ),
    )
    .toBe(true);
  await analytics.flush();
});
```

Move `completeContactForm` beside the other helper functions rather than leaving it between tests.

- [ ] **Step 2: Run the focused Playwright cases**

Run:

```bash
npx playwright test tests/e2e/privacy-consent.spec.ts --grep 'contact submission'
```

Expected: PASS after Tasks 1-3. If a browser reports a real accessibility or runtime error, fix the root cause in the form rather than weakening the fixture.

- [ ] **Step 3: Record the checkpoint**

Run `git diff --check`. If commits are explicitly authorized:

```bash
git add tests/e2e/privacy-consent.spec.ts
```

### Task 5: Phase 8 Verification And Architecture Review

**Files:**
- Modify only files required to fix verification or blocking architecture findings.

- [ ] **Step 1: Format the phase changes**

Run:

```bash
npm run format
```

Expected: Prettier completes successfully and touches only formatting-relevant files.

- [ ] **Step 2: Run deterministic validation**

Run:

```bash
npm run check
```

Expected: PASS for formatting, lint, type checking, coverage, build, and static validation.

- [ ] **Step 3: Run all browser tests**

Run:

```bash
npm run test:e2e
```

Expected: PASS with no unexpected `console.error` or `pageerror`.

- [ ] **Step 4: Run architecture review**

Dispatch the `architecture-review` subagent with the Phase 8 spec, ADRs 015-017, the phase diff, and successful validation output. Fix every high or medium finding, then rerun `npm run check` and `npm run test:e2e`.

- [ ] **Step 5: Inspect the final phase diff**

Run:

```bash
git status --short
```

Expected: only the approved Phase 8 files are changed, with no whitespace errors. Commit only if the user explicitly requests it.
