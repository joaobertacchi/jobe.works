import type { Page } from "@playwright/test";

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../../app/consent/consent";
import { LOCALE_STORAGE_KEY } from "../../app/i18n/locale-preference";
import { expect, test as base } from "./fixtures";

function expectStoredLocale(page: Page, locale: string) {
  return expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), LOCALE_STORAGE_KEY),
    )
    .toBe(locale);
}

const test = base.extend<{ consented: void }>({
  consented: [
    async ({ page }, use) => {
      await page.addInitScript(
        ({ key, version }) => {
          localStorage.setItem(
            key,
            JSON.stringify({
              version,
              analytics: true,
              marketing: true,
              updatedAt: "2026-01-01T00:00:00.000Z",
            }),
          );
        },
        { key: CONSENT_STORAGE_KEY, version: CONSENT_VERSION },
      );
      await use();
    },
    { auto: true },
  ],
});

test("serves and hydrates a representative prerendered localized page", async ({
  page,
  request,
}) => {
  const response = await request.get("/pt-BR/about");
  expect(response.status()).toBe(200);

  await page.goto("/pt-BR/about");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sobre a JOBE" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("serves the StockCast case study page", async ({ page }) => {
  await page.goto("/en/case");

  const article = page.getByRole("article");
  await expect(
    article.getByRole("heading", { level: 1, name: "StockCast" }),
  ).toBeVisible();
  await expect(
    article.getByRole("heading", { level: 2 }).first(),
  ).toBeVisible();
});

test("canonical hydration reuses prerendered loader data", async ({ page }) => {
  const dataRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith(".data")) {
      dataRequests.push(request.url());
    }
  });

  await page.goto("/en/about");

  await expect(page.getByRole("heading", { name: "About JOBE" })).toBeVisible();
  expect(dataRequests).toEqual([]);
});

test("keeps localized Home content after hydration", async ({ page }) => {
  await page.goto("/en/");
  const sentinel = await page.evaluate(() => {
    const value = crypto.randomUUID();
    Reflect.set(window, "routingSentinel", value);
    return value;
  });

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(page).toHaveURL("/en/about");
  expect(
    await page.evaluate(() => Reflect.get(window, "routingSentinel")),
  ).toBe(sentinel);

  await page.goBack();

  await expect(page).toHaveURL("/en/");
  expect(
    await page.evaluate(() => Reflect.get(window, "routingSentinel")),
  ).toBe(sentinel);
  await expect(
    page.getByRole("heading", { name: "Engineering that Works" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Services" })
      .getByText("Three ways to make engineering work for your business.", {
        exact: true,
      }),
  ).toBeVisible();
});

test("language switching preserves nested page identity", async ({ page }) => {
  await page.goto("/en/about");
  const switcher = page.getByRole("navigation", {
    name: "Choose language",
  });
  const portuguese = switcher.getByRole("link", { name: "Português" });

  await expect(portuguese).toHaveAttribute("href", "/pt-BR/about");
  await portuguese.click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(
    page.getByRole("heading", { name: "Sobre a JOBE" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("remembers a language choice for the root", async ({ page }) => {
  await page.goto("/en/about");
  await expectStoredLocale(page, "en");

  await page.getByRole("link", { name: "Português" }).click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expectStoredLocale(page, "pt-BR");
});

test("keeps navigation in the active locale", async ({ page }) => {
  await page.goto("/pt-BR/");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Sobre" })
    .click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(
    page.getByRole("heading", { name: "Sobre a JOBE" }),
  ).toBeVisible();
});

test("redirects the slashless locale root to its canonical form", async ({
  page,
}) => {
  await page.goto("/pt-BR");

  await expect(page).toHaveURL("/pt-BR/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Engenharia que funciona" }),
  ).toBeVisible();
});

for (const [url, category] of [
  ["/fr/about", "unsupported locale"],
  ["/en/not-published", "unpublished localized route"],
] as const) {
  test(`returns a real 404 for ${url} (${category})`, async ({ request }) => {
    expect((await request.get(url)).status()).toBe(404);
  });
}

test.describe("first visit with an English browser", () => {
  test.use({ locale: "en-US" });

  test("opens the root in the default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/pt-BR/");
  });
});

test("reopens the root in the last used locale", async ({ page }) => {
  await page.goto("/en/about");
  await expectStoredLocale(page, "en");
  await page.goto("/");
  await expect(page).toHaveURL("/en/");

  await page.goto("/pt-BR/services");
  await expectStoredLocale(page, "pt-BR");
  await page.goto("/");
  await expect(page).toHaveURL("/pt-BR/");
});

test("redirects the root before the app bundle runs", async ({ page }) => {
  await page.goto("/en/");
  await expectStoredLocale(page, "en");
  await page.route("**/*.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "" }),
  );

  await page.goto("/");
  await expect(page).toHaveURL("/en/");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("redirects the root to the default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/pt-BR/");
  });
});

test("keeps localized Privacy navigation in the footer", async ({ page }) => {
  await page.goto("/pt-BR/about");
  const footer = page.getByRole("contentinfo");
  await expect(
    footer.getByRole("link", { name: "Privacidade" }),
  ).toHaveAttribute("href", "/pt-BR/privacy");
  await footer.getByRole("link", { name: "Privacidade" }).click();
  await expect(page).toHaveURL("/pt-BR/privacy");
  await expect(
    page.getByRole("heading", { level: 1, name: "Aviso de privacidade" }),
  ).toBeVisible();
});
