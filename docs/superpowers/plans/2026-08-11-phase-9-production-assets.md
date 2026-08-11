# Phase 9 Production Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Demonstrate Vite-managed image imports, intentional stable public assets, system-font defaults, and deterministic production validation of hashed image output.

**Architecture:** The About route imports one source-controlled SVG with Vite's `?no-inline` query and renders it through a direct `<img>`. Static finalization validates every generated local image reference for file existence and requires `/assets/` application images to follow the default Vite hashed filename shape; existing `public/` files remain stable by intent.

**Tech Stack:** Vite 8, React Router Framework Mode 8, React 19, TypeScript 5.9, Node.js static-build scripts, Vitest.

---

## File Map

- Create `app/assets/images/about-workflow.svg`: representative imported application image.
- Modify `app/i18n/translations/about.ts`: typed localized alternative text.
- Modify `app/routes/$locale.about.tsx`: direct `?no-inline` image import and `<img>` rendering.
- Modify `app/routes/$locale.test.tsx`: direct-image and localized-alt behavior.
- Modify `scripts/finalize-static-build.ts`: local image existence and hashed application filename validation.
- Modify `scripts/finalize-static-build.test.ts`: deterministic asset fixtures and failure cases.
- Verify unchanged `app/app.css`, `app/app-css.test.ts`, `public/favicon.ico`, and `public/social-card.svg` rather than adding fonts, icon directories, or cache infrastructure.

### Task 1: Imported About Image

**Files:**
- Create: `app/assets/images/about-workflow.svg`
- Modify: `app/i18n/translations/about.ts`
- Modify: `app/routes/$locale.about.tsx`
- Modify: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Write the failing localized route assertion**

Add this test to the `localized route layout` describe block in `app/routes/$locale.test.tsx`:

```tsx
  it("renders the About workflow as a direct localized image", async () => {
    renderLocalizedRoute("/pt-BR/about");

    const image = await screen.findByRole("img", {
      name: "Fluxo de trabalho entre requisitos, implementação e validação.",
    });
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("about-workflow"),
    );
  });
```

- [ ] **Step 2: Run the focused test and confirm no image is rendered**

Run:

```bash
nvm use
npx vitest run 'app/routes/$locale.test.tsx' -t 'renders the About workflow'
```

Expected: FAIL because the About route has no image.

- [ ] **Step 3: Add exhaustive localized alternative text**

Add this property to `AboutTranslation` after `description`:

```ts
  workflowImageAlt: string;
```

Add this value to the English dictionary after `description`:

```ts
    workflowImageAlt:
      "Workflow connecting requirements, implementation, and validation.",
```

Add this value to the Brazilian Portuguese dictionary after `description`:

```ts
    workflowImageAlt:
      "Fluxo de trabalho entre requisitos, implementação e validação.",
```

- [ ] **Step 4: Create the representative source asset**

Create `app/assets/images/about-workflow.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img">
  <rect width="960" height="540" rx="32" fill="#e8eee9"/>
  <path d="M228 270h174m156 0h174" stroke="#356f72" stroke-width="12" stroke-linecap="round"/>
  <path d="m386 248 24 22-24 22m330-44 24 22-24 22" fill="none" stroke="#356f72" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="156" cy="270" r="88" fill="#fffaf0" stroke="#263d3e" stroke-width="10"/>
  <rect x="406" y="182" width="148" height="176" rx="28" fill="#356f72"/>
  <path d="M444 230h72m-72 40h72m-72 40h48" stroke="#fffaf0" stroke-width="12" stroke-linecap="round"/>
  <circle cx="804" cy="270" r="88" fill="#d29b61" stroke="#263d3e" stroke-width="10"/>
  <path d="m764 270 27 27 54-61" fill="none" stroke="#fffaf0" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

The SVG contains no embedded user-facing words. Its meaning is supplied by the localized HTML `alt` attribute.

- [ ] **Step 5: Import through Vite and render a direct image**

Add this import near the top of `app/routes/$locale.about.tsx`:

```ts
import aboutWorkflowImage from "../assets/images/about-workflow.svg?no-inline";
```

Change the `examples` section to:

```tsx
        <ContentSection
          title={translate("about.sections.examples.title")}
          description={translate("about.sections.examples.description")}
        >
          <img
            alt={translate("about.workflowImageAlt")}
            className="w-full rounded-2xl border border-border bg-surface"
            height={540}
            src={aboutWorkflowImage}
            width={960}
          />
        </ContentSection>
```

Do not add a reusable `Image` component or alter `vite.config.ts`. The `?no-inline` query guarantees separate emitted output even though the SVG is small.

- [ ] **Step 6: Run the route test and type checker**

Run:

```bash
npx vitest run 'app/routes/$locale.test.tsx' -t 'renders the About workflow'
```

Expected: both commands PASS; `vite/client` supplies the asset import type.

- [ ] **Step 7: Record the checkpoint**

Run `git diff --check`. If the user has explicitly authorized commits:

```bash
git add app/assets/images/about-workflow.svg app/i18n/translations/about.ts 'app/routes/$locale.about.tsx' 'app/routes/$locale.test.tsx'
```

### Task 2: Static Image Reference Validation

**Files:**
- Modify: `scripts/finalize-static-build.test.ts`
- Modify: `scripts/finalize-static-build.ts`

- [ ] **Step 1: Add helpers for image-bearing fixture HTML**

Change the `node:path` import to:

```ts
import { dirname, join } from "node:path";
```

Then add these helpers after `writeHtml` in `scripts/finalize-static-build.test.ts`:

```ts
function withImage(content: string, src: string) {
  return content.replace("</body>", `<img src="${src}" alt="Workflow"></body>`);
}

function writeAsset(client: string, path: string) {
  const file = join(client, ...path.split("/").filter(Boolean));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, "asset");
}
```

- [ ] **Step 2: Write failing static-finalizer tests**

Add these tests inside `describe("finalizeStaticBuild", ...)`:

```ts
  it("accepts an existing hashed application image", () => {
    const { client } = createCompleteBuild();
    writeAsset(client, "/assets/about-workflow-Ab12Cd34.svg");
    writeHtml(
      client,
      "/en/about",
      withImage(
        html("en", "/en/about", "/en/about"),
        "/assets/about-workflow-Ab12Cd34.svg",
      ),
    );

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });

  it("rejects a missing local image", () => {
    const { client } = createCompleteBuild();
    writeHtml(
      client,
      "/en/about",
      withImage(
        html("en", "/en/about", "/en/about"),
        "/assets/about-workflow-Ab12Cd34.svg",
      ),
    );

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Missing local image /assets/about-workflow-Ab12Cd34.svg in en/about/index.html",
    );
  });

  it("rejects an unhashed application image", () => {
    const { client } = createCompleteBuild();
    writeAsset(client, "/assets/about-workflow.svg");
    writeHtml(
      client,
      "/en/about",
      withImage(
        html("en", "/en/about", "/en/about"),
        "/assets/about-workflow.svg",
      ),
    );

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unhashed application image /assets/about-workflow.svg in en/about/index.html",
    );
  });

  it.each([
    "https://images.example.com/workflow.svg",
    "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
  ])("ignores non-local image %s", (src) => {
    const { client } = createCompleteBuild();
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), src),
    );

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });
```

- [ ] **Step 3: Run the focused tests and confirm validation is absent**

Run:

```bash
npx vitest run scripts/finalize-static-build.test.ts -t 'image'
```

Expected: the missing and unhashed cases FAIL because `finalizeStaticBuild` does not inspect images.

- [ ] **Step 4: Implement focused local-image validation**

Add this constant and function after `validateLinks` in `scripts/finalize-static-build.ts`:

```ts
const hashedApplicationImagePattern =
  /^\/assets\/.+-(?=[A-Za-z\d_-]{8}\.[A-Za-z\d]+$)(?=[^.]*[A-Z\d])[A-Za-z\d_-]{8}\.[A-Za-z\d]+$/;

function validateImages(
  html: string,
  artifact: string,
  clientDirectory: string,
): void {
  const imagePattern =
    /<img\b[^>]*\bsrc\s*=\s*(?:(["'])([^"']*)\1|([^\s>]+))/gi;
  const artifactUrl = new URL(artifact, "https://static.invalid/");

  for (const match of html.matchAll(imagePattern)) {
    const src = match[2] ?? match[3];
    const destination = new URL(src, artifactUrl);
    if (destination.origin !== artifactUrl.origin) continue;

    const pathname = decodeURIComponent(destination.pathname);
    const file = join(clientDirectory, pathname.replace(/^\/+/, ""));
    if (!existsSync(file)) {
      throw new Error(`Missing local image ${pathname} in ${artifact}`);
    }
    if (
      pathname.startsWith("/assets/") &&
      !hashedApplicationImagePattern.test(pathname)
    ) {
      throw new Error(`Unhashed application image ${pathname} in ${artifact}`);
    }
  }
}
```

The second lookahead requires the eight-character Vite suffix to contain at least one uppercase letter or digit. This avoids mistaking the source word `workflow` for a generated hash while matching Vite's current default emitted hash. The real production build in Task 3 confirms compatibility with the installed Vite version.

Call validation for every localized page immediately after `validateLinks` inside `validateLocalizedHtml`:

```ts
      validateImages(html, artifact, clientDirectory);
```

Call it for root HTML immediately after root link validation in `finalizeStaticBuild`:

```ts
  validateImages(rootHtml, "index.html", clientDirectory);
```

- [ ] **Step 5: Run the complete static-finalizer test file**

Run:

```bash
npx vitest run scripts/finalize-static-build.test.ts
```

Expected: PASS for existing behavior and all new image cases.

- [ ] **Step 6: Record the checkpoint**

Run `git diff --check`. If commits are explicitly authorized:

```bash
git add scripts/finalize-static-build.ts scripts/finalize-static-build.test.ts
```

### Task 3: Real Production Asset Proof

**Files:**
- Inspect: `build/client/en/about/index.html`
- Inspect: `build/client/pt-BR/about/index.html`
- Inspect: `build/client/assets/`
- Verify unchanged: `app/app.css`
- Verify unchanged: `public/favicon.ico`
- Verify unchanged: `public/social-card.svg`

- [ ] **Step 1: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS, including `finalizeStaticBuild`; no server directory or SPA fallback remains in final output.

- [ ] **Step 2: Confirm the emitted About image is a file, not a data URL**

Search `build/client/en/about/index.html` and `build/client/pt-BR/about/index.html` for `about-workflow` using the repository Grep tool. Expected in each locale:

```text
src="/assets/about-workflow-<8-character-hash>.svg"
```

Then use Glob for `build/client/assets/about-workflow-*.svg`. Expected: exactly one emitted file matching both HTML references.

- [ ] **Step 3: Confirm stable public assets remain stable**

Use Glob for:

```text
build/client/favicon.ico
build/client/social-card.svg
```

Expected: both exist at stable root paths, while the imported About image exists only under its hashed `/assets/` path.

- [ ] **Step 4: Confirm system font defaults remain covered**

Run:

```bash
npx vitest run app/app-css.test.ts
```

Expected: PASS for the exact sans and serif system stacks. Do not add `app/assets/fonts/`, remote font URLs, or preload tags.

### Task 4: Phase 9 Verification And Architecture Review

**Files:**
- Modify only files required to fix verification or blocking architecture findings.

- [ ] **Step 1: Format the phase changes**

Run:

```bash
npm run format
```

Expected: Prettier completes successfully.

- [ ] **Step 2: Run deterministic validation**

Run:

```bash
npm run check
```

Expected: PASS for formatting, lint, type checking, coverage, build, and static validation. The actual Vite hash must satisfy the validator; if it does not, inspect Vite's emitted filename and adjust the validator to the installed Vite 8 behavior without weakening the requirement that application images are content-hashed.

- [ ] **Step 3: Run all browser tests because the About page changed**

Run:

```bash
npm run test:e2e
```

Expected: PASS with both locales and no unexpected browser errors.

- [ ] **Step 4: Run architecture review**

Dispatch the `architecture-review` subagent with the Phase 9 spec, ADR 020, the phase diff, and successful validation output. Fix every high or medium finding, then rerun `npm run check` and `npm run test:e2e`.

- [ ] **Step 5: Inspect the final phase diff**

Run:

```bash
git status --short
```

Expected: only approved Phase 9 source, route, translation, test, and validator files are changed. Commit only if the user explicitly requests it.
