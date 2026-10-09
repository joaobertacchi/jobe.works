import type { AnalyticsCustomEvent, Tracker } from "./types";

declare const capture: (event: AnalyticsCustomEvent) => void;
declare const tracker: Tracker;

capture({ eventName: "page_view", pathname: "/en/about", locale: "en" });
capture({ eventName: "cta_pressed", ctaId: "hero-cta", context: "homepage" });
capture({ eventName: "lead_submitted", formId: "contact" });
capture({
  eventName: "lead_submit_failed",
  formId: "contact",
  reason: "validation",
});
capture({
  eventName: "contact_link_pressed",
  channel: "email",
  context: "footer",
});
capture({ eventName: "locale_switched", from: "en", to: "pt-BR" });
capture({
  eventName: "scorecard_step_answered",
  questionId: "q01",
  stepIndex: 0,
});
tracker({ eventName: "page_view", pathname: "/pt-BR/", locale: "pt-BR" });

// @ts-expect-error Unknown event names are rejected.
capture({ eventName: "purchase_completed" });

// @ts-expect-error Required event properties are enforced.
capture({ eventName: "cta_pressed" });

capture({
  eventName: "cta_pressed",
  ctaId: "hero-cta",
  context: "homepage",
  // @ts-expect-error Events reject properties from other events.
  formId: "contact",
});

// @ts-expect-error Property types are validated.
capture({ eventName: "cta_pressed", ctaId: 42, context: "homepage" });

// @ts-expect-error Page views require a supported locale.
capture({ eventName: "page_view", pathname: "/en/", locale: "fr" });

// @ts-expect-error Trackers only receive domain events.
tracker({ eventName: "custom", payload: 1 });

capture({ eventName: "scorecard_started" });
capture({
  eventName: "scorecard_completed",
  verdict: "needsAttention",
  band: "strong",
  criticalRiskCount: 1,
  unknownCount: 0,
});

capture({
  eventName: "scorecard_completed",
  // @ts-expect-error Verdicts are limited to the scoring vocabulary.
  verdict: "great",
  band: "strong",
  criticalRiskCount: 0,
  unknownCount: 0,
});

capture({
  eventName: "scorecard_completed",
  verdict: "strong",
  band: "strong",
  criticalRiskCount: 0,
  unknownCount: 0,
  // @ts-expect-error Individual answers are never sent to analytics.
  answers: { q01: "yes" },
});

capture({
  eventName: "lead_submit_failed",
  formId: "contact",
  // @ts-expect-error Failure reasons are a closed set.
  reason: "timeout",
});

capture({
  eventName: "scorecard_step_answered",
  // @ts-expect-error Scorecard steps reference known question ids.
  questionId: "q99",
  stepIndex: 0,
});
