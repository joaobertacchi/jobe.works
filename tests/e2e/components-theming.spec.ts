import { expect, test } from "./fixtures";

test("explicit theme controls update the document and page colors", async ({
  page,
}) => {
  await page.goto("/en/services");
  const html = page.locator("html");
  const theme = page.getByRole("group", { name: "Theme" });

  await theme.getByRole("button", { name: "Light" }).click();
  await expect(html).not.toHaveClass(/\bdark\b/);
  await expect
    .poll(() => html.evaluate((element) => element.style.colorScheme))
    .toBe("light");
  const lightColors = await page.locator("body").evaluate((body) => {
    const styles = getComputedStyle(body);
    return {
      background: styles.backgroundColor,
      foreground: styles.color,
    };
  });

  await theme.getByRole("button", { name: "Dark" }).click();
  await expect(html).toHaveClass(/\bdark\b/);
  await expect
    .poll(() => html.evaluate((element) => element.style.colorScheme))
    .toBe("dark");
  const darkColors = await page.locator("body").evaluate((body) => {
    const styles = getComputedStyle(body);
    return {
      background: styles.backgroundColor,
      foreground: styles.color,
    };
  });

  expect(darkColors.background).not.toBe(lightColors.background);
  expect(darkColors.foreground).not.toBe(lightColors.foreground);
});

test("services remain usable and stack on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/services");

  await expect(
    page.getByText("Agent-ready sites", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Choose language" }),
  ).toBeVisible();
  const theme = page.getByRole("group", { name: "Theme" });
  await expect(theme).toBeVisible();
  await expect(theme.getByRole("button")).toHaveCount(3);
  await expect(theme.getByRole("button", { name: "Light" })).toBeVisible();
  await expect(theme.getByRole("button", { name: "Dark" })).toBeVisible();
  await expect(theme.getByRole("button", { name: "System" })).toBeVisible();

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  const cards = await page.locator("article").evaluateAll((articles) =>
    articles.map((article) => {
      const { left, top } = article.getBoundingClientRect();
      return { left, top };
    }),
  );
  expect(cards).toHaveLength(3);
  expect(
    Math.max(...cards.map(({ left }) => left)) -
      Math.min(...cards.map(({ left }) => left)),
  ).toBeLessThanOrEqual(2);
  expect(cards[1].top).toBeGreaterThan(cards[0].top);
  expect(cards[2].top).toBeGreaterThan(cards[1].top);
});

test("service cards use multiple columns on a desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en/services");

  const leftCoordinates = await page
    .locator("article")
    .evaluateAll((articles) =>
      articles.map((article) =>
        Math.round(article.getBoundingClientRect().left),
      ),
    );

  expect(new Set(leftCoordinates).size).toBeGreaterThanOrEqual(2);
});
