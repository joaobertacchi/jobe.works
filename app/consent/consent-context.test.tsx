import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./consent";
import { ConsentProvider, useConsent } from "./consent-context";

function Probe() {
  const {
    consent,
    bannerVisible,
    acceptAll,
    rejectNonEssential,
    updatePreferences,
  } = useConsent();
  return (
    <div>
      <span data-testid="analytics">{String(consent.analytics)}</span>
      <span data-testid="marketing">{String(consent.marketing)}</span>
      <span data-testid="banner-visible">{String(bannerVisible)}</span>
      <button onClick={acceptAll}>Accept</button>
      <button onClick={rejectNonEssential}>Reject</button>
      <button
        onClick={() => updatePreferences({ analytics: true, marketing: false })}
      >
        Custom
      </button>
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
  it("starts unresolved with optional categories disabled before the consent check completes", () => {
    renderProbe();

    expect(screen.getByTestId("banner-visible")).toHaveTextContent("false");
    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
  });

  it("defaults to no decision with optional categories disabled", async () => {
    renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId("banner-visible")).toHaveTextContent("true"),
    );
    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
  });

  it("accept all enables both optional categories and persists", async () => {
    renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId("banner-visible")).toHaveTextContent("true"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    expect(screen.getByTestId("marketing")).toHaveTextContent("true");
    expect(screen.getByTestId("banner-visible")).toHaveTextContent("false");
    const persisted = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    expect(persisted).toMatchObject({
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
    });
  });

  it("reject non-essential persists both optional categories disabled", async () => {
    renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId("banner-visible")).toHaveTextContent("true"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("banner-visible")).toHaveTextContent("false");
    const persisted = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    expect(persisted).toMatchObject({
      version: CONSENT_VERSION,
      analytics: false,
      marketing: false,
    });
  });

  it("update preferences persists exactly the supplied categories", async () => {
    renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId("banner-visible")).toHaveTextContent("true"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Custom" }));

    expect(screen.getByTestId("analytics")).toHaveTextContent("true");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
    expect(screen.getByTestId("banner-visible")).toHaveTextContent("false");
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
    expect(screen.getByTestId("banner-visible")).toHaveTextContent("false");
  });

  it("treats a stored consent from an older version as unresolved", async () => {
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

    await waitFor(() =>
      expect(screen.getByTestId("banner-visible")).toHaveTextContent("true"),
    );
    expect(screen.getByTestId("analytics")).toHaveTextContent("false");
    expect(screen.getByTestId("marketing")).toHaveTextContent("false");
  });
});
