import type { AnalyticsCustomEvent, Tracker } from "./types";

declare const capture: (event: AnalyticsCustomEvent) => void;
declare const tracker: Tracker;

capture({ eventName: "page_view", pathname: "/en/about", locale: "en" });
capture({ eventName: "cta_pressed", ctaId: "hero-cta", context: "homepage" });
capture({ eventName: "lead_submitted", formId: "contact" });
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
