// Fake ingestion host compiled into the e2e build (see playwright.config.ts).
// Every request to it is intercepted, so tests never reach PostHog.
export const E2E_POSTHOG_HOST = "https://posthog.e2e.test";
export const E2E_POSTHOG_KEY = "phc_e2e_fake_key";
