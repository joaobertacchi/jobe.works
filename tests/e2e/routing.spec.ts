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

const englishPagesWithPortugueseSiblings = [
  ["Home", "/en/", "/pt-BR/", "Modelo de site estático"],
  ["About", "/en/about", "/pt-BR/about", "Sobre"],
  ["Services", "/en/services", "/pt-BR/services", "Serviços"],
  ["404", "/en/404", "/pt-BR/404", "Página não encontrada"],
] as const;

for (const [
  pageName,
  englishUrl,
  portugueseUrl,
  portugueseHeading,
] of englishPagesWithPortugueseSiblings) {
  test(`${pageName} language switch preserves logical page identity`, async ({
    page,
  }) => {
    await page.goto(englishUrl);
    const languageNavigation = page.getByRole("navigation", {
      name: "Choose language",
    });
    await expect(languageNavigation.getByRole("link")).toHaveCount(1);
    await expect(
      languageNavigation.getByRole("link", { name: "Português" }),
    ).toHaveAttribute("href", portugueseUrl);

    await languageNavigation.getByRole("link", { name: "Português" }).click();

    await expect(page).toHaveURL(portugueseUrl);
    await expect(
      page.getByRole("heading", { name: portugueseHeading }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
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
