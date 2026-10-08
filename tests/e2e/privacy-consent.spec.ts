import type { Page } from "@playwright/test";

import type { AnalyticsCustomEvent } from "../../app/analytics/types";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../../app/consent/consent";
import { expect, test } from "./fixtures";

async function setStoredConsent(page: Page, value: unknown) {
  return page.addInitScript(
    ({ key, value }) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else if (typeof value === "string") {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
    { key: CONSENT_STORAGE_KEY, value },
  );
}

function collectAnalyticsEvents(page: Page) {
  const events: AnalyticsCustomEvent[] = [];
  const pendingReads = new Set<Promise<void>>();

  page.on("console", (message) => {
    if (message.type() !== "debug") return;

    const [prefixArgument, eventArgument] = message.args();
    if (!prefixArgument || !eventArgument) return;

    const pendingRead = prefixArgument.jsonValue().then(async (prefix) => {
      if (prefix !== "[analytics]" && !message.text().startsWith("[analytics]"))
        return;

      events.push((await eventArgument.jsonValue()) as AnalyticsCustomEvent);
    });
    pendingReads.add(pendingRead);
    void pendingRead.then(
      () => pendingReads.delete(pendingRead),
      () => pendingReads.delete(pendingRead),
    );
  });

  return {
    events,
    async flush() {
      while (pendingReads.size > 0) {
        await Promise.all([...pendingReads]);
      }
    },
  };
}

function hasPageView(
  events: readonly AnalyticsCustomEvent[],
  pathname: string,
): boolean {
  return events.some(
    (event) => event.eventName === "page_view" && event.pathname === pathname,
  );
}

function pageViewEvents(
  events: readonly AnalyticsCustomEvent[],
): AnalyticsCustomEvent[] {
  return events.filter((event) => event.eventName === "page_view");
}

async function settleBrowserEffects(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

function storedConsent(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), CONSENT_STORAGE_KEY);
}

async function expectBanner(page: Page) {
  const banner = page.getByRole("region", { name: "Cookie preferences" });
  await expect(banner).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Accept all" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Reject non-essential" }),
  ).toBeVisible();
  await expect(banner.getByRole("button", { name: "Customize" })).toBeVisible();
}

test("shows the consent banner and keeps analytics idle before a choice", async ({
  page,
}) => {
  await setStoredConsent(page, null);
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/");
  await expectBanner(page);

  await page
    .getByRole("link", { name: "Book an Initial Assessment" })
    .first()
    .click();
  await expect(page).toHaveURL("/en/contact");
  await settleBrowserEffects(page);
  await analytics.flush();

  expect(pageViewEvents(analytics.events)).toHaveLength(0);
});

test("accept all enables analytics and logs page views", async ({ page }) => {
  await setStoredConsent(page, null);
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);
  await expect.poll(() => hasPageView(analytics.events, "/en/")).toBe(true);
  await analytics.flush();

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  await expect
    .poll(() => hasPageView(analytics.events, "/en/about"))
    .toBe(true);
  await analytics.flush();
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({
    version: CONSENT_VERSION,
    analytics: true,
    marketing: true,
  });
});

test("customize enables only the selected categories", async ({ page }) => {
  await setStoredConsent(page, null);
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Customize" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("checkbox", { name: "Necessary" }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("checkbox", { name: "Analytics" }),
  ).not.toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: "Marketing" }),
  ).not.toBeChecked();

  await dialog.getByRole("checkbox", { name: "Analytics" }).check();
  await dialog.getByRole("button", { name: "Save preferences" }).click();

  await expect(dialog).toHaveCount(0);
  await expect.poll(() => hasPageView(analytics.events, "/en/")).toBe(true);
  await analytics.flush();
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: true, marketing: false });
});

test("withdrawing analytics consent prevents subsequent tracking", async ({
  page,
}) => {
  await setStoredConsent(page, null);
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect.poll(() => hasPageView(analytics.events, "/en/")).toBe(true);
  await analytics.flush();
  const baselineEventCount = analytics.events.length;

  const footer = page.getByRole("contentinfo");
  await footer.getByRole("button", { name: "Cookie settings" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await dialog.getByRole("checkbox", { name: "Analytics" }).uncheck();
  await dialog.getByRole("button", { name: "Save preferences" }).click();
  await settleBrowserEffects(page);
  await analytics.flush();
  expect(analytics.events).toHaveLength(baselineEventCount);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");
  await settleBrowserEffects(page);
  await analytics.flush();

  expect(analytics.events).toHaveLength(baselineEventCount);
  expect(JSON.parse((await storedConsent(page)) ?? "null")).toMatchObject({
    analytics: false,
    marketing: true,
  });
});

test("consent persists across reloads", async ({ page }) => {
  const seed = await setStoredConsent(page, null);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await seed.dispose();
  await page.reload();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("contentinfo").getByRole("button", {
      name: "Cookie settings",
    }),
  ).toBeVisible();
});

test("a stored consent from an older version shows the banner again", async ({
  page,
}) => {
  await setStoredConsent(page, {
    version: CONSENT_VERSION - 1,
    analytics: true,
    marketing: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
  });

  await page.goto("/en/");
  await expectBanner(page);
});

test("hero call to action emits cta_pressed after consent", async ({
  page,
}) => {
  await setStoredConsent(page, null);
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await page
    .getByRole("link", { name: "Book an Initial Assessment" })
    .first()
    .click();

  await expect(page).toHaveURL("/en/contact");
  await expect
    .poll(() =>
      analytics.events.some(
        (event) =>
          event.eventName === "cta_pressed" &&
          event.ctaId === "hero-rail-book-call" &&
          event.context === "homepage",
      ),
    )
    .toBe(true);
  await analytics.flush();
});

test("contact page offers the mailto booking path without emitting a lead event", async ({
  page,
}) => {
  await setStoredConsent(page, {
    version: CONSENT_VERSION,
    analytics: false,
    marketing: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
  const analytics = collectAnalyticsEvents(page);

  await page.goto("/en/contact?utm_source=newsletter&unknown=ignored");

  const mailto = page.getByRole("main").getByRole("link", {
    name: "contato@jobe.works",
    exact: true,
  });
  await expect(mailto).toBeVisible();
  await expect
    .poll(() => mailto.getAttribute("href"))
    .toContain("mailto:contato@jobe.works");
  await settleBrowserEffects(page);
  await analytics.flush();

  expect(
    analytics.events.some((event) => event.eventName === "lead_submitted"),
  ).toBe(false);
});
