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

test("fresh visit follows an emulated light preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");

  expect(await storedTheme(page)).toBeNull();
  await expectTheme(page, "light", "Light");
});

test("fresh visit follows an emulated dark preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/");

  expect(await storedTheme(page)).toBeNull();
  await expectTheme(page, "dark", "Dark");
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

test("the switcher follows live media changes until an explicit mode ignores them", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");
  await expectTheme(page, "light", "Light");

  await page.emulateMedia({ colorScheme: "dark" });
  await expectTheme(page, "dark", "Dark");
  expect(await storedTheme(page)).toBeNull();

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
  await expectTheme(page, "dark", "Dark");
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
    .getByRole("link", { name: "Book an Initial Assessment" })
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
  await expect(theme.getByRole("button")).toHaveCount(2);
  await expect(theme.getByRole("button", { name: "Light" })).toBeVisible();
  await expect(theme.getByRole("button", { name: "Dark" })).toBeVisible();
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

test("the Folded Atlas preserves its systems route on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "consent",
      JSON.stringify({
        version: 1,
        analytics: false,
        marketing: false,
        updatedAt: "2026-08-27T00:00:00.000Z",
      }),
    );
  });
  await page.goto("/en/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Engineering that Works" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "From product context to production",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Book an Initial Assessment" }).first(),
  ).toBeVisible();

  const planeTops = await page
    .locator(".atlas-proposition, .atlas-topology-panel, .atlas-decision-rail")
    .evaluateAll((planes) =>
      planes.map((plane) => Math.round(plane.getBoundingClientRect().top)),
    );

  expect(planeTops[1]).toBeGreaterThan(planeTops[0]);
  expect(planeTops[2]).toBeGreaterThan(planeTops[1]);
  const crossRoute = page.locator(".atlas-cross-route");
  await expect(crossRoute).toBeVisible();
  await expect(crossRoute.locator("path")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the hero cross-route runs clear corridors and docks at the primary action on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");

  const route = page.locator(".atlas-cross-route");
  await expect(route.locator("path")).toHaveCount(2);

  const geometry = await page.evaluate(() => {
    const hero = document.querySelector(".atlas-hero");
    const paths = [
      ...document.querySelectorAll<SVGPathElement>(".atlas-cross-route path"),
    ];
    const plate = document.querySelector(
      ".atlas-decision-rail .atlas-action--primary",
    );
    const junction = document.querySelector(".systems-topology__junction");
    const method = document.querySelector(".atlas-proposition__method");
    const description = document.querySelector(
      ".atlas-proposition__description",
    );
    const stations = [...document.querySelectorAll(".systems-topology__node")];
    if (
      !hero ||
      paths.length !== 2 ||
      !plate ||
      !junction ||
      !method ||
      !description
    ) {
      return null;
    }

    const heroBox = hero.getBoundingClientRect();
    const plateBox = plate.getBoundingClientRect();
    const methodBox = method.getBoundingClientRect();
    const descriptionBox = description.getBoundingClientRect();
    const relative = (box: DOMRect) => ({
      left: box.left - heroBox.left,
      right: box.right - heroBox.left,
      top: box.top - heroBox.top,
      bottom: box.bottom - heroBox.top,
    });

    const obstacles = [
      ...stations.map((station) => relative(station.getBoundingClientRect())),
      relative(descriptionBox),
      relative(methodBox),
    ].map((box) => ({
      left: box.left - 2,
      right: box.right + 2,
      top: box.top - 2,
      bottom: box.bottom + 2,
    }));
    const junctionBox = relative(junction.getBoundingClientRect());
    const junctionInterior = {
      left: junctionBox.left + 3,
      right: junctionBox.right - 3,
      top: junctionBox.top + 3,
      bottom: junctionBox.bottom - 3,
    };

    const samples = paths.flatMap((path) =>
      Array.from({ length: 160 }, (_, index) =>
        path.getPointAtLength((path.getTotalLength() * index) / 159),
      ),
    );
    const insideBox = (
      point: { x: number; y: number },
      box: { left: number; right: number; top: number; bottom: number },
    ) =>
      point.x > box.left &&
      point.x < box.right &&
      point.y > box.top &&
      point.y < box.bottom;
    const rectDistance = (
      point: { x: number; y: number },
      box: { left: number; right: number; top: number; bottom: number },
    ) =>
      Math.hypot(
        Math.max(box.left - point.x, 0, point.x - box.right),
        Math.max(box.top - point.y, 0, point.y - box.bottom),
      );

    const endPoint = paths[1].getPointAtLength(paths[1].getTotalLength());
    const startPoint = paths[0].getPointAtLength(0);
    const entryEnd = paths[0].getPointAtLength(paths[0].getTotalLength());
    const junctionCenterY =
      junctionBox.top + (junctionBox.bottom - junctionBox.top) / 2;

    return {
      start: { x: startPoint.x, y: startPoint.y },
      end: { x: endPoint.x, y: endPoint.y },
      plateTop: plateBox.top - heroBox.top,
      plateLeft: plateBox.left - heroBox.left,
      methodTop: methodBox.top - heroBox.top,
      descriptionBottom: descriptionBox.bottom - heroBox.top,
      minJunctionDistance: Math.min(
        ...samples.map((point) => rectDistance(point, junctionBox)),
      ),
      junctionDockYDelta: Math.abs(entryEnd.y - junctionCenterY),
      junctionInteriorSamples: samples.filter((point) =>
        insideBox(point, junctionInterior),
      ).length,
      blockedSamples: samples.filter((point) =>
        obstacles.some((box) => insideBox(point, box)),
      ).length,
    };
  });

  if (!geometry) throw new Error("Cross-route geometry was not measured");

  expect(geometry.blockedSamples).toBe(0);
  expect(geometry.junctionInteriorSamples).toBe(0);
  expect(geometry.junctionDockYDelta).toBeLessThanOrEqual(2);
  expect(geometry.minJunctionDistance).toBeLessThanOrEqual(3);
  expect(
    Math.abs(geometry.start.y - (geometry.methodTop - 28)),
  ).toBeLessThanOrEqual(2);
  expect(geometry.start.y).toBeGreaterThan(geometry.descriptionBottom);
  expect(Math.abs(geometry.end.y - geometry.plateTop)).toBeLessThanOrEqual(2);
  expect(geometry.end.x).toBeGreaterThanOrEqual(geometry.plateLeft);
  expect(geometry.end.x).toBeLessThanOrEqual(geometry.plateLeft + 80);
});

test("every topology route terminates on a plate edge without dangling or hidden ends", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");

  const wiring = await page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>(
      ".systems-topology--desktop",
    );
    if (!svg) return null;

    const secondaryPaths = [
      ...svg.querySelectorAll<SVGPathElement>(
        ".systems-topology__secondary-routes path",
      ),
    ];
    const plates = [
      ...svg.querySelectorAll<SVGPathElement>(".systems-topology__node path"),
    ];
    const junctionPath = svg.querySelector<SVGPathElement>(
      ".systems-topology__junction path",
    );
    const destinationCircle = svg.querySelector<SVGCircleElement>(
      ".systems-topology__destination circle",
    );
    const primaryPaths = [
      ...svg.querySelectorAll<SVGPathElement>(
        ".systems-topology__primary-route path",
      ),
    ];
    if (
      secondaryPaths.length !== 6 ||
      plates.length !== 6 ||
      !junctionPath ||
      !destinationCircle ||
      primaryPaths.length !== 1
    ) {
      return null;
    }

    const toScreen = (element: SVGGraphicsElement, point: DOMPointInit) => {
      const matrix = element.getScreenCTM();
      if (!matrix) return null;
      const mapped = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return { x: mapped.x, y: mapped.y };
    };
    const distance = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) => Math.hypot(a.x - b.x, a.y - b.y);

    const sampleOutline = (element: SVGGeometryElement) => {
      const total = element.getTotalLength();
      return Array.from({ length: 120 }, (_, index) =>
        toScreen(element, element.getPointAtLength((total * index) / 119)),
      ).filter((point): point is { x: number; y: number } => point !== null);
    };

    const plateOutlines = plates.map((plate) => sampleOutline(plate));
    const junctionOutline = sampleOutline(junctionPath);
    const dockTolerance = 3;

    const nearest = (
      point: { x: number; y: number },
      outlines: { x: number; y: number }[][],
    ) =>
      Math.min(
        ...outlines.flatMap((outline) =>
          outline.map((sample) => distance(point, sample)),
        ),
      );

    const secondaryWiring = secondaryPaths.map((path) => {
      const endpoints = [0, path.getTotalLength()].map((offset) => {
        const point = toScreen(path, path.getPointAtLength(offset));
        if (!point) return null;
        const junctionDistance = nearest(point, [junctionOutline]);
        const plateDistances = plateOutlines.map((outline) =>
          nearest(point, [outline]),
        );
        const plateIndex = plateDistances.indexOf(Math.min(...plateDistances));
        return {
          junctionDistance,
          plateIndex,
          plateDistance: plateDistances[plateIndex],
        };
      });
      if (endpoints.some((endpoint) => endpoint === null)) return null;
      const [start, end] = endpoints as NonNullable<
        (typeof endpoints)[number]
      >[];
      const startOnJunction = start.junctionDistance <= dockTolerance;
      const endOnJunction = end.junctionDistance <= dockTolerance;
      const docked = startOnJunction ? end : start;
      return {
        spansPlateToJunction:
          startOnJunction !== endOnJunction &&
          docked.plateDistance <= dockTolerance,
        dockedPlateIndex: docked.plateIndex,
      };
    });

    const measureProductionDock = () => {
      const productionPath = primaryPaths[0];
      const productionEnd = toScreen(
        productionPath,
        productionPath.getPointAtLength(productionPath.getTotalLength()),
      );
      const destinationCenter = toScreen(destinationCircle, {
        x: destinationCircle.cx.baseVal.value,
        y: destinationCircle.cy.baseVal.value,
      });
      const destinationScale = destinationCircle.getScreenCTM()?.a ?? 0;
      if (!productionEnd || !destinationCenter) return null;
      return Math.abs(
        distance(productionEnd, destinationCenter) - 26 * destinationScale,
      );
    };

    const measureMaxDotDrift = () => {
      const routeSamples = [...secondaryPaths, ...primaryPaths].flatMap(
        (path) => sampleOutline(path),
      );
      const anchors = [...plateOutlines, junctionOutline, routeSamples];
      const drifts = [
        ...svg.querySelectorAll<SVGCircleElement>(
          ".systems-topology__junction-dots circle",
        ),
      ].map((circle) => {
        const center = toScreen(circle, {
          x: circle.cx.baseVal.value,
          y: circle.cy.baseVal.value,
        });
        return center ? nearest(center, anchors) : Number.POSITIVE_INFINITY;
      });
      return Math.max(...drifts);
    };

    return {
      secondaryWiring,
      dockedPlates: new Set(
        secondaryWiring.flatMap((wiring) =>
          wiring ? [wiring.dockedPlateIndex] : [],
        ),
      ).size,
      productionDock: measureProductionDock(),
      maxDotDrift: measureMaxDotDrift(),
    };
  });

  if (!wiring) throw new Error("Topology wiring was not measured");

  expect(
    wiring.secondaryWiring.every((route) => route?.spansPlateToJunction),
  ).toBe(true);
  expect(wiring.dockedPlates).toBe(6);
  expect(wiring.productionDock).toBeLessThanOrEqual(3);
  expect(wiring.maxDotDrift).toBeLessThanOrEqual(3);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);

  const mobileDots = await page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>(
      ".systems-topology--mobile",
    );
    if (!svg) return null;

    const toScreen = (element: SVGGraphicsElement, point: DOMPointInit) => {
      const matrix = element.getScreenCTM();
      if (!matrix) return null;
      const mapped = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return { x: mapped.x, y: mapped.y };
    };
    const distance = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) => Math.hypot(a.x - b.x, a.y - b.y);
    const sampleOutline = (element: SVGGeometryElement) => {
      const total = element.getTotalLength();
      return Array.from({ length: 120 }, (_, index) =>
        toScreen(element, element.getPointAtLength((total * index) / 119)),
      ).filter((point): point is { x: number; y: number } => point !== null);
    };

    const anchors = [
      ...svg.querySelectorAll<SVGGeometryElement>("path"),
      ...svg.querySelectorAll<SVGCircleElement>(
        ".systems-topology__mobile-destination circle",
      ),
    ].flatMap((element) => sampleOutline(element));
    const dots = [
      ...svg.querySelectorAll<SVGCircleElement>(
        ".systems-topology__junction-dots circle",
      ),
    ];
    const drifts = dots.map((circle) => {
      const center = toScreen(circle, {
        x: circle.cx.baseVal.value,
        y: circle.cy.baseVal.value,
      });
      if (!center) return Number.POSITIVE_INFINITY;
      return Math.min(...anchors.map((sample) => distance(center, sample)));
    });
    const diagnosisPaths = svg.querySelectorAll<SVGPathElement>(
      ".systems-topology__mobile-diagnosis > path",
    );
    const underline = diagnosisPaths[diagnosisPaths.length - 1];
    const underlineStroke = underline
      ? getComputedStyle(underline).stroke
      : null;

    return {
      count: dots.length,
      maxDrift: Math.max(...drifts),
      underlineStroke,
    };
  });

  if (!mobileDots) throw new Error("Mobile topology dots were not measured");

  expect(mobileDots.count).toBe(17);
  expect(mobileDots.maxDrift).toBeLessThanOrEqual(3);
  expect(mobileDots.underlineStroke).not.toBe("rgb(255, 255, 255)");

  const mobileFlow = await page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>(
      ".systems-topology--mobile",
    );
    if (!svg) return null;

    const toScreen = (element: SVGGraphicsElement, point: DOMPointInit) => {
      const matrix = element.getScreenCTM();
      if (!matrix) return null;
      const mapped = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return { x: mapped.x, y: mapped.y };
    };
    const distance = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) => Math.hypot(a.x - b.x, a.y - b.y);
    const sampleOutline = (element: SVGGeometryElement) => {
      const total = element.getTotalLength();
      return Array.from({ length: 120 }, (_, index) =>
        toScreen(element, element.getPointAtLength((total * index) / 119)),
      ).filter((point): point is { x: number; y: number } => point !== null);
    };

    const dashed = [
      ...svg.querySelectorAll<SVGPathElement>(
        ".systems-topology__secondary-routes path",
      ),
    ];
    const plates = [
      ...svg.querySelectorAll<SVGPathElement>(
        ".systems-topology__mobile-station path",
      ),
    ];
    const hub = svg.querySelector<SVGPathElement>(
      ".systems-topology__mobile-diagnosis > path",
    );
    if (dashed.length !== 3 || plates.length !== 3 || !hub) return null;

    const hubOutline = sampleOutline(hub);
    const plateOutlines = plates.map((plate) => sampleOutline(plate));

    const routes = dashed.map((path) => {
      const endpoints = [0, path.getTotalLength()].map((offset) =>
        toScreen(path, path.getPointAtLength(offset)),
      );
      if (endpoints.some((endpoint) => endpoint === null)) return null;
      const [start, end] = endpoints as NonNullable<
        (typeof endpoints)[number]
      >[];
      const distances = [start, end].map((point) => ({
        hub: Math.min(...hubOutline.map((sample) => distance(point, sample))),
        plate: Math.min(
          ...plateOutlines.flatMap((outline) =>
            outline.map((sample) => distance(point, sample)),
          ),
        ),
      }));
      const startOnHub = distances[0].hub <= 3;
      const endOnHub = distances[1].hub <= 3;
      return {
        spansPlateToHub:
          startOnHub !== endOnHub &&
          (startOnHub ? distances[1].plate <= 3 : distances[0].plate <= 3),
      };
    });

    const dashedSamples = dashed.flatMap((path) => sampleOutline(path));
    const hubBox = hub.getBoundingClientRect();
    const exitY = hubBox.top + hubBox.height / 2;
    const hubRight = hubBox.right;
    const exitCorridorSamples = dashedSamples.filter(
      (point) => point.x > hubRight - 2 && Math.abs(point.y - exitY) <= 5,
    ).length;

    const leg = svg.querySelector<SVGPathElement>(
      ".systems-topology__mobile-route",
    );
    const destination = svg.querySelector<SVGCircleElement>(
      ".systems-topology__mobile-destination circle",
    );
    let productionLegDock: number | null = null;
    if (leg && destination) {
      const legEnd = toScreen(leg, leg.getPointAtLength(leg.getTotalLength()));
      const destinationOutline = sampleOutline(destination);
      productionLegDock =
        legEnd && destinationOutline.length > 0
          ? Math.min(
              ...destinationOutline.map((sample) => distance(legEnd, sample)),
            )
          : null;
    }

    return {
      routes,
      exitCorridorSamples,
      productionLegDock,
    };
  });

  if (!mobileFlow) throw new Error("Mobile flow routes were not measured");

  expect(mobileFlow.routes.every((route) => route?.spansPlateToHub)).toBe(true);
  expect(mobileFlow.exitCorridorSamples).toBe(0);
  expect(mobileFlow.productionLegDock).not.toBeNull();
  expect(
    mobileFlow.productionLegDock ?? Number.POSITIVE_INFINITY,
  ).toBeLessThanOrEqual(3);
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
