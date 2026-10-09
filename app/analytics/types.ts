import type { ConsentCategory } from "../consent/consent";
import type { SupportedLocale } from "../i18n/config";
import type { QuestionId } from "../scorecard/questions";
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

export type LeadSubmitFailedEvent = {
  eventName: "lead_submit_failed";
  formId: string;
  reason: "validation" | "error";
};

export type ContactLinkPressedEvent = {
  eventName: "contact_link_pressed";
  channel: "email";
  context: string;
};

export type LocaleSwitchedEvent = {
  eventName: "locale_switched";
  from: SupportedLocale;
  to: SupportedLocale;
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

export type ScorecardStepAnsweredEvent = {
  eventName: "scorecard_step_answered";
  questionId: QuestionId;
  stepIndex: number;
};

export type AnalyticsCustomEvent =
  | PageViewEvent
  | CtaPressedEvent
  | LeadSubmittedEvent
  | LeadSubmitFailedEvent
  | ContactLinkPressedEvent
  | LocaleSwitchedEvent
  | ScorecardStartedEvent
  | ScorecardStepAnsweredEvent
  | ScorecardCompletedEvent;

export type Tracker = (event: AnalyticsCustomEvent) => void | Promise<void>;

export type TrackerRegistration = {
  tracker: Tracker;
  consentCategory: ConsentCategory;
  /** Lets SDK-backed trackers stop vendor-side capture when consent is withdrawn. */
  onConsentChange?: (granted: boolean) => void;
};
