import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";

import type { ConsentSnapshot } from "../consent/consent";
import { defaultLocale, getLocaleFromPathname } from "../i18n/config";
import {
  parseCampaignAttribution,
  type CampaignAttribution,
} from "./attribution";
import { dispatchEvent, isTrackerEligible } from "./manager";
import { defaultTrackerRegistrations } from "./trackers";
import type { AnalyticsCustomEvent, TrackerRegistration } from "./types";

type AnalyticsValue = {
  capture: (event: AnalyticsCustomEvent) => void;
  attribution: CampaignAttribution;
};

const AnalyticsContext = createContext<AnalyticsValue | null>(null);

export function AnalyticsProvider({
  children,
  consent,
  trackers = defaultTrackerRegistrations,
}: {
  children: ReactNode;
  consent: ConsentSnapshot;
  trackers?: readonly TrackerRegistration[];
}) {
  const { pathname } = useLocation();
  const [attribution] = useState(() => {
    const search = typeof window === "undefined" ? "" : window.location.search;
    return parseCampaignAttribution(new URLSearchParams(search));
  });

  const currentConsent = useRef(consent);
  const currentTrackers = useRef(trackers);

  useLayoutEffect(() => {
    currentConsent.current = consent;
    currentTrackers.current = trackers;
  });

  const capture = useCallback((event: AnalyticsCustomEvent) => {
    void dispatchEvent(currentTrackers.current, event, currentConsent.current);
  }, []);

  useEffect(() => {
    for (const registration of trackers) {
      registration.onConsentChange?.(isTrackerEligible(registration, consent));
    }
  }, [consent, trackers]);

  const analyticsEligible = consent.analytics;
  const marketingEligible = consent.marketing;
  const wasAnalyticsEligible = useRef(analyticsEligible);
  const wasMarketingEligible = useRef(marketingEligible);
  const lastDispatchedPathname = useRef<string | null>(null);

  useEffect(() => {
    const analyticsBecameEligible =
      analyticsEligible && !wasAnalyticsEligible.current;
    const marketingBecameEligible =
      marketingEligible && !wasMarketingEligible.current;
    const candidateTrackers =
      pathname !== lastDispatchedPathname.current
        ? trackers
        : trackers.filter(
            ({ consentCategory }) =>
              (analyticsBecameEligible && consentCategory === "analytics") ||
              (marketingBecameEligible && consentCategory === "marketing"),
          );
    wasAnalyticsEligible.current = analyticsEligible;
    wasMarketingEligible.current = marketingEligible;
    if (candidateTrackers.length === 0) return;
    lastDispatchedPathname.current = pathname;
    void dispatchEvent(
      candidateTrackers,
      {
        eventName: "page_view",
        pathname,
        locale: getLocaleFromPathname(pathname) ?? defaultLocale,
      },
      consent,
    );
  }, [analyticsEligible, marketingEligible, consent, pathname, trackers]);

  const value = useMemo<AnalyticsValue>(
    () => ({ attribution, capture }),
    [attribution, capture],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsValue {
  const value = useContext(AnalyticsContext);
  if (!value) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return value;
}
