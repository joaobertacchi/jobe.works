# Founder Portrait on About Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show João's portrait in the "O fundador / The founder" section of `/pt-BR/about` and `/en/about`, light to download and drawn in the Folded Atlas language.

**Architecture:** The portrait is cropped and compressed once, offline, with ImageMagick into six committed derivatives (AVIF + WebP at 320/480/640 px wide). The route imports them through Vite so they ship as content-hashed `/assets/*` files (ADR 020), rendered with `<picture>` + `srcset`/`sizes` inside a `<figure>` whose frame uses the existing chamfered-plate geometry. Copy (alt text, caption) lives in the typed `about` dictionary for both locales.

**Tech Stack:** React Router route module, Vite asset imports, Tailwind + `app/app.css` atlas tokens, ImageMagick 7 (local tool, not an npm dependency), Vitest + Testing Library, Playwright.

**Spec:** User request (2026-10-08): "planejar como integrar minha foto em Sobre. Cuidar para que a imagem seja leve e se integre bem com o site." Source image: `~/Library/CloudStorage/Nextcloud-…/Documents/profissional/profile/ia_created/Visual corporativo moderno/Gemini_Generated_Image_3kd5te3kd5te3kd5.png` (2048×2048 PNG, 5.4 MB).

## Global Constraints

- Assets imported from `app/assets/`, never `public/` (ADR 020); production filenames are content-hashed and checked by `finalizeStaticBuild` (`/assets/<name>-<8 chars>.<ext>`).
- No new npm dependency, no runtime image service (ADR 020, ADR 023). ImageMagick is used only by a human/agent to regenerate derivatives.
- All user-facing strings (alt, caption) in `app/i18n/translations/about.ts` for `en` and `pt-BR`.
- Folded Atlas rules (DESIGN.md): notched corners via `--atlas-chamfer`, 1px `--atlas-blue` rim, no `box-shadow`, no rounded corners, no gradients, no blur.
- Weight budget: every derivative ≤ 24 KB; the browser downloads exactly one (AVIF in modern browsers, ≈ 11–17 KB at the sizes used).
- Unique page composition stays in the route (AGENTS.md); no new shared component.
- Node from `.nvmrc`; `npm run check` and `npm run test:e2e` must pass; run the architecture review at the end.

## Measured Inputs (from planning)

- Crop `1520x1900+200+60` (4:5) keeps head-to-wrist framing and **excludes the Gemini sparkle mark** in the bottom-right corner (≈ x 1780–1870, y 1780–1880).
- Sizes at those settings: AVIF q50 — 320w 6.4 KB, 480w 11.3 KB, 640w 16.5 KB; WebP q72 — 320w 8.7 KB, 480w 15.2 KB, 640w 22.3 KB.

## Review Focus

- **Phone width (≈ 360–390 px):** portrait must not cause horizontal scroll and should not dominate the screen; expect ≤ 20rem wide, centered-left above the founder text. Pinned by the Task 3 e2e test.
- **Desktop:** portrait sits beside the founder text, ≈ 15rem wide, text column stays readable. Pinned by the Task 3 e2e test (rendered width).
- **Dark theme:** the blue rim and caption stay visible on the dark canvas; no white box behind the photo. Pinned by the Task 3 e2e screenshot-free check of the rim's computed color differing from the canvas.
- **Layout shift:** the image reserves its box before loading (`width`/`height` + `aspect-ratio`). Pinned by the Task 2 unit test asserting the attributes.
- **Locale switch:** alt text and caption follow the locale. Pinned by the Task 2 unit test in both locales.

---

### Task 1: Generate and commit the portrait derivatives

**Files:**
- Create: `app/assets/images/founder/joao-bertacchi-{320,480,640}.avif`
- Create: `app/assets/images/founder/joao-bertacchi-{320,480,640}.webp`
- Create: `tests/assets/founder-portrait-budget.test.ts`

**Interfaces:**
- Produces: the six files above, each 4:5 (320×400, 480×600, 640×800), metadata stripped.

- [ ] **Step 1: Write the failing budget test**

```ts
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const directory = join(process.cwd(), "app/assets/images/founder");
const expected = [320, 480, 640].flatMap((width) =>
  ["avif", "webp"].map((format) => `joao-bertacchi-${width}.${format}`),
);

describe("founder portrait derivatives", () => {
  it("ships exactly the expected widths and formats", () => {
    expect(readdirSync(directory).sort()).toEqual([...expected].sort());
  });

  it.each(expected)("keeps %s within the 24 KB budget", (file) => {
    expect(statSync(join(directory, file)).size).toBeLessThanOrEqual(24_576);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/assets/founder-portrait-budget.test.ts`
Expected: FAIL with `ENOENT` for `app/assets/images/founder`.

- [ ] **Step 3: Generate the derivatives**

```bash
SRC="$HOME/Library/CloudStorage/Nextcloud-nextcloud.jebertacchi.eng.br-JoãoEduardoFerreiraBertacchi/Documents/profissional/profile/ia_created/Visual corporativo moderno/Gemini_Generated_Image_3kd5te3kd5te3kd5.png"
OUT=app/assets/images/founder
mkdir -p "$OUT"
magick "$SRC" -crop 1520x1900+200+60 +repage -strip -colorspace sRGB /tmp/founder-crop.png
for w in 320 480 640; do
  magick /tmp/founder-crop.png -resize "${w}x" -strip -quality 50 "$OUT/joao-bertacchi-$w.avif"
  magick /tmp/founder-crop.png -resize "${w}x" -strip -quality 72 "$OUT/joao-bertacchi-$w.webp"
done
rm /tmp/founder-crop.png
```

Open `app/assets/images/founder/joao-bertacchi-640.webp` and confirm visually: face and glasses sharp, no sparkle mark in any corner, no banding on the white shirt. If banding appears in AVIF, raise AVIF quality to 58 and re-check the budget.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/assets/founder-portrait-budget.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add app/assets/images/founder tests/assets/founder-portrait-budget.test.ts
git commit -m "feat(about): add compressed founder portrait derivatives"
```

### Task 2: Render the portrait in the founder section

**Files:**
- Modify: `app/i18n/translations/about.ts` (type at lines 13-19, `en` at 54-64, `pt-BR` at 108-118)
- Modify: `app/routes/$locale.about.tsx` (founder section)
- Modify: `app/app.css` (append `.atlas-portrait` rules near `.atlas-plate`, ≈ line 1436)
- Test: `app/routes/$locale.test.tsx`

**Interfaces:**
- Consumes: the six files from Task 1.
- Produces: `<figure class="atlas-portrait">` containing `<picture>` and `<figcaption>`; dictionary keys `about.sections.founder.portraitAlt` and `about.sections.founder.portraitCaption`.

- [ ] **Step 1: Write the failing unit tests** in `app/routes/$locale.test.tsx`, next to the existing About rendering tests (reuse the file's existing render helper for `/en/about` and `/pt-BR/about`):

```tsx
it.each([
  ["en", "Portrait of João Bertacchi in a white shirt and glasses", "João Bertacchi · Founder"],
  ["pt-BR", "Retrato de João Bertacchi de camisa branca e óculos", "João Bertacchi · Fundador"],
] as const)("shows the founder portrait in %s", async (locale, alt, caption) => {
  renderRoute(`/${locale}/about`);

  const image = await screen.findByRole("img", { name: alt });
  expect(image).toHaveAttribute("width", "480");
  expect(image).toHaveAttribute("height", "600");
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image).toHaveAttribute("decoding", "async");
  expect(image.closest("figure")).toHaveTextContent(caption);

  const sources = image.closest("picture")!.querySelectorAll("source");
  expect([...sources].map((source) => source.type)).toEqual([
    "image/avif",
    "image/webp",
  ]);
  expect(sources[0].srcset).toMatch(/320w.*480w.*640w/);
});
```

(`renderRoute` stands for whatever helper the file already uses to render `About` at a locale path — read the top of the file and use that exact helper name.)

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run 'app/routes/$locale.test.tsx'`
Expected: FAIL — typecheck/dictionary miss or "Unable to find role img".

- [ ] **Step 3: Add the copy.** In the `founder` type add `portraitAlt: string; portraitCaption: string;`. In `en.sections.founder` add:

```ts
        portraitAlt: "Portrait of João Bertacchi in a white shirt and glasses",
        portraitCaption: "João Bertacchi · Founder",
```

In `pt-BR.sections.founder` add:

```ts
        portraitAlt: "Retrato de João Bertacchi de camisa branca e óculos",
        portraitCaption: "João Bertacchi · Fundador",
```

- [ ] **Step 4: Render it.** At the top of `app/routes/$locale.about.tsx` add:

```tsx
import portraitAvif320 from "../assets/images/founder/joao-bertacchi-320.avif";
import portraitAvif480 from "../assets/images/founder/joao-bertacchi-480.avif";
import portraitAvif640 from "../assets/images/founder/joao-bertacchi-640.avif";
import portraitWebp320 from "../assets/images/founder/joao-bertacchi-320.webp";
import portraitWebp480 from "../assets/images/founder/joao-bertacchi-480.webp";
import portraitWebp640 from "../assets/images/founder/joao-bertacchi-640.webp";

const portraitSizes = "(min-width: 48rem) 15rem, min(20rem, 100vw - 2.5rem)";
const portraitAvifSet = `${portraitAvif320} 320w, ${portraitAvif480} 480w, ${portraitAvif640} 640w`;
const portraitWebpSet = `${portraitWebp320} 320w, ${portraitWebp480} 480w, ${portraitWebp640} 640w`;
```

Replace the founder `<section>` with:

```tsx
          <section className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-8">
            <figure className="atlas-portrait">
              <picture className="atlas-portrait__frame">
                <source sizes={portraitSizes} srcSet={portraitAvifSet} type="image/avif" />
                <source sizes={portraitSizes} srcSet={portraitWebpSet} type="image/webp" />
                <img
                  alt={translate("about.sections.founder.portraitAlt")}
                  decoding="async"
                  height={600}
                  loading="lazy"
                  sizes={portraitSizes}
                  src={portraitWebp480}
                  srcSet={portraitWebpSet}
                  width={480}
                />
              </picture>
              <figcaption className="atlas-portrait__caption">
                {translate("about.sections.founder.portraitCaption")}
              </figcaption>
            </figure>
            <div className="flex flex-col gap-3">
              <Heading as="h2" level="section">
                {translate("about.sections.founder.title")}
              </Heading>
              {founderParagraphs.map((paragraph) => (
                <Text key={paragraph} tone="muted">
                  {paragraph}
                </Text>
              ))}
            </div>
          </section>
```

If TypeScript rejects the `.avif`/`.webp` imports, confirm `vite/client` types are referenced (React Router templates include them via `.react-router/types` / `tsconfig` `types`); add `"vite/client"` to `compilerOptions.types` only if missing.

- [ ] **Step 5: Style it.** Append to `app/app.css` after the `.atlas-plate` block:

```css
.atlas-portrait {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(20rem, 100%);
  margin: 0;
}

.atlas-portrait__frame {
  display: block;
  padding: 1px;
  background: var(--atlas-blue);
  clip-path: var(--atlas-plate-clip);
}

.atlas-portrait__frame img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  background: var(--atlas-wash);
  clip-path: var(--atlas-plate-clip);
}

.atlas-portrait__caption {
  color: var(--muted-foreground);
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (min-width: 48rem) {
  .atlas-portrait {
    width: 100%;
  }
}
```

Before writing, `grep -n "\-\-muted-foreground\|\-\-font-display\|\-\-atlas-blue:" app/app.css` and use the token names that actually exist (the muted text token may be named differently; reuse what `Text tone="muted"` uses).

- [ ] **Step 6: Run the tests**

Run: `npx vitest run 'app/routes/$locale.test.tsx'`
Expected: PASS, including both new cases.

- [ ] **Step 7: Full gate**

Run: `npm run check`
Expected: PASS. `finalizeStaticBuild` validates the `<img src>` is a hashed `/assets/joao-bertacchi-480-<hash>.webp` that exists.

- [ ] **Step 8: Commit**

```bash
git add app/i18n/translations/about.ts 'app/routes/$locale.about.tsx' app/app.css 'app/routes/$locale.test.tsx'
git commit -m "feat(about): show founder portrait in a chamfered atlas plate"
```

### Task 3: Browser behavior and design record

**Files:**
- Create: `tests/e2e/about-portrait.spec.ts`
- Modify: `DESIGN.md` (new `### Founder Portrait` under `## Components`, after `### Case (StockCast)`)

- [ ] **Step 1: Write the e2e tests**

```ts
import { expect, test } from "@playwright/test";

test("loads a modern-format founder portrait beside the text on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/pt-BR/about");
  const image = page.getByRole("img", { name: /Retrato de João Bertacchi/ });
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
    .toBeGreaterThan(0);
  expect(await image.evaluate((node: HTMLImageElement) => node.currentSrc)).toMatch(/\.avif$/);
  const box = (await image.boundingBox())!;
  expect(box.width).toBeGreaterThan(200);
  expect(box.width).toBeLessThanOrEqual(260);
  const heading = (await page.getByRole("heading", { name: "O fundador" }).boundingBox())!;
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
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
});

test("keeps the blue rim distinct from the canvas in dark theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/about");
  const [rim, canvas] = await page.evaluate(() => [
    getComputedStyle(document.querySelector(".atlas-portrait__frame")!).backgroundColor,
    getComputedStyle(document.body).backgroundColor,
  ]);
  expect(rim).not.toBe(canvas);
});
```

Check `tests/e2e/scorecard.spec.ts` for how existing tests toggle dark theme (media emulation vs. the `theme` localStorage key) and follow that pattern if `emulateMedia` alone does not switch the `.dark` class.

- [ ] **Step 2: Run them**

Run: `npm run test:e2e -- about-portrait`
Expected: PASS (3 tests). Then run `npm run test:e2e` — all pass.

- [ ] **Step 3: Visual check** at 360 px and 1280 px, light and dark (`npm run build && npm run preview`, open `/pt-BR/about`): rim follows the notched corners, caption aligns with the image's left edge, no white halo inside the rim.

- [ ] **Step 4: Document the treatment in DESIGN.md**

```markdown
### Founder Portrait

`.atlas-portrait` on About: a 4:5 photograph inside a chamfered plate — 1px `--atlas-blue` rim, `--atlas-plate-clip` notches, no shadow or rounding — with a Barlow uppercase caption (name · role). It sits beside the founder text at ≥48rem (15rem column) and above it on phones (≤20rem). Derivatives are AVIF + WebP at 320/480/640w, each ≤24 KB, generated offline with ImageMagick from the original and imported through Vite; never place photographs in `public/`.
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/about-portrait.spec.ts DESIGN.md
git commit -m "test(about): pin founder portrait layout and document treatment"
```

- [ ] **Step 6: Architecture review** (AGENTS.md completion step 5) and fix high/medium findings.
