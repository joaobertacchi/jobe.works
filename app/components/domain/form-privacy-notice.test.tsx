import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { I18nProvider } from "../../i18n/i18n";
import { FormPrivacyNotice } from "./form-privacy-notice";

function renderNotice(
  marketingOptIn = false,
  onMarketingOptInChange = vi.fn(),
) {
  return render(
    <I18nProvider locale="en">
      <FormPrivacyNotice
        marketingOptIn={marketingOptIn}
        onMarketingOptInChange={onMarketingOptInChange}
      />
    </I18nProvider>,
  );
}

describe("FormPrivacyNotice", () => {
  it("renders the contextual privacy notice", () => {
    renderNotice();

    expect(
      screen.getByText(
        "We use the information provided to respond to your inquiry. See the Privacy Notice for more information.",
      ),
    ).toBeVisible();
  });

  it("renders the marketing opt-in unchecked and never preselected", () => {
    renderNotice();

    expect(
      screen.getByRole("checkbox", {
        name: "I would like to receive occasional updates and offers.",
      }),
    ).not.toBeChecked();
  });

  it("reports opt-in changes to the caller", () => {
    const onChange = vi.fn();
    renderNotice(false, onChange);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders the Portuguese localization", () => {
    render(
      <I18nProvider locale="pt-BR">
        <FormPrivacyNotice
          marketingOptIn={false}
          onMarketingOptInChange={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Gostaria de receber atualizações e ofertas ocasionais.",
      }),
    ).not.toBeChecked();
    expect(
      screen.getByText(
        "Usamos as informações fornecidas para responder à sua solicitação. Consulte o Aviso de Privacidade para mais informações.",
      ),
    ).toBeVisible();
  });
});
