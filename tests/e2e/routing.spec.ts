import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../../app/consent/consent";
import { expect, test as base } from "./fixtures";

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

  await expect(
    page.getByRole("heading", { level: 1, name: "StockCast" }),
  ).toBeVisible();
  await expect(
    page.getByText("Case material pending", { exact: true }),
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

  await page.getByRole("link", { name: "About", exact: true }).click();
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
      .getByText("Three offers, one method: evaluate first, then direct.", {
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

test("does not persist a language choice", async ({ page }) => {
  const snapshotPersistence = () =>
    page.evaluate(() => ({
      cookie: document.cookie,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
    }));

  await page.goto("/en/about");
  const persistenceBeforeSwitch = await snapshotPersistence();

  await page.getByRole("link", { name: "Português" }).click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(
    page.getByRole("heading", { name: "Sobre a JOBE" }),
  ).toBeVisible();
  expect(await snapshotPersistence()).toEqual(persistenceBeforeSwitch);
});

test("keeps navigation in the active locale", async ({ page }) => {
  await page.goto("/pt-BR/");
  await page.getByRole("link", { name: "Sobre" }).click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(
    page.getByRole("heading", { name: "Sobre a JOBE" }),
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

test.describe("English browser locale", () => {
  test.use({ locale: "en-US" });

  test("redirects the root by base language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/en/");
  });
});

test.describe("Portuguese browser locale", () => {
  test.use({ locale: "pt-PT" });

  test("redirects the root by base language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/pt-BR/");
  });
});

test.describe("unsupported browser locale", () => {
  test.use({ locale: "fr-FR" });

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
