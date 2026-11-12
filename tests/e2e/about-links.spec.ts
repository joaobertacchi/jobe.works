import { expect, test } from "./fixtures";

import { layouts } from "./layouts";

for (const { name, viewport } of layouts) {
  test(`keeps founder links usable on the ${name} layout`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/en/about");

    const links = page.getByRole("navigation", {
      name: "Founder products and profiles",
    });
    await expect(links.getByRole("link")).toHaveCount(5);
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
