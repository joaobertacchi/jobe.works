import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SupportedLocale } from "../../i18n/config";
import { ConsentProvider, useConsent } from "../../consent/consent-context";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "../../consent/consent";
import { ConsentBanner } from "./consent-banner";

function SettingsOpener() {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings}>
      Open settings
    </button>
  );
}

function AcceptAllTrigger() {
  const { acceptAll } = useConsent();
  return (
    <button type="button" onClick={acceptAll}>
      Accept all while open
    </button>
  );
}

function renderBanner(
  locale: SupportedLocale = "en",
  withSettingsOpener = false,
) {
  return render(
    <ConsentProvider>
      <ConsentBanner locale={locale} />
      {withSettingsOpener ? <SettingsOpener /> : null}
    </ConsentProvider>,
  );
}

function storedConsent() {
  return JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null");
}

afterEach(() => {
  window.localStorage.clear();
  delete (HTMLDialogElement.prototype as { showModal?: unknown }).showModal;
});

describe("ConsentBanner", () => {
  it("renders a localized banner with comparable actions before a decision", () => {
    renderBanner("en");

    expect(
      screen.getByRole("region", { name: "Cookie preferences" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Accept all" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Reject non-essential" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Customize" })).toBeVisible();
  });

  it("renders the Portuguese banner in the pt-BR locale", () => {
    renderBanner("pt-BR");

    expect(
      screen.getByRole("region", { name: "Preferências de cookies" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Aceitar tudo" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Recusar não essenciais" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Personalizar" })).toBeVisible();
  });

  it("renders nothing when the locale is unknown", () => {
    render(
      <ConsentProvider>
        <ConsentBanner locale={null} />
      </ConsentProvider>,
    );

    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("accept all persists consent and hides the banner", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));

    expect(storedConsent()).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
    });
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("reject non-essential persists optional categories disabled", () => {
    renderBanner("en");

    fireEvent.click(
      screen.getByRole("button", { name: "Reject non-essential" }),
    );

    expect(storedConsent()).toMatchObject({
      analytics: false,
      marketing: false,
    });
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("customize opens the dialog with the current choices", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    const dialog = screen.getByRole("dialog", { name: "Cookie settings" });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Necessary" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Necessary" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Analytics" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Marketing" }),
    ).not.toBeChecked();
  });

  it("saving custom preferences persists them and closes the dialog", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Analytics" }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(storedConsent()).toMatchObject({
      analytics: true,
      marketing: false,
    });
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("cancel closes the dialog without persisting a choice", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Marketing" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
    expect(
      screen.getByRole("region", { name: "Cookie preferences" }),
    ).toBeVisible();
  });

  it("escape closes the dialog without persisting", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Cookie settings" }), {
      key: "Escape",
    });

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
  });

  it("reopens the dialog with stored choices after a decision", () => {
    renderBanner("en", true);

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    const dialog = screen.getByRole("dialog", { name: "Cookie settings" });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Analytics" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Marketing" })).toBeChecked();
  });

  it("restores stored choices when the dialog is reopened after cancel", () => {
    renderBanner("en", true);

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Marketing" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    expect(screen.getByRole("checkbox", { name: "Marketing" })).toBeChecked();
  });

  it("focuses the first optional toggle when the dialog opens", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    expect(screen.getByRole("checkbox", { name: "Analytics" })).toHaveFocus();
  });

  it("closes the dialog when clicking outside the content", () => {
    renderBanner("en");

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("dialog", { name: "Cookie settings" }));

    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
  });

  it("does not rerun the modal open sequence when consent changes while the dialog is open", () => {
    const showModal = vi
      .fn()
      .mockImplementationOnce(function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      })
      .mockImplementation(() => {
        throw new DOMException(
          "The dialog is already open.",
          "InvalidStateError",
        );
      });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: showModal,
    });

    render(
      <ConsentProvider>
        <ConsentBanner locale="en" />
        <AcceptAllTrigger />
      </ConsentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    expect(showModal).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Accept all while open" }),
    );

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("dialog", { name: "Cookie settings" }),
    ).toBeVisible();
  });
});
