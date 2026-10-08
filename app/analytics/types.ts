import type { ConsentCategory } from "../consent/consent";
import type { SupportedLocale } from "../i18n/config";
import type { Band, Verdict } from "../scorecard/scoring";

export type PageViewEvent = {
  eventName: "page_view";
  pathname: string;
  locale: SupportedLocale;
};

export type CtaPressedEvent = {
  eventName: "cta_pressed";
  ctaId: string;
  context: string;
};

export type LeadSubmittedEvent = {
  eventName: "lead_submitted";
  formId: string;
};

export type ScorecardStartedEvent = {
  eventName: "scorecard_started";
};

export type ScorecardCompletedEvent = {
  eventName: "scorecard_completed";
  verdict: Verdict;
  band: Band;
  criticalRiskCount: number;
  unknownCount: number;
};

export type AnalyticsCustomEvent =
  | PageViewEvent
  | CtaPressedEvent
  | LeadSubmittedEvent
  | ScorecardStartedEvent
  | ScorecardCompletedEvent;

export type Tracker = (event: AnalyticsCustomEvent) => void | Promise<void>;

export type TrackerRegistration = {
  tracker: Tracker;
  consentCategory: ConsentCategory;
};
