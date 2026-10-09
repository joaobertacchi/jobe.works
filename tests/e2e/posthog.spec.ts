import type { Page } from "@playwright/test";

import { CONSENT_STORAGE_KEY } from "../../app/consent/consent";
import { expect, test } from "./fixtures";
import { layouts } from "./layouts";

// PostHog drops events from automated browsers (headless brands, webdriver).
// Production keeps that filter; these tests present a regular browser instead.
const regularChromeUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

test.use({ userAgent: regularChromeUserAgent });

async function prepareVisitor(page: Page) {
  await page.addInitScript((key) => {
    localStorage.removeItem(key);
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "userAgentData", { get: () => undefined });
  }, CONSENT_STORAGE_KEY);
}

// posthog-js registers this global when its chunk is evaluated.
function sdkLoaded(page: Page) {
  return page.evaluate(() => "__PosthogExtensions__" in window);
}

function posthogStorageKeys(page: Page) {
  return page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.includes("ph_")),
  );
}

async function openAbout(page: Page) {
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(page).toHaveURL("/en/about");
}

for (const layout of layouts) {
  test.describe(`PostHog at the ${layout.name} layout`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(layout.viewport);
      await prepareVisitor(page);
    });

    test("does not load or contact PostHog before analytics consent", async ({
      page,
      posthogRequests,
    }) => {
      await page.goto("/en/");
      await openAbout(page);
      await page.getByRole("button", { name: "Reject non-essential" }).click();
      await openAbout(page);
      await page.waitForTimeout(1_000);

      expect(posthogRequests).toEqual([]);
      expect(await sdkLoaded(page)).toBe(false);
      expect(await posthogStorageKeys(page)).toEqual([]);
      expect(
        (await page.context().cookies()).filter(({ name }) =>
          name.startsWith("ph_"),
        ),
      ).toEqual([]);
    });

    test("sends only allowlisted campaign parameters", async ({
      page,
      posthogRequests,
    }) => {
      await page.goto(
        "/en/?utm_source=linkedin&utm_email=a%40b.c&gclid=click-123&fbclid=fb-456&token=secret",
      );
      await page.getByRole("button", { name: "Accept all" }).click();

      await expect
        .poll(() => posthogRequests.map(({ body }) => body).join("\n"))
        .toContain("$pageview");
      const sent = posthogRequests.map(({ body }) => body).join("\n");

      expect(sent).toContain("linkedin");
      for (const leaked of [
        "click-123",
        "fb-456",
        "gclid",
        "fbclid",
        "secret",
        "utm_email",
      ]) {
        expect(sent).not.toContain(leaked);
      }
    });

    test("sends events after consent and opts out after withdrawal", async ({
      page,
      posthogRequests,
    }) => {
      await page.goto("/en/");
      await page.getByRole("button", { name: "Accept all" }).click();

      await expect.poll(() => posthogRequests.length).toBeGreaterThan(0);
      expect(await sdkLoaded(page)).toBe(true);

      await page
        .getByRole("contentinfo")
        .getByRole("button", { name: "Cookie settings" })
        .click();
      const dialog = page.getByRole("dialog", { name: "Cookie settings" });
      await dialog.getByRole("checkbox", { name: "Analytics" }).uncheck();
      await dialog.getByRole("button", { name: "Save preferences" }).click();
      await expect(dialog).toHaveCount(0);

      await expect
        .poll(() =>
          page.evaluate(() =>
            Object.keys(localStorage)
              .filter((key) => key.startsWith("__ph_opt_in_out_"))
              .map((key) => localStorage.getItem(key)),
          ),
        )
        .toEqual(["0"]);

      // Let any batch queued before withdrawal flush, then take a baseline.
      await page.waitForTimeout(4_000);
      const baseline = posthogRequests.length;

      await openAbout(page);
      await page.waitForTimeout(4_000);

      expect(posthogRequests).toHaveLength(baseline);
    });
  });
}
