import type { Page } from "@playwright/test";

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

function collectAnalyticsMessages(page: Page) {
  const messages: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "debug" && message.text().startsWith("[analytics]"))
      messages.push(message.text());
  });
  return messages;
}

function hasPageView(messages: string[], pathname: string): boolean {
  return messages.some(
    (message) =>
      message.includes("eventName: page_view") && message.includes(pathname),
  );
}

function pageViewMessages(messages: string[]): string[] {
  return messages.filter((message) => message.includes("eventName: page_view"));
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
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await expectBanner(page);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  expect(pageViewMessages(messages)).toHaveLength(0);
});

test("accept all enables analytics and logs page views", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);
  await expect.poll(() => hasPageView(messages, "/en/")).toBe(true);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  await expect.poll(() => hasPageView(messages, "/en/about")).toBe(true);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({
    version: CONSENT_VERSION,
    analytics: true,
    marketing: true,
  });
});

test("reject non-essential keeps analytics disabled", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Reject non-essential" }).click();

  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL("/en/about");

  expect(pageViewMessages(messages)).toHaveLength(0);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: false, marketing: false });
});

test("customize enables only the selected categories", async ({ page }) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

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
  await expect.poll(() => hasPageView(messages, "/en/")).toBe(true);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: true, marketing: false });
});

test("cookie settings remain accessible after dismissal and update consent", async ({
  page,
}) => {
  await setStoredConsent(page, null);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toHaveCount(0);

  const footer = page.getByRole("contentinfo");
  await footer.getByRole("button", { name: "Cookie settings" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("checkbox", { name: "Analytics" }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: "Marketing" }),
  ).toBeChecked();

  await dialog.getByRole("checkbox", { name: "Marketing" }).uncheck();
  await dialog.getByRole("button", { name: "Save preferences" }).click();

  await expect(dialog).toHaveCount(0);
  const persisted = JSON.parse((await storedConsent(page)) ?? "null");
  expect(persisted).toMatchObject({ analytics: true, marketing: false });
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

test("malformed stored consent is treated as unresolved", async ({ page }) => {
  await setStoredConsent(
    page,
    JSON.stringify({
      version: CONSENT_VERSION,
      analytics: "yes",
      marketing: false,
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
  );

  await page.goto("/en/");
  await expectBanner(page);
});

test("escape closes the customize dialog without persisting", async ({
  page,
}) => {
  await setStoredConsent(page, null);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Customize" }).click();

  const dialog = page.getByRole("dialog", { name: "Cookie settings" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(dialog).toHaveCount(0);
  expect(await storedConsent(page)).toBeNull();
  await expectBanner(page);
});

test("hero call to action emits cta_pressed after consent", async ({
  page,
}) => {
  await setStoredConsent(page, null);
  const messages = collectAnalyticsMessages(page);

  await page.goto("/en/");
  await page.getByRole("button", { name: "Accept all" }).click();
  await page.getByRole("link", { name: "Explore the examples" }).click();

  await expect(page).toHaveURL("/en/services");
  await expect
    .poll(() =>
      messages.some(
        (message) =>
          message.includes("eventName: cta_pressed") &&
          message.includes("hero-cta"),
      ),
    )
    .toBe(true);
});

test("renders the Portuguese consent banner", async ({ page }) => {
  await setStoredConsent(page, null);

  await page.goto("/pt-BR/");

  const banner = page.getByRole("region", {
    name: "Preferências de cookies",
  });
  await expect(banner).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Aceitar tudo" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Recusar não essenciais" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", { name: "Personalizar" }),
  ).toBeVisible();
});
