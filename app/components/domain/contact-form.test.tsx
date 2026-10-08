import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "../../i18n/i18n";
import { ContactForm } from "./contact-form";

const mocks = vi.hoisted(() => ({
  capture: vi.fn(),
  useAnalytics: vi.fn(),
  submitExampleContact: vi.fn(),
}));

vi.mock("../../analytics/analytics", () => ({
  useAnalytics: mocks.useAnalytics,
}));

vi.mock("../../integrations/example-contact/submit-example-contact", () => ({
  submitExampleContact: mocks.submitExampleContact,
}));

const attribution = {
  source: "newsletter",
  campaign: "phase-eight",
};

function renderForm(locale: "en" | "pt-BR" = "en") {
  return render(
    <I18nProvider locale={locale}>
      <ContactForm />
    </I18nProvider>,
  );
}

function fillEnglishFields() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: " Ada Lovelace " },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: " ada@example.com " },
  });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: " Please help with a production issue. " },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useAnalytics.mockReturnValue({
    capture: mocks.capture,
    attribution,
  });
  mocks.submitExampleContact.mockResolvedValue(undefined);
});

describe("ContactForm", () => {
  it("shows required errors and validates an invalid email before submitting", () => {
    renderForm();

    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Message")).toBeRequired();

    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );

    expect(screen.getAllByText("This field is required.")).toHaveLength(3);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Check the highlighted fields.",
    );
    expect(mocks.submitExampleContact).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );

    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(mocks.submitExampleContact).not.toHaveBeenCalled();
  });

  it("submits trimmed fields with attribution, captures the lead, and resets", async () => {
    renderForm();
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toBeEmptyDOMElement();
    fillEnglishFields();

    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );

    await waitFor(() =>
      expect(mocks.submitExampleContact).toHaveBeenCalledTimes(1),
    );
    expect(mocks.submitExampleContact).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Please help with a production issue.",
      marketingOptIn: false,
      attribution,
    });
    expect(mocks.capture.mock.calls).toEqual([
      [{ eventName: "lead_submitted", formId: "contact-form" }],
    ]);
    expect(liveRegion).toHaveTextContent(
      "Thanks. JOBE will reply by email to schedule your assessment.",
    );
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Message")).toHaveValue("");
    expect(
      screen.getByRole("checkbox", {
        name: "I would like to receive occasional updates and offers.",
      }),
    ).not.toBeChecked();
  });

  it("prevents duplicate provider calls while submission is pending", async () => {
    let resolveSubmission!: () => void;
    const pendingSubmission = new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    });
    mocks.submitExampleContact.mockReturnValueOnce(pendingSubmission);

    renderForm();
    fillEnglishFields();

    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Sending..." }));

    const button = screen.getByRole("button", { name: "Sending..." });
    expect(button).toBeDisabled();
    expect(mocks.submitExampleContact).toHaveBeenCalledTimes(1);

    resolveSubmission();
    await waitFor(() =>
      expect(
        screen.getByText(
          "Thanks. JOBE will reply by email to schedule your assessment.",
        ),
      ).toBeVisible(),
    );
  });

  it("clears a prior success message when a later submission fails validation", async () => {
    renderForm();
    fillEnglishFields();

    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );

    const liveRegion = screen.getByRole("status");
    await waitFor(() =>
      expect(liveRegion).toHaveTextContent(
        "Thanks. JOBE will reply by email to schedule your assessment.",
      ),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );

    expect(liveRegion).toHaveTextContent("Check the highlighted fields.");
    expect(screen.getAllByText("This field is required.")).toHaveLength(3);
  });

  it("preserves input and skips analytics when the provider rejects", async () => {
    mocks.submitExampleContact.mockRejectedValueOnce(
      new Error("Provider down"),
    );

    renderForm();
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toBeEmptyDOMElement();
    fillEnglishFields();

    fireEvent.click(
      screen.getByRole("button", { name: "Book the assessment" }),
    );

    await waitFor(() =>
      expect(liveRegion).toHaveTextContent(
        "We could not send your message. Keep your details and try again.",
      ),
    );
    expect(screen.getByLabelText("Name")).toHaveValue(" Ada Lovelace ");
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Message")).toHaveValue(
      " Please help with a production issue. ",
    );
    expect(mocks.capture).not.toHaveBeenCalled();
  });

  it("renders the Portuguese labels and submit action", () => {
    renderForm("pt-BR");

    expect(screen.getByLabelText("Nome")).toBeVisible();
    expect(screen.getByLabelText("E-mail")).toBeVisible();
    expect(screen.getByLabelText("Mensagem")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Agendar a avaliação" }),
    ).toBeVisible();
  });

  it("starts with the existing marketing opt-in unchecked", () => {
    renderForm();

    expect(
      screen.getByRole("checkbox", {
        name: "I would like to receive occasional updates and offers.",
      }),
    ).not.toBeChecked();
  });
});
