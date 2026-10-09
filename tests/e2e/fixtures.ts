import { gunzipSync } from "node:zlib";

import { expect, test as base } from "@playwright/test";

import { HYDRATED_ATTRIBUTE } from "../../app/hydration";
import { E2E_POSTHOG_HOST } from "./posthog-host";

export type PostHogRequest = { url: string; body: string };

function decodeBody(buffer: Buffer | null): string {
  if (!buffer) return "";
  const gzipped = buffer[0] === 0x1f && buffer[1] === 0x8b;
  return (gzipped ? gunzipSync(buffer) : buffer).toString("utf8");
}

export const test = base.extend<{
  browserErrors: void;
  posthogRequests: PostHogRequest[];
  /** Disable only for tests that observe the page before the app runs. */
  waitForHydration: boolean;
}>({
  waitForHydration: [true, { option: true }],
  // Prerendered pages are visible and clickable before React attaches
  // handlers or restores scroll, so every navigation waits for hydration.
  page: [
    async ({ page, waitForHydration, javaScriptEnabled }, use) => {
      if (waitForHydration && javaScriptEnabled) {
        const goto = page.goto.bind(page);
        const reload = page.reload.bind(page);
        const goBack = page.goBack.bind(page);
        const goForward = page.goForward.bind(page);
        const hydrated = async <T>(response: T): Promise<T> => {
          await expect(
            page.locator("html"),
            "page did not hydrate",
          ).toHaveAttribute(HYDRATED_ATTRIBUTE, "");
          return response;
        };
        page.goto = async (...args) => hydrated(await goto(...args));
        page.reload = async (...args) => hydrated(await reload(...args));
        page.goBack = async (...args) => hydrated(await goBack(...args));
        page.goForward = async (...args) => hydrated(await goForward(...args));
      }
      await use(page);
    },
    { scope: "test" },
  ],
  posthogRequests: [
    async ({ page }, use) => {
      const requests: PostHogRequest[] = [];
      await page.route(`${E2E_POSTHOG_HOST}/**`, (route) => {
        const request = route.request();
        requests.push({
          url: request.url(),
          body: decodeBody(request.postDataBuffer()),
        });
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{}",
        });
      });
      await use(requests);
    },
    { auto: true },
  ],
  browserErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await use();

      expect(errors, "unexpected browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
