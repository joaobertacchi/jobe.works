import type { Page } from "@playwright/test";

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../../app/consent/consent";
import { scorecardTranslations } from "../../app/i18n/translations/scorecard";
import { expect, test as base } from "./fixtures";

const test = base.extend<{ consented: void }>({
  consented: [
    async ({ page }, use) => {
      await page.addInitScript(
        ({ key, version }) => {
          localStorage.setItem(
            key,
            JSON.stringify({
              version,
              analytics: false,
              marketing: false,
              updatedAt: "2026-01-01T00:00:00.000Z",
            }),
          );
        },
        { key: CONSENT_STORAGE_KEY, version: CONSENT_VERSION },
      );
      await use();
    },
    { auto: true },
  ],
});

const en = scorecardTranslations.en;
const pt = scorecardTranslations["pt-BR"];

function verdictHeading(page: Page, label: string) {
  return page.getByRole("heading", { level: 2, name: new RegExp(label) });
}

async function startScorecard(page: Page, startLabel: string) {
  const start = page.getByRole("button", { name: startLabel });
  await expect(start).toBeEnabled();
  await start.click();
}

async function answerAll(
  page: Page,
  keys: string[],
  positionLabel: (n: number) => string,
) {
  for (const [index, key] of keys.entries()) {
    await expect(page.getByText(positionLabel(index + 1))).toBeVisible();
    await page.keyboard.press(key);
  }
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const pageOverflow = Math.max(
      0,
      document.documentElement.scrollWidth - width,
    );
    const offenders = Array.from(document.querySelectorAll("main *"))
      .filter((element) => element.getBoundingClientRect().right > width + 1)
      .map((element) => element.tagName.toLowerCase());
    return { pageOverflow, offenders };
  });
  expect(overflow).toEqual({ pageOverflow: 0, offenders: [] });
}

test("completes the scorecard in English and offers a prefilled assessment email", async ({
  page,
}) => {
  await page.goto("/en/scorecard");
  await expect(
    page.getByRole("heading", { level: 1, name: en.intro.eyebrow }),
  ).toBeVisible();
  await startScorecard(page, en.intro.start);

  const keys = Array<string>(20).fill("1");
  keys[7] = "3"; // q08 "No" → one critical risk
  await answerAll(page, keys, (n) => `Question ${n} of 20`);

  await expect(
    verdictHeading(page, en.results.verdicts.needsAttention.label),
  ).toBeVisible();
  await expect(page.getByText(en.results.criticalBanner)).toBeVisible();
  await expect(page).toHaveURL(/#r=1\.yyyyyyynyyyyyyyyyyyy$/);

  const cta = page.getByRole("link", { name: en.results.nextStep.cta });
  const href = decodeURIComponent((await cta.getAttribute("href")) ?? "");
  expect(href).toMatch(/^mailto:contato@jobe\.works\?subject=/);
  expect(href).toContain("Score: 94/100");
});

test("completes the scorecard in Portuguese", async ({ page }) => {
  await page.goto("/pt-BR/scorecard");
  await startScorecard(page, pt.intro.start);

  await answerAll(
    page,
    Array<string>(20).fill("1"),
    (n) => `Pergunta ${n} de 20`,
  );

  await expect(
    verdictHeading(page, pt.results.verdicts.strong.label),
  ).toBeVisible();
});

test("opens a shared result link directly and can retake", async ({ page }) => {
  await page.goto("/pt-BR/scorecard#r=1.nnnnnnnnnnnnnnnnnnnn");

  await expect(
    verdictHeading(page, pt.results.verdicts.highRisk.label),
  ).toBeVisible();
  await page.getByRole("button", { name: pt.results.retake }).click();
  await expect(
    page.getByRole("button", { name: pt.intro.start }),
  ).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
});

test("navigates from the home hero to the scorecard", async ({ page }) => {
  await page.goto("/en/");
  await page
    .getByRole("link", { name: /Take the Production Readiness Check/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/en\/scorecard$/);
  await expect(
    page.getByRole("button", { name: en.intro.start }),
  ).toBeVisible();
});

test("renders results in their final state with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/scorecard#r=1.yyyyyyyyyyypyyyyyyyy");

  await expect(
    verdictHeading(page, en.results.verdicts.strong.label),
  ).toBeVisible();
  const animation = await page
    .locator(".rs-reveal")
    .first()
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
});

test("fits a narrow phone without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/pt-BR/scorecard");
  await startScorecard(page, pt.intro.start);
  await expect(page.getByText("Pergunta 1 de 20")).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto("/pt-BR/scorecard#r=1.nupnupnupnupnupnupnu");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: pt.results.findingsTitle }),
  ).toBeVisible();
  await expectNoHorizontalScroll(page);
});
