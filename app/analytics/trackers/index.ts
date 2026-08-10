import type { TrackerRegistration } from "../types";
import { consoleTracker } from "./console";

export const defaultTrackerRegistrations: readonly TrackerRegistration[] = [
  { tracker: consoleTracker, consentCategory: "analytics" },
];
