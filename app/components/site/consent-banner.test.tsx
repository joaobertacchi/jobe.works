import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import type { SupportedLocale } from "../../i18n/config";
import { ConsentProvider, useConsent } from "../../consent/consent-context";
import { CONSENT_STORAGE_KEY } from "../../consent/consent";
import { ConsentBanner } from "./consent-banner";

function SettingsOpener() {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings}>
      Open settings
    </button>
  );
}

function renderBanner(
  locale: SupportedLocale = "en",
  withSettingsOpener = false,
) {
  return render(
    <MemoryRouter>
      <ConsentProvider>
        <ConsentBanner locale={locale} />
        {withSettingsOpener ? <SettingsOpener /> : null}
      </ConsentProvider>
    </MemoryRouter>,
  );
}

function storedConsent() {
  return JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null");
}

afterEach(() => {
  window.localStorage.clear();
});

describe("ConsentBanner", () => {
  it("does not render the banner before the consent check completes", () => {
    renderBanner("en");

    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("renders a localized banner with comparable actions before a decision", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    expect(screen.getByRole("button", { name: "Accept all" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Reject non-essential" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Customize" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/en/privacy",
    );
  });

  it("renders the Portuguese banner in the pt-BR locale", async () => {
    renderBanner("pt-BR");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Preferências de cookies" }),
      ).toBeVisible(),
    );
    expect(screen.getByRole("button", { name: "Aceitar tudo" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Recusar não essenciais" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Personalizar" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Privacidade" })).toHaveAttribute(
      "href",
      "/pt-BR/privacy",
    );
  });

  it("renders nothing when the locale is unknown", async () => {
    render(
      <ConsentProvider>
        <ConsentBanner locale={null} />
      </ConsentProvider>,
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Cookie preferences" }),
      ).toBeNull(),
    );
    expect(
      screen.queryByRole("region", { name: "Cookie preferences" }),
    ).toBeNull();
  });

  it("dismisses the banner and persists rejected consent", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reject non-essential" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "Cookie preferences" }),
      ).toBeNull();
      expect(storedConsent()).toMatchObject({
        analytics: false,
        marketing: false,
      });
    });
  });

  it("customize opens the dialog with the current choices", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
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

  it("saving custom preferences persists them and closes the dialog", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
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

  it("cancel closes the dialog without persisting a choice", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
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

  it("escape closes the dialog without persisting", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Cookie settings" }), {
      key: "Escape",
    });

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
  });

  it("reopens the dialog with stored choices after a decision", async () => {
    renderBanner("en", true);

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    const dialog = screen.getByRole("dialog", { name: "Cookie settings" });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Analytics" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Marketing" })).toBeChecked();
  });

  it("restores stored choices when the dialog is reopened after cancel", async () => {
    renderBanner("en", true);

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Marketing" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    expect(screen.getByRole("checkbox", { name: "Marketing" })).toBeChecked();
  });

  it("focuses the first optional toggle when the dialog opens", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    expect(screen.getByRole("checkbox", { name: "Analytics" })).toHaveFocus();
  });

  it("closes the dialog when clicking outside the content", async () => {
    renderBanner("en");

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("dialog", { name: "Cookie settings" }));

    expect(
      screen.queryByRole("dialog", { name: "Cookie settings" }),
    ).toBeNull();
  });
});
