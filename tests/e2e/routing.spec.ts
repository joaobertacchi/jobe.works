import { expect, test } from "./fixtures";

const publishedPages = [
  ["/en/", "Static website template"],
  ["/en/about", "About"],
  ["/en/services", "Services"],
  ["/en/404", "Page not found"],
  ["/pt-BR/", "Modelo de site estático"],
  ["/pt-BR/about", "Sobre"],
  ["/pt-BR/services", "Serviços"],
  ["/pt-BR/404", "Página não encontrada"],
] as const;

for (const [url, heading] of publishedPages) {
  test(`serves prerendered ${url}`, async ({ page, request }) => {
    const response = await request.get(url);
    expect(response.status()).toBe(200);

    await page.goto(url);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}

test("keeps navigation in the active locale", async ({ page }) => {
  await page.goto("/pt-BR/");
  await page.getByRole("link", { name: "Sobre" }).click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(page.getByRole("heading", { name: "Sobre" })).toBeVisible();
});

test("returns real 404 responses for unpublished URLs", async ({ request }) => {
  expect((await request.get("/fr/about")).status()).toBe(404);
  expect((await request.get("/en/not-published")).status()).toBe(404);
});

test("uses the route error boundary for unsupported client navigation", async ({
  page,
}) => {
  await page.goto("/en/about");
  await page.evaluate(() => {
    window.history.pushState(null, "", "/fr/about");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await expect(page).toHaveURL("/fr/about");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});

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
