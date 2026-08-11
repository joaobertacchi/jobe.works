import { afterEach, describe, expect, it, vi } from "vitest";

import type { ConsentSnapshot } from "../consent/consent";
import { dispatchEvent, isTrackerEligible } from "./manager";
import type {
  AnalyticsCustomEvent,
  Tracker,
  TrackerRegistration,
} from "./types";

const ctaEvent: AnalyticsCustomEvent = {
  eventName: "cta_pressed",
  ctaId: "hero-cta",
  context: "homepage",
};

const consentWith: (overrides?: Partial<ConsentSnapshot>) => ConsentSnapshot = (
  overrides = {},
) => ({ analytics: false, marketing: false, ...overrides });

function registration(
  tracker: Tracker,
  consentCategory: TrackerRegistration["consentCategory"],
): TrackerRegistration {
  return { tracker, consentCategory };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTrackerEligible", () => {
  it("keeps necessary trackers enabled without optional consent", () => {
    expect(
      isTrackerEligible(registration(vi.fn(), "necessary"), consentWith()),
    ).toBe(true);
  });

  it("requires analytics consent for analytics trackers", () => {
    const tracker = registration(vi.fn(), "analytics");
    expect(isTrackerEligible(tracker, consentWith())).toBe(false);
    expect(isTrackerEligible(tracker, consentWith({ analytics: true }))).toBe(
      true,
    );
  });

  it("requires marketing consent for marketing trackers", () => {
    const tracker = registration(vi.fn(), "marketing");
    expect(isTrackerEligible(tracker, consentWith())).toBe(false);
    expect(isTrackerEligible(tracker, consentWith({ marketing: true }))).toBe(
      true,
    );
  });

  it("keeps analytics and marketing eligibility independent", () => {
    const analyticsTracker = registration(vi.fn(), "analytics");
    const marketingTracker = registration(vi.fn(), "marketing");
    const consent = consentWith({ analytics: true });

    expect(isTrackerEligible(analyticsTracker, consent)).toBe(true);
    expect(isTrackerEligible(marketingTracker, consent)).toBe(false);
  });
});

describe("dispatchEvent", () => {
  it("invokes eligible trackers with the event", async () => {
    const analyticsTracker = vi.fn();
    const trackers = [
      registration(analyticsTracker, "analytics"),
      registration(vi.fn(), "marketing"),
    ];

    await dispatchEvent(trackers, ctaEvent, consentWith({ analytics: true }));

    expect(analyticsTracker).toHaveBeenCalledWith(ctaEvent);
  });

  it("does not invoke trackers before their consent category is granted", async () => {
    const analyticsTracker = vi.fn();
    const marketingTracker = vi.fn();

    await dispatchEvent(
      [
        registration(analyticsTracker, "analytics"),
        registration(marketingTracker, "marketing"),
      ],
      ctaEvent,
      consentWith(),
    );

    expect(analyticsTracker).not.toHaveBeenCalled();
    expect(marketingTracker).not.toHaveBeenCalled();
  });

  it("keeps other trackers running when one tracker throws", async () => {
    const failingTracker = vi.fn(() => {
      throw new Error("Provider down");
    });
    const healthyTracker = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      dispatchEvent(
        [
          registration(failingTracker, "necessary"),
          registration(healthyTracker, "necessary"),
        ],
        ctaEvent,
        consentWith(),
      ),
    ).resolves.toBeUndefined();

    expect(healthyTracker).toHaveBeenCalledWith(ctaEvent);
  });

  it("keeps other trackers running when one tracker rejects", async () => {
    const failingTracker = vi.fn(() =>
      Promise.reject(new Error("Provider down")),
    );
    const healthyTracker = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await dispatchEvent(
      [
        registration(failingTracker, "necessary"),
        registration(healthyTracker, "necessary"),
      ],
      ctaEvent,
      consentWith(),
    );

    expect(healthyTracker).toHaveBeenCalledWith(ctaEvent);
  });
});
