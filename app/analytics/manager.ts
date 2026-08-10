import type { ConsentSnapshot } from "../consent/consent";
import type { AnalyticsCustomEvent, TrackerRegistration } from "./types";

export function isTrackerEligible(
  registration: TrackerRegistration,
  consent: ConsentSnapshot,
): boolean {
  switch (registration.consentCategory) {
    case "necessary":
      return true;
    case "analytics":
      return consent.analytics;
    case "marketing":
      return consent.marketing;
  }
}

export async function dispatchEvent(
  trackers: readonly TrackerRegistration[],
  event: AnalyticsCustomEvent,
  consent: ConsentSnapshot,
): Promise<void> {
  for (const registration of trackers) {
    if (!isTrackerEligible(registration, consent)) continue;
    try {
      await registration.tracker(event);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[analytics] tracker failed", error);
      }
    }
  }
}
