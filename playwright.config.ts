import { defineConfig, devices } from "@playwright/test";

import { E2E_POSTHOG_HOST, E2E_POSTHOG_KEY } from "./tests/e2e/posthog-host";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  testDir: "./tests/e2e",
  outputDir: "test-results",
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    // Process env overrides .env, so e2e builds never embed the real key.
    env: {
      VITE_POSTHOG_KEY: E2E_POSTHOG_KEY,
      VITE_POSTHOG_HOST: E2E_POSTHOG_HOST,
    },
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
