import type { Tracker } from "../types";

export const consoleTracker: Tracker = (event) => {
  console.debug("[analytics]", event);
};
