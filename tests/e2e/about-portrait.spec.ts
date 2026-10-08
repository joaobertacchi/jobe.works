import { expect, test } from "@playwright/test";

test("loads a modern-format founder portrait beside the text on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
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
  expect(box.width).toBeGreaterThan(200);
  expect(box.width).toBeLessThanOrEqual(260);
  const heading = (await page
    .getByRole("heading", { name: "O fundador" })
    .boundingBox())!;
  expect(heading.x).toBeGreaterThan(box.x + box.width);
});

test("fits a narrow phone without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/en/about");
  const image = page.getByRole("img", { name: /Portrait of João Bertacchi/ });
  await image.scrollIntoViewIfNeeded();
  const box = (await image.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(320);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

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
