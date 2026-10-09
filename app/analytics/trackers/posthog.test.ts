import type { CaptureResult } from "posthog-js";
import { describe, expect, it, vi } from "vitest";

import type { AnalyticsCustomEvent } from "../types";
import {
  DEFAULT_POSTHOG_HOST,
  createPostHogConfig,
  createPostHogRegistration,
  sanitizeCaptureResult,
  sanitizeUrl,
  toPostHogEvent,
  type PostHogClient,
} from "./posthog";
import { createTrackerRegistrations } from ".";
import { consoleTracker } from "./console";

const pageView: AnalyticsCustomEvent = {
  eventName: "page_view",
  pathname: "/en/about",
  locale: "en",
};

function fakeClient(optedOut = false) {
  let isOptedOut = optedOut;
  const client = {
    init: vi.fn(),
    capture: vi.fn(),
    has_opted_out_capturing: vi.fn(() => isOptedOut),
    opt_in_capturing: vi.fn(() => {
      isOptedOut = false;
    }),
    opt_out_capturing: vi.fn(() => {
      isOptedOut = true;
    }),
  };
  return client as typeof client & PostHogClient;
}

describe("toPostHogEvent", () => {
  it("maps page views to $pageview with the locale only", () => {
    expect(toPostHogEvent(pageView)).toEqual({
      name: "$pageview",
      properties: { locale: "en" },
    });
  });

  it("keeps internal event names and snake-cases properties", () => {
    expect(
      toPostHogEvent({
        eventName: "scorecard_completed",
        verdict: "strong",
        band: "strong",
        criticalRiskCount: 0,
        unknownCount: 2,
      }),
    ).toEqual({
      name: "scorecard_completed",
      properties: {
        verdict: "strong",
        band: "strong",
        critical_risk_count: 0,
        unknown_count: 2,
      },
    });
  });
});

describe("sanitizeUrl", () => {
  it("keeps only allowlisted campaign parameters and drops the fragment", () => {
    expect(
      sanitizeUrl(
        "https://jobe.works/en/scorecard?utm_source=li&token=secret&email=a%40b.c#r=1.yy",
      ),
    ).toBe("https://jobe.works/en/scorecard?utm_source=li");
  });

  it("drops utm-prefixed parameters outside the allowlist", () => {
    expect(
      sanitizeUrl(
        "https://jobe.works/en/?utm_email=a%40b.c&utm_id=7&fbclid=x&utm_medium=social",
      ),
    ).toBe("https://jobe.works/en/?utm_id=7&utm_medium=social");
  });

  it("returns non-URL values unchanged", () => {
    expect(sanitizeUrl("$direct")).toBe("$direct");
  });
});

describe("sanitizeCaptureResult", () => {
  it("sanitizes URL-like properties in properties, $set, and $set_once", () => {
    const result = {
      uuid: "1",
      event: "$pageview",
      properties: {
        $current_url: "https://jobe.works/en/?gclid=abc",
        $referrer: "https://example.com/path?q=private",
        locale: "en",
      },
      $set: { $current_url: "https://jobe.works/en/?x=1" },
      $set_once: { $initial_referrer: "https://example.com/?y=2" },
    } satisfies CaptureResult;

    expect(sanitizeCaptureResult(result)).toEqual({
      ...result,
      properties: {
        $current_url: "https://jobe.works/en/",
        $referrer: "https://example.com/path",
        locale: "en",
      },
      $set: { $current_url: "https://jobe.works/en/" },
      $set_once: { $initial_referrer: "https://example.com/" },
    });
  });

  it("removes click IDs and non-allowlisted campaign properties in any form", () => {
    const result = {
      uuid: "1",
      event: "$pageview",
      properties: {
        $session_entry_gclid: "abc",
        $session_entry_fbclid: "def",
        $session_entry_gad_source: "1",
        $session_entry_utm_source: "linkedin",
        $session_entry_utm_email: "a@b.c",
        $session_entry_pathname: "/en/",
        gclid: "abc",
        utm_campaign: "launch",
      },
      $set_once: { $initial_msclkid: "x", $initial_utm_medium: "social" },
    } satisfies CaptureResult;

    expect(sanitizeCaptureResult(result)).toEqual({
      ...result,
      properties: {
        $session_entry_utm_source: "linkedin",
        $session_entry_pathname: "/en/",
        utm_campaign: "launch",
      },
      $set_once: { $initial_utm_medium: "social" },
    });
  });

  it("passes dropped events through", () => {
    expect(sanitizeCaptureResult(null)).toBeNull();
  });
});

describe("createPostHogConfig", () => {
  it("captures only explicit typed events", () => {
    expect(createPostHogConfig(DEFAULT_POSTHOG_HOST)).toMatchObject({
      api_host: "https://us.i.posthog.com",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_external_dependency_loading: true,
      save_campaign_params: false,
      before_send: sanitizeCaptureResult,
    });
  });
});

describe("createPostHogRegistration", () => {
  it("requires analytics consent", () => {
    expect(
      createPostHogRegistration({ apiKey: "phc_test" }).consentCategory,
    ).toBe("analytics");
  });

  it("loads and initializes the SDK once, on the first event", async () => {
    const client = fakeClient();
    const load = vi.fn(async () => client);
    const registration = createPostHogRegistration({
      apiKey: "phc_test",
      apiHost: "https://eu.i.posthog.com",
      load,
    });

    expect(load).not.toHaveBeenCalled();

    await registration.tracker(pageView);
    await registration.tracker({ eventName: "scorecard_started" });

    expect(load).toHaveBeenCalledTimes(1);
    expect(client.init).toHaveBeenCalledTimes(1);
    expect(client.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ api_host: "https://eu.i.posthog.com" }),
    );
    expect(client.capture.mock.calls).toEqual([
      ["$pageview", { locale: "en" }],
      ["scorecard_started", {}],
    ]);
    expect(client.opt_in_capturing).not.toHaveBeenCalled();
  });

  it("attaches only allowlisted landing campaign parameters to events", async () => {
    const client = fakeClient();
    const registration = createPostHogRegistration({
      apiKey: "phc_test",
      landingSearch:
        "?utm_source=linkedin&utm_campaign=launch&utm_email=a%40b.c&gclid=1&fbclid=2",
      load: async () => client,
    });

    await registration.tracker({
      eventName: "cta_pressed",
      ctaId: "hero",
      context: "homepage",
    });

    expect(client.capture).toHaveBeenCalledWith("cta_pressed", {
      utm_source: "linkedin",
      utm_campaign: "launch",
      cta_id: "hero",
      context: "homepage",
    });
  });

  it("does nothing on consent changes before the SDK loads", () => {
    const load = vi.fn(async () => fakeClient());
    const registration = createPostHogRegistration({
      apiKey: "phc_test",
      load,
    });

    registration.onConsentChange?.(false);
    registration.onConsentChange?.(true);

    expect(load).not.toHaveBeenCalled();
  });

  it("opts out on withdrawal and back in silently on the next eligible event", async () => {
    const client = fakeClient();
    const registration = createPostHogRegistration({
      apiKey: "phc_test",
      load: async () => client,
    });
    await registration.tracker(pageView);

    registration.onConsentChange?.(false);
    await vi.waitFor(() =>
      expect(client.opt_out_capturing).toHaveBeenCalledTimes(1),
    );

    registration.onConsentChange?.(true);
    expect(client.opt_in_capturing).not.toHaveBeenCalled();

    await registration.tracker(pageView);
    expect(client.opt_in_capturing).toHaveBeenCalledWith({
      captureEventName: false,
    });
    expect(client.capture).toHaveBeenCalledTimes(2);
  });

  it("opts back in when a previous visit persisted an opt-out", async () => {
    const client = fakeClient(true);
    const registration = createPostHogRegistration({
      apiKey: "phc_test",
      load: async () => client,
    });

    await registration.tracker(pageView);

    expect(client.opt_in_capturing).toHaveBeenCalledTimes(1);
    expect(client.capture).toHaveBeenCalledTimes(1);
  });

  it("retries loading after a failed SDK download", async () => {
    const client = fakeClient();
    const load = vi
      .fn<() => Promise<PostHogClient>>()
      .mockRejectedValueOnce(new Error("blocked"))
      .mockResolvedValueOnce(client);
    const registration = createPostHogRegistration({
      apiKey: "phc_test",
      load,
    });

    await expect(registration.tracker(pageView)).rejects.toThrow("blocked");
    registration.onConsentChange?.(false);
    await registration.tracker(pageView);

    expect(load).toHaveBeenCalledTimes(2);
    expect(client.capture).toHaveBeenCalledTimes(1);
  });
});

describe("createTrackerRegistrations", () => {
  it("registers only the console tracker without a PostHog key", () => {
    expect(createTrackerRegistrations({})).toEqual([
      { tracker: consoleTracker, consentCategory: "analytics" },
    ]);
    expect(createTrackerRegistrations({ VITE_POSTHOG_KEY: "  " })).toHaveLength(
      1,
    );
  });

  it("registers PostHog as an analytics tracker when a key is configured", () => {
    const registrations = createTrackerRegistrations({
      VITE_POSTHOG_KEY: "phc_test",
    });

    expect(registrations).toHaveLength(2);
    expect(registrations[1]).toMatchObject({
      consentCategory: "analytics",
      onConsentChange: expect.any(Function),
    });
  });
});
