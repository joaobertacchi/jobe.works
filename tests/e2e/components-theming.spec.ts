import type { Locator, Page } from "@playwright/test";

import { themeInitializationScript } from "../../app/theme";
import { expect, test } from "./fixtures";

const themeStorageKey = "theme";

async function expectTheme(
  page: Page,
  effectiveTheme: "light" | "dark",
  selectedTheme: string,
) {
  const html = page.locator("html");
  const theme = page.getByRole("group", { name: /^(Theme|Tema)$/ });

  if (effectiveTheme === "dark") {
    await expect(html).toHaveClass(/\bdark\b/);
  } else {
    await expect(html).not.toHaveClass(/\bdark\b/);
  }
  await expect
    .poll(() => html.evaluate((element) => element.style.colorScheme))
    .toBe(effectiveTheme);
  await expect(
    theme.getByRole("button", { name: selectedTheme }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(theme.locator('[aria-pressed="true"]')).toHaveCount(1);
}

async function storedTheme(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), themeStorageKey);
}

async function tabTo(page: Page, target: Locator) {
  for (let index = 0; index < 50; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement))
      return;
  }

  throw new Error(
    "Target was not reached in one deterministic focus traversal",
  );
}

async function computedOutline(control: Locator) {
  return control.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      style: styles.outlineStyle,
      width: Number.parseFloat(styles.outlineWidth),
    };
  });
}

test("fresh system theme follows an emulated light preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");

  expect(await storedTheme(page)).toBeNull();
  await expectTheme(page, "light", "System");
});

test("fresh system theme follows an emulated dark preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/");

  expect(await storedTheme(page)).toBeNull();
  await expectTheme(page, "dark", "System");
});

test("explicit theme controls persist light and dark preferences", async ({
  page,
}) => {
  await page.goto("/en/services");
  const theme = page.getByRole("group", { name: "Theme" });

  await theme.getByRole("button", { name: "Light" }).click();
  expect(await storedTheme(page)).toBe("light");
  await expectTheme(page, "light", "Light");

  await theme.getByRole("button", { name: "Dark" }).click();
  expect(await storedTheme(page)).toBe("dark");
  await expectTheme(page, "dark", "Dark");
});

test("system theme removes the explicit preference and follows the OS", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/");
  const theme = page.getByRole("group", { name: "Theme" });

  await theme.getByRole("button", { name: "Light" }).click();
  expect(await storedTheme(page)).toBe("light");

  await theme.getByRole("button", { name: "System" }).click();

  expect(await storedTheme(page)).toBeNull();
  await expectTheme(page, "dark", "System");
});

test("system responds to live media changes while explicit mode ignores them", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");
  await expectTheme(page, "light", "System");

  await page.emulateMedia({ colorScheme: "dark" });
  await expectTheme(page, "dark", "System");

  await page.getByRole("button", { name: "Dark" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expectTheme(page, "dark", "Dark");

  await page.getByRole("button", { name: "Light" }).click();
  expect(await storedTheme(page)).toBe("light");
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await storedTheme(page)).toBe("light");
  await expectTheme(page, "light", "Light");
});

test("explicit preference survives internal navigation and a full reload", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.getByRole("button", { name: "Dark" }).click();

  await page.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL("/en/services");
  expect(await storedTheme(page)).toBe("dark");
  await expectTheme(page, "dark", "Dark");

  await page.reload();
  await expect(page).toHaveURL("/en/services");
  expect(await storedTheme(page)).toBe("dark");
  await expectTheme(page, "dark", "Dark");
});

test("language switching preserves the theme and exact locale route", async ({
  page,
}) => {
  await page.goto("/en/services");
  await page.getByRole("button", { name: "Dark" }).click();

  await page
    .getByRole("navigation", { name: "Choose language" })
    .getByRole("link", { name: "Português" })
    .click();

  await expect(page).toHaveURL("/pt-BR/services");
  expect(await storedTheme(page)).toBe("dark");
  await expectTheme(page, "dark", "Escuro");
});

test("invalid stored theme follows system preference without browser errors", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(({ key }) => localStorage.setItem(key, "invalid"), {
    key: themeStorageKey,
  });

  await page.goto("/en/");

  expect(await storedTheme(page)).toBe("invalid");
  await expectTheme(page, "dark", "System");
});

test("representative page uses semantic headings and one selected theme", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole("group", { name: "Theme" }).locator('[aria-pressed="true"]'),
  ).toHaveCount(1);
});

test("keyboard traversal reaches navigation and visibly focused theme controls", async ({
  page,
}) => {
  await page.goto("/en/services");
  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const servicesLink = primaryNavigation.getByRole("link", {
    name: "Services",
  });
  await tabTo(page, servicesLink);
  await expect(servicesLink).toBeFocused();
  const navigationFocusOutline = await computedOutline(servicesLink);
  expect(navigationFocusOutline.style).not.toBe("none");
  expect(navigationFocusOutline.width).toBeGreaterThan(0);

  const lightButton = page
    .getByRole("group", { name: "Theme" })
    .getByRole("button", { name: "Light" });
  await tabTo(page, lightButton);
  await expect(lightButton).toBeFocused();

  const themeFocusOutline = await computedOutline(lightButton);
  expect(themeFocusOutline.style).not.toBe("none");
  expect(themeFocusOutline.width).toBeGreaterThan(0);
});

test("CTA link exposes visible keyboard focus", async ({ page }) => {
  await page.goto("/en/");
  const link = page
    .getByRole("link", { name: "Book a Product Readiness Call" })
    .first();
  await tabTo(page, link);
  await expect(link).toBeFocused();
  const outline = await computedOutline(link);
  expect(outline.style).not.toBe("none");
  expect(outline.width).toBeGreaterThan(0);
});

test("theme bootstrap appears before the first stylesheet in raw HTML", async ({
  request,
}) => {
  const response = await request.get("/en/");
  expect(response.status()).toBe(200);
  const html = await response.text();
  const bootstrapTag = `<script>${themeInitializationScript}</script>`;
  const bootstrapScriptIndex = html.indexOf(bootstrapTag);
  const stylesheetIndex = [...html.matchAll(/<link\b[^>]*>/gi)]
    .filter(([tag]) => /\brel=["'][^"']*\bstylesheet\b[^"']*["']/i.test(tag))
    .map(({ index }) => index)
    .at(0);

  expect(bootstrapScriptIndex).toBeGreaterThanOrEqual(0);
  expect(stylesheetIndex).toBeDefined();
  expect(bootstrapScriptIndex).toBeLessThan(stylesheetIndex!);
  expect(html).not.toContain("fonts.googleapis.com");
  expect(html).not.toContain("fonts.gstatic.com");
});

test("stored dark theme is applied no later than first contentful paint", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(
    ({ bootstrapScript, key }) => {
      localStorage.setItem(key, "dark");
      const originalToggle = DOMTokenList.prototype.toggle;
      DOMTokenList.prototype.toggle = function (token, force) {
        const result = originalToggle.call(this, token, force);
        const currentScript = document.currentScript;
        if (
          token === "dark" &&
          this === document.documentElement.classList &&
          document.documentElement.classList.contains("dark") &&
          currentScript instanceof HTMLScriptElement &&
          currentScript.parentElement === document.head &&
          currentScript.textContent === bootstrapScript &&
          performance.getEntriesByName("theme-bootstrap-applied").length === 0
        ) {
          performance.mark("theme-bootstrap-applied");
        }
        return result;
      };
    },
    { bootstrapScript: themeInitializationScript, key: themeStorageKey },
  );

  await page.goto("/en/");
  const immediateTheme = await page.locator("html").evaluate((html) => ({
    dark: html.classList.contains("dark"),
    colorScheme: html.style.colorScheme,
  }));
  const firstContentfulPaint = await page.evaluate(async () => {
    const current = performance.getEntriesByName("first-contentful-paint")[0];
    if (current) return current.startTime;

    return new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entry = list
          .getEntries()
          .find(({ name }) => name === "first-contentful-paint");
        if (entry) {
          observer.disconnect();
          resolve(entry.startTime);
        }
      });
      observer.observe({ type: "paint", buffered: true });
    });
  });
  const themeBootstrapApplied = await page.evaluate(
    () => performance.getEntriesByName("theme-bootstrap-applied")[0]?.startTime,
  );

  expect(immediateTheme).toEqual({ dark: true, colorScheme: "dark" });
  expect(themeBootstrapApplied).toBeDefined();
  expect(themeBootstrapApplied!).toBeLessThanOrEqual(firstContentfulPaint);
  await expectTheme(page, "dark", "Dark");
});

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
    page.getByRole("banner").getByText("JOBE", { exact: true }),
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
  await expect(page.getByRole("contentinfo")).toBeVisible();

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
