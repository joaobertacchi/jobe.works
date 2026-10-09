import { gunzipSync } from "node:zlib";

import { expect, test as base } from "@playwright/test";

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
}>({
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
