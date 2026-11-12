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
    await expect(links.getByRole("link").nth(0)).toHaveText("JOBE Vox");
    await expect(links.getByRole("link").nth(1)).toHaveText("StockCast");
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
  for (const { locale, founderHeading, narrative } of [
    {
      locale: "en",
      founderHeading: "The founder",
      narrative: [
        /software engineer and the founder of JOBE/,
        /He founded StockCast/,
        /about 180 hours of earnings calls each quarter.*JOBE Vox/,
        /more than 20 years in software engineering/,
        /Director of Technology at ProFUSION/,
        /nearly nine years at Embraer/,
        /helps them decide what to fix first/,
      ],
    },
    {
      locale: "pt-BR",
      founderHeading: "O fundador",
      narrative: [
        /engenheiro de software e fundador da JOBE/,
        /Fundou o StockCast/,
        /cerca de 180 horas de teleconferências de resultados por trimestre.*JOBE Vox/,
        /mais de 20 anos de engenharia de software/,
        /Diretor de Tecnologia na ProFUSION/,
        /quase nove anos na Embraer/,
        /ajuda a definir o que corrigir primeiro/,
      ],
    },
  ]) {
    test(`presents current work before career history in ${locale} on the ${name} layout`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}/about`);

      const founder = page.locator("section").filter({
        has: page.getByRole("heading", { name: founderHeading, exact: true }),
      });
      const paragraphs = founder.getByRole("paragraph");
      await expect(paragraphs).toHaveText(narrative);
      for (const paragraph of await paragraphs.all()) {
        await expect(paragraph).toBeVisible();
      }
    });
  }
}
