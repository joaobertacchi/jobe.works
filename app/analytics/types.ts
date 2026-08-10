import type { ConsentCategory } from "../consent/consent";
import type { SupportedLocale } from "../i18n/config";

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

export type AnalyticsCustomEvent =
  PageViewEvent | CtaPressedEvent | LeadSubmittedEvent;

export type Tracker = (event: AnalyticsCustomEvent) => void | Promise<void>;

export type TrackerRegistration = {
  tracker: Tracker;
  consentCategory: ConsentCategory;
};
