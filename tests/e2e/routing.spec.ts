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
    page.getByRole("heading", { name: "Static website template" }),
  ).toBeVisible();
  await expect(
    page.getByText("Built for agents, ready for people", { exact: true }),
  ).toBeVisible();
});

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
  await expect(page.getByRole("heading", { name: "Sobre" })).toBeVisible();
  expect(await snapshotPersistence()).toEqual(persistenceBeforeSwitch);
});

test("keeps navigation in the active locale", async ({ page }) => {
  await page.goto("/pt-BR/");
  await page.getByRole("link", { name: "Sobre" }).click();

  await expect(page).toHaveURL("/pt-BR/about");
  await expect(page.getByRole("heading", { name: "Sobre" })).toBeVisible();
});

test("returns real 404 responses for unpublished URLs", async ({ request }) => {
  expect((await request.get("/fr/about")).status()).toBe(404);
  expect((await request.get("/en/not-published")).status()).toBe(404);
  expect((await request.get("/pt-BR/not-published")).status()).toBe(404);
});

const supportedLocaleCatchAllPages = [
  [
    "/en/about",
    "/en/not-published",
    "Page not found",
    "This page may have moved or never existed. Use the navigation to find your way back.",
    "Choose language",
  ],
  [
    "/pt-BR/about",
    "/pt-BR/not-published",
    "Página não encontrada",
    "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    "Escolher idioma",
  ],
] as const;

for (const [
  initialUrl,
  unknownUrl,
  heading,
  description,
  switcherLabel,
] of supportedLocaleCatchAllPages) {
  test(`renders localized catch-all after client navigation to ${unknownUrl}`, async ({
    page,
  }) => {
    await page.goto(initialUrl);
    await page.evaluate((url) => {
      window.history.pushState(null, "", url);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, unknownUrl);

    await expect(page).toHaveURL(unknownUrl);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
    await expect(page.getByText("An unexpected error occurred.")).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("navigation", { name: switcherLabel }),
    ).toHaveCount(0);
  });
}

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
