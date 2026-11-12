import { expect, test } from "./fixtures";

import { layouts } from "./layouts";

for (const { name, viewport } of layouts) {
  test(`keeps founder links usable on the ${name} layout`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/en/about");

    const links = page.getByRole("navigation", {
      name: "Founder products and profiles",
    });
    await expect(links.getByRole("link")).toHaveCount(4);
    await expect(links.getByRole("link").nth(0)).toHaveText("StockCast");
    await expect(links.getByRole("link").nth(1)).toHaveText("JOBE Vox");
    for (const link of await links.getByRole("link").all()) {
      await expect(link).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

for (const { name, viewport } of layouts) {
  for (const { locale, founderHeading, stockcastIntro, voxOrigin } of [
    {
      locale: "en",
      founderHeading: "The founder",
      stockcastIntro: "He founded StockCast",
      voxOrigin: "about 180 hours of earnings calls each quarter",
    },
    {
      locale: "pt-BR",
      founderHeading: "O fundador",
      stockcastIntro: "É fundador do StockCast",
      voxOrigin:
        "cerca de 180 horas de teleconferências de resultados por trimestre",
    },
  ]) {
    test(`introduces JOBE Vox after StockCast in ${locale} on the ${name} layout`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}/about`);

      const founder = page.locator("section").filter({
        has: page.getByRole("heading", { name: founderHeading, exact: true }),
      });
      const paragraphs = founder.getByRole("paragraph");
      await expect(paragraphs.nth(3)).toContainText(stockcastIntro);
      await expect(paragraphs.nth(4)).toContainText(voxOrigin);
      await expect(paragraphs.nth(4)).toContainText("JOBE Vox");
      await expect(paragraphs.nth(4)).toBeVisible();
    });
  }
}
