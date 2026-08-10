import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./consent";
import { ConsentProvider, useConsent } from "./consent-context";

function Probe() {
  const {
    consent,
    hasConsentDecision,
    acceptAll,
    rejectNonEssential,
    updatePreferences,
    settingsOpen,
    openSettings,
    closeSettings,
  } = useConsent();
  return (
    <div>
      <span data-testid="analytics">{String(consent.analytics)}</span>
      <span data-testid="marketing">{String(consent.marketing)}</span>
      <span data-testid="decision">{String(hasConsentDecision)}</span>
      <span data-testid="settings-open">{String(settingsOpen)}</span>
      <button onClick={acceptAll}>Accept</button>
      <button onClick={rejectNonEssential}>Reject</button>
      <button
        onClick={() => updatePreferences({ analytics: true, marketing: false })}
      >
        Custom
      </button>
      <button onClick={openSettings}>Open</button>
      <button onClick={closeSettings}>Close</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <ConsentProvider>
      <Probe />
    </ConsentProvider>,
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe("ConsentProvider", () => {
  it("defaults to no decision with optional categories disabled", () => {
    renderProbe();

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("false");
    expect(screen.getByTestId("settings-open")).toHaveTextContent("false");
  });

  it("accept all enables both optional categories and persists", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    expect(screen.getByTestId("marketing")).toHaveTextContent("true");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
    const persisted = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    expect(persisted).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
    });
  });

  it("reject non-essential persists both optional categories disabled", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
    const persisted = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    expect(persisted).toMatchObject({
      version: CONSENT_VERSION,
      analytics: false,
      marketing: false,
    });
  });

  it("update preferences persists exactly the supplied categories", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Custom" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
  });

  it("loads a stored decision shortly after mount", async () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        analytics: true,
        marketing: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    renderProbe();

    await waitFor(() => {
      expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("true");
  });

  it("treats a stored consent from an older version as unresolved", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        analytics: true,
        marketing: true,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    renderProbe();

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("decision")).toHaveTextContent("false");
  });

  it("treats malformed stored records as unresolved", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: CONSENT_VERSION, analytics: "yes" }),
    );

    renderProbe();

    expect(screen.getByTestId("decision")).toHaveTextContent("false");
  });

  it("treats unparsable stored records as unresolved", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "{not json");

    renderProbe();

    expect(screen.getByTestId("decision")).toHaveTextContent("false");
  });

  it("exposes settings dialog state", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByTestId("settings-open")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("settings-open")).toHaveTextContent("false");
  });
});
