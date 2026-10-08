import { expect, test } from "./fixtures";

function relativeLuminance(oklch: string): number {
  const match = oklch.match(
    /oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)(?:\s*\/[^)]*)?\)/,
  );
  if (!match) throw new Error(`Unsupported color value: ${oklch}`);

  const lightness = Number(match[1]) / (match[2] ? 100 : 1);
  const chroma = Number(match[3]);
  const hue = (Number(match[4]) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const red = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const green = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const blue = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test("mobile atlas keeps the indexed decision sequence and diagnosis geometry visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");

  await expect(page.locator(".atlas-mobile-primary")).toBeVisible();
  await expect(
    page.locator(".atlas-decision-rail .atlas-action--primary"),
  ).toBeVisible();
  await expect(
    page.locator(".atlas-decision-rail .atlas-action--secondary"),
  ).toBeVisible();

  const diagnosis = page.locator(".atlas-method-stop.is-diagnosis");
  const diagnosisNode = diagnosis.locator(".atlas-method-stop__node");
  await expect(diagnosis).toBeVisible();
  await expect(diagnosisNode).toBeVisible();
  const geometry = await diagnosis.evaluate((element) => {
    const node = element.querySelector<HTMLElement>(".atlas-method-stop__node");
    if (!node) throw new Error("Diagnosis route node is missing");

    const cardRect = element.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    return {
      cardLeft: cardRect.left,
      nodeLeft: nodeRect.left,
      nodeRight: nodeRect.right,
    };
  });

  expect(geometry.nodeLeft).toBeLessThan(geometry.cardLeft);
  expect(geometry.nodeRight).toBeGreaterThan(geometry.cardLeft);

  const serviceHeadingOffsets = await page
    .locator(".atlas-service-stop h3")
    .evaluateAll((headings) =>
      headings.map((heading) => heading.getBoundingClientRect().left),
    );
  expect(
    Math.max(...serviceHeadingOffsets) - Math.min(...serviceHeadingOffsets),
  ).toBeLessThan(1);
});

test("method section headings never run into their description", async ({
  page,
}) => {
  for (const width of [900, 1152, 1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/pt-BR/", "/en/", "/pt-BR/services", "/en/services"]) {
      await page.goto(path);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const layout = await page.evaluate(() => ({
        fits: document.documentElement.scrollWidth <= window.innerWidth,
        headings: [...document.querySelectorAll(".atlas-section__heading")].map(
          (heading) => {
            const title = heading.querySelector("h2");
            const description = heading.querySelector("p");
            if (!title || !description) throw new Error("Incomplete heading");
            const ink = document.createRange();
            ink.selectNodeContents(title);
            const titleRect = title.getBoundingClientRect();
            const descriptionRect = description.getBoundingClientRect();
            return {
              inkRight: ink.getBoundingClientRect().right,
              descriptionLeft: descriptionRect.left,
              sameRow: descriptionRect.top < titleRect.bottom,
            };
          },
        ),
      }));

      expect(layout.fits, `${path} @ ${width}px`).toBe(true);
      for (const heading of layout.headings) {
        if (!heading.sameRow) continue;
        expect(heading.inkRight, `${path} @ ${width}px`).toBeLessThanOrEqual(
          heading.descriptionLeft,
        );
      }
    }
  }
});

test("diagnosis stop keeps its index and node above its highlight and route", async ({
  page,
}) => {
  for (const [width, path] of [
    [1440, "/en/"],
    [1440, "/en/services"],
    [390, "/en/"],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const diagnosis = page.locator(".atlas-method-stop.is-diagnosis");
    await diagnosis.scrollIntoViewIfNeeded();
    await expect(diagnosis.locator(".atlas-method-stop__index")).toHaveText(
      "02",
    );

    const visibility = await diagnosis.evaluate((stop) => {
      const index = stop.querySelector<HTMLElement>(
        ".atlas-method-stop__index",
      );
      const node = stop.querySelector<HTMLElement>(".atlas-method-stop__node");
      if (!index || !node) throw new Error("Diagnosis stop is incomplete");
      const hit = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const target = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return target === element || element.contains(target);
      };
      return {
        clipPath: getComputedStyle(stop).clipPath,
        indexVisible: hit(index),
        nodeOnTop: hit(node),
      };
    });

    expect(visibility.clipPath, `${path} @ ${width}px`).toBe("none");
    expect(visibility.indexVisible, `${path} @ ${width}px`).toBe(true);
    expect(visibility.nodeOnTop, `${path} @ ${width}px`).toBe(true);
  }
});

test("tablet header uses an intentional identity row and navigation row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/en/");

  const geometry = await page
    .locator(".site-header__inner")
    .evaluate((header) => {
      const wordmark = header.querySelector<HTMLElement>(".site-wordmark");
      const navigation = header.querySelector<HTMLElement>(
        ".site-primary-navigation",
      );
      const utilities = header.querySelector<HTMLElement>(".site-utilities");
      if (!wordmark || !navigation || !utilities) {
        throw new Error("Header composition is incomplete");
      }

      return {
        navigation: navigation.getBoundingClientRect().toJSON(),
        utilities: utilities.getBoundingClientRect().toJSON(),
        wordmark: wordmark.getBoundingClientRect().toJSON(),
      };
    });

  expect(geometry.navigation.top).toBeGreaterThanOrEqual(
    geometry.wordmark.bottom,
  );
  expect(
    Math.abs(geometry.navigation.left - geometry.wordmark.left),
  ).toBeLessThan(1);
  expect(Math.abs(geometry.utilities.top - geometry.wordmark.top)).toBeLessThan(
    8,
  );
});

test("compact mobile header preserves ordering without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/en/");

  const geometry = await page
    .locator(".site-header__inner")
    .evaluate((header) => {
      const wordmark = header.querySelector<HTMLElement>(".site-wordmark");
      const utilities = header.querySelector<HTMLElement>(".site-utilities");
      if (!wordmark || !utilities) {
        throw new Error("Compact header composition is incomplete");
      }

      return {
        documentFits: document.documentElement.scrollWidth <= window.innerWidth,
        utilities: utilities.getBoundingClientRect().toJSON(),
        wordmark: wordmark.getBoundingClientRect().toJSON(),
      };
    });

  expect(geometry.wordmark.right).toBeLessThan(geometry.utilities.left);
  expect(geometry.documentFits).toBe(true);
});

const responsiveHeaderViewports = [
  { height: 900, locale: "en", wrapsNavigation: false, width: 1440 },
  { height: 900, locale: "pt-BR", wrapsNavigation: true, width: 900 },
  { height: 900, locale: "en", wrapsNavigation: true, width: 488 },
  { height: 700, locale: "pt-BR", wrapsNavigation: true, width: 320 },
] as const;

test("responsive header keeps utilities aligned and wrapped navigation below the identity row", async ({
  page,
}) => {
  for (const viewport of responsiveHeaderViewports) {
    await page.setViewportSize({
      height: viewport.height,
      width: viewport.width,
    });
    await page.goto(`/${viewport.locale}/`);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const geometry = await page
      .locator(".site-header__inner")
      .evaluate((header) => {
        const wordmark = header.querySelector<HTMLElement>(".site-wordmark");
        const navigation = header.querySelector<HTMLElement>(
          ".site-primary-navigation",
        );
        const utilities = header.querySelector<HTMLElement>(".site-utilities");
        const language = header.querySelector<HTMLElement>(
          ".language-switcher .utility-link",
        );
        const cta = header.querySelector<HTMLElement>(".site-header__cta");
        if (!wordmark || !navigation || !utilities || !language || !cta) {
          throw new Error("Responsive header composition is incomplete");
        }

        const rect = (element: HTMLElement) => {
          const bounds = element.getBoundingClientRect();
          return {
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
          };
        };

        return {
          documentFits:
            document.documentElement.scrollWidth <= window.innerWidth,
          languageText: language.textContent?.trim(),
          language: rect(language),
          navigation: rect(navigation),
          cta: rect(cta),
          utilities: rect(utilities),
          wordmark: rect(wordmark),
        };
      });

    const languageCenter =
      (geometry.language.top + geometry.language.bottom) / 2;
    const ctaCenter = (geometry.cta.top + geometry.cta.bottom) / 2;
    expect(Math.abs(languageCenter - ctaCenter)).toBeLessThanOrEqual(2);
    expect(geometry.languageText).toBe(
      viewport.locale === "en" ? "Português" : "English",
    );
    expect(geometry.documentFits).toBe(true);

    if (viewport.wrapsNavigation) {
      const identityRowBottom = Math.max(
        geometry.wordmark.bottom,
        geometry.utilities.bottom,
      );
      expect(geometry.navigation.top).toBeGreaterThanOrEqual(
        identityRowBottom - 1,
      );
    } else {
      expect(geometry.navigation.top).toBeLessThan(
        Math.max(geometry.wordmark.bottom, geometry.utilities.bottom) + 1,
      );
    }
  }
});

test("responsive header keeps the rendered accent attached beneath the wordmark", async ({
  page,
}) => {
  for (const viewport of responsiveHeaderViewports) {
    await page.setViewportSize({
      height: viewport.height,
      width: viewport.width,
    });
    await page.goto(`/${viewport.locale}/`);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const wordmark = page.locator(".site-wordmark");
    const accent = wordmark.locator(".site-wordmark__accent");
    await expect(wordmark).toBeVisible();
    await expect(accent).toHaveCount(1);
    await expect(accent).toBeVisible();
    await expect(accent).toHaveAttribute("aria-hidden", "true");

    const geometry = await wordmark.evaluate((element) => {
      const accent = element.querySelector<HTMLElement>(
        ".site-wordmark__accent",
      );
      const header = element.closest<HTMLElement>(".site-header");
      const navigation = element
        .closest<HTMLElement>(".site-header__inner")
        ?.querySelector<HTMLElement>(".site-primary-navigation");
      if (!accent || !header || !navigation) {
        throw new Error("Rendered wordmark accent is incomplete");
      }

      const rect = (node: Element) => {
        const bounds = node.getBoundingClientRect();
        return {
          bottom: bounds.bottom,
          height: bounds.height,
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          width: bounds.width,
        };
      };

      return {
        accent: rect(accent),
        header: rect(header),
        navigation: rect(navigation),
        wordmark: rect(element),
      };
    });

    const tolerance = 2;
    expect(geometry.accent.width).toBeGreaterThan(0);
    expect(geometry.accent.height).toBeGreaterThan(0);
    expect(
      Math.abs(geometry.accent.left - geometry.wordmark.left),
    ).toBeLessThanOrEqual(tolerance);
    expect(
      Math.abs(geometry.accent.right - geometry.wordmark.right),
    ).toBeLessThanOrEqual(tolerance);
    expect(geometry.accent.top).toBeGreaterThanOrEqual(
      geometry.wordmark.bottom - tolerance,
    );
    expect(geometry.accent.bottom).toBeLessThanOrEqual(
      geometry.wordmark.bottom + 12,
    );
    expect(geometry.accent.bottom).toBeLessThan(
      geometry.header.bottom - tolerance,
    );

    if (viewport.wrapsNavigation) {
      expect(geometry.accent.bottom).toBeLessThanOrEqual(
        geometry.navigation.top + 4,
      );
    }
  }
});

test("dark mobile routes use the high-contrast route token", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/");

  const colors = await page.locator("html").evaluate(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const route = document.querySelector<HTMLElement>(".atlas-service-route");
    const node = document.querySelector<HTMLElement>(
      ".atlas-service-stop__node",
    );
    const description = document.querySelector<HTMLElement>(
      ".atlas-proposition__description",
    );
    if (!route || !node || !description) {
      throw new Error("Homepage route grammar is incomplete");
    }

    return {
      atlasBlue: rootStyles.getPropertyValue("--atlas-blue").trim(),
      atlasPaper: rootStyles.getPropertyValue("--atlas-paper").trim(),
      atlasRoute: rootStyles.getPropertyValue("--atlas-route").trim(),
      background: rootStyles.getPropertyValue("--background").trim(),
      descriptionBackground: getComputedStyle(description).backgroundColor,
      nodeBorder: getComputedStyle(node).borderTopColor,
      routeLine: getComputedStyle(route, "::before").backgroundColor,
    };
  });

  expect(colors.atlasRoute).not.toBe(colors.atlasBlue);
  expect(
    contrastRatio(colors.atlasRoute, colors.background),
  ).toBeGreaterThanOrEqual(3);
  expect(colors.nodeBorder).toBe(colors.routeLine);
  expect(colors.nodeBorder).not.toBe("rgba(0, 0, 0, 0)");
  expect(colors.descriptionBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(colors.atlasPaper).not.toBe("");
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} atlas palette preserves tonal hierarchy and contrast`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/en/");

    const palette = await page.locator(".home-atlas").evaluate((atlas) => {
      const element = (selector: string) => {
        const match = atlas.querySelector<HTMLElement>(selector);
        if (!match) throw new Error(`Missing palette surface: ${selector}`);
        return match;
      };
      const styles = (selector: string, pseudo?: string) =>
        getComputedStyle(element(selector), pseudo);

      return {
        actionBackground: styles(".atlas-action--secondary", "::after")
          .backgroundColor,
        actionForeground: styles(".atlas-action--secondary").color,
        canvasBackground: styles(".atlas-services").backgroundColor,
        canvasForeground: styles(".atlas-services h2").color,
        canvasMutedForeground: styles(
          ".atlas-services .atlas-section__heading > p",
        ).color,
        caseBackground: styles(".atlas-case").backgroundColor,
        caseMutedForeground: styles(
          ".atlas-case__copy > p:not(.atlas-index-name)",
        ).color,
        diagnosisBackground: styles(
          ".atlas-method-stop.is-diagnosis",
          "::before",
        ).backgroundColor,
        diagnosisForeground: styles(".atlas-method-stop.is-diagnosis h3").color,
        paperBackground: styles(".atlas-method").backgroundColor,
        routeForeground: styles(".atlas-inline-link").color,
        evidenceBackground: styles(".atlas-evidence", "::after")
          .backgroundColor,
        washBackground: styles(".atlas-decision-rail").backgroundColor,
        washForeground: styles(".atlas-decision-rail .atlas-index-name").color,
      };
    });

    const tonalSequence = [
      palette.canvasBackground,
      palette.paperBackground,
      palette.actionBackground,
      palette.washBackground,
      palette.diagnosisBackground,
    ].map(relativeLuminance);
    const expectedDirection = theme === "light" ? 1 : -1;
    for (let index = 0; index < tonalSequence.length - 1; index += 1) {
      const directionalDifference =
        (tonalSequence[index] - tonalSequence[index + 1]) * expectedDirection;
      expect(directionalDifference).toBeGreaterThan(0.005);
    }

    expect(
      contrastRatio(palette.canvasForeground, palette.canvasBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.canvasMutedForeground, palette.canvasBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.washForeground, palette.washBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.actionForeground, palette.actionBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.caseMutedForeground, palette.caseBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.diagnosisForeground, palette.diagnosisBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.routeForeground, palette.canvasBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(relativeLuminance(palette.evidenceBackground)).toBeLessThan(
      relativeLuminance(palette.caseBackground),
    );
  });
}
