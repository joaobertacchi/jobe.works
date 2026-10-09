import type { TrackerRegistration } from "../types";
import { consoleTracker } from "./console";
import { createPostHogRegistration } from "./posthog";

type TrackerEnvironment = {
  VITE_POSTHOG_KEY?: string;
  VITE_POSTHOG_HOST?: string;
};

export function createTrackerRegistrations(
  env: TrackerEnvironment,
): readonly TrackerRegistration[] {
  const registrations: TrackerRegistration[] = [
    { tracker: consoleTracker, consentCategory: "analytics" },
  ];
  const posthogKey = env.VITE_POSTHOG_KEY?.trim();
  if (posthogKey) {
    registrations.push(
      createPostHogRegistration({
        apiKey: posthogKey,
        apiHost: env.VITE_POSTHOG_HOST?.trim() || undefined,
      }),
    );
  }
  return registrations;
}

export const defaultTrackerRegistrations = createTrackerRegistrations(
  import.meta.env,
);
