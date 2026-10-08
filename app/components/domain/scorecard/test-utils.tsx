import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { AnalyticsProvider } from "../../../analytics/analytics";
import type {
  AnalyticsCustomEvent,
  TrackerRegistration,
} from "../../../analytics/types";
import type { SupportedLocale } from "../../../i18n/config";
import { I18nProvider } from "../../../i18n/i18n";
import { Scorecard } from "./scorecard";

export function renderScorecard(locale: SupportedLocale = "en") {
  const events: AnalyticsCustomEvent[] = [];
  const trackers: TrackerRegistration[] = [
    {
      consentCategory: "analytics",
      tracker: (event) => {
        events.push(event);
      },
    },
  ];
  const router = createMemoryRouter(
    [
      {
        path: "/:locale/scorecard",
        element: (
          <I18nProvider locale={locale}>
            <AnalyticsProvider
              consent={{ analytics: true, marketing: true }}
              trackers={trackers}
            >
              <Scorecard advanceDelayMs={0} />
            </AnalyticsProvider>
          </I18nProvider>
        ),
      },
    ],
    { initialEntries: [`/${locale}/scorecard`] },
  );
  render(<RouterProvider router={router} />);

  return {
    scorecardEvents: () =>
      events.filter((event) => event.eventName.startsWith("scorecard_")),
  };
}
