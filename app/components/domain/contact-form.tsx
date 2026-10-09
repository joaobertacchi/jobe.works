import { useState, type FormEvent } from "react";

import { useAnalytics } from "../../analytics/analytics";
import { submitExampleContact } from "../../integrations/example-contact/submit-example-contact";
import { useI18n } from "../../i18n/i18n";
import { FormPrivacyNotice } from "./form-privacy-notice";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

type ContactFields = {
  name: string;
  email: string;
  message: string;
};

type ContactFieldName = keyof ContactFields;
type ContactErrors = Partial<Record<ContactFieldName, string>>;
type ContactStatus = "idle" | "submitting" | "success" | "error" | "validation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fieldClassName =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function createInitialFields(): ContactFields {
  return { name: "", email: "", message: "" };
}

function validateFields(
  fields: ContactFields,
  messages: { required: string; email: string },
): ContactErrors {
  const errors: ContactErrors = {};

  if (!fields.name.trim()) errors.name = messages.required;
  if (!fields.email.trim()) {
    errors.email = messages.required;
  } else if (!emailPattern.test(fields.email.trim())) {
    errors.email = messages.email;
  }
  if (!fields.message.trim()) errors.message = messages.required;

  return errors;
}

export function ContactForm() {
  const { capture, attribution } = useAnalytics();
  const { translate } = useI18n();
  const [fields, setFields] = useState<ContactFields>(createInitialFields);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<ContactStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("idle");

    const validationErrors = validateFields(fields, {
      required: translate("contact.validation.required"),
      email: translate("contact.validation.email"),
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      capture({
        eventName: "lead_submit_failed",
        formId: "contact-form",
        reason: "validation",
      });
      setStatus("validation");
      return;
    }

    setStatus("submitting");
    try {
      await submitExampleContact({
        name: fields.name.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
        marketingOptIn,
        attribution,
      });
      capture({ eventName: "lead_submitted", formId: "contact-form" });
      setFields(createInitialFields());
      setMarketingOptIn(false);
      setStatus("success");
    } catch {
      capture({
        eventName: "lead_submit_failed",
        formId: "contact-form",
        reason: "error",
      });
      setStatus("error");
    }
  }

  const statusMessages: Partial<Record<ContactStatus, string>> = {
    validation: translate("contact.validation.summary"),
    success: translate("contact.success"),
    error: translate("contact.error"),
  };
  const statusMessage = statusMessages[status] ?? null;

  return (
    <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="font-medium" htmlFor="contact-name">
          {translate("contact.fields.name")}
        </label>
        <input
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          className={fieldClassName}
          id="contact-name"
          name="name"
          onChange={(event) =>
            setFields((current) => ({ ...current, name: event.target.value }))
          }
          required
          type="text"
          value={fields.name}
        />
        {errors.name ? (
          <Text className="text-sm" id="contact-name-error">
            {errors.name}
          </Text>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium" htmlFor="contact-email">
          {translate("contact.fields.email")}
        </label>
        <input
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className={fieldClassName}
          id="contact-email"
          name="email"
          onChange={(event) =>
            setFields((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          required
          type="email"
          value={fields.email}
        />
        {errors.email ? (
          <Text className="text-sm" id="contact-email-error">
            {errors.email}
          </Text>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium" htmlFor="contact-message">
          {translate("contact.fields.message")}
        </label>
        <textarea
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          aria-invalid={Boolean(errors.message)}
          className={fieldClassName}
          id="contact-message"
          name="message"
          onChange={(event) =>
            setFields((current) => ({
              ...current,
              message: event.target.value,
            }))
          }
          placeholder={translate("contact.messagePlaceholder")}
          required
          rows={5}
          value={fields.message}
        />
        {errors.message ? (
          <Text className="text-sm" id="contact-message-error">
            {errors.message}
          </Text>
        ) : null}
      </div>

      <FormPrivacyNotice
        marketingOptIn={marketingOptIn}
        onMarketingOptInChange={setMarketingOptIn}
      />
      <Button disabled={status === "submitting"} type="submit">
        {status === "submitting"
          ? translate("contact.submitting")
          : translate("contact.submit")}
      </Button>
      <Text aria-live="polite" role="status">
        {statusMessage}
      </Text>
    </form>
  );
}
