import { expect, test } from "@playwright/test";

import { type LayoutName, layouts } from "./layouts";

const portraitBesideText: Record<LayoutName, boolean> = {
  phone: false,
  intermediate: true,
  desktop: true,
};

for (const { name, viewport } of layouts) {
  test(`places the founder portrait on the ${name} layout`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/pt-BR/about");
    const image = page.getByRole("img", { name: /Retrato de João Bertacchi/ });
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);
    expect(
      await image.evaluate((node: HTMLImageElement) => node.currentSrc),
    ).toMatch(/\.avif$/);

    const box = (await image.boundingBox())!;
    const heading = (await page
      .getByRole("heading", { name: "O fundador" })
      .boundingBox())!;
    if (portraitBesideText[name]) {
      expect(box.width).toBeGreaterThan(200);
      expect(box.width).toBeLessThanOrEqual(260);
      expect(heading.x).toBeGreaterThan(box.x + box.width);
    } else {
      expect(box.width).toBeLessThanOrEqual(320);
      expect(heading.y).toBeGreaterThan(box.y + box.height);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("keeps the blue rim distinct from the canvas in dark theme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/about");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  const [rim, canvas] = await page.evaluate(() => [
    getComputedStyle(document.querySelector(".atlas-portrait__frame")!)
      .backgroundColor,
    getComputedStyle(document.body).backgroundColor,
  ]);
  expect(rim).not.toBe(canvas);
});
