# Phase 5 SEO Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add route-explicit localized SEO metadata, derived canonical and alternate links, social metadata, indexability, JSON-LD support, generated sitemap and robots files, and deterministic static validation.

**Architecture:** Route modules own semantic metadata through React Router v8 `meta()` exports. The localized parent loader supplies canonical siblings and validated public site configuration; a small `app/seo/metadata.ts` helper derives mechanical descriptors. After prerendering, `scripts/seo-static.ts` validates rendered metadata and generates sitemap and robots output from the canonical manifest.

**Tech Stack:** React Router Framework Mode v8, React 19, TypeScript 5.9, Vitest, React Testing Library, Playwright, Node.js build scripts

---

## File Structure

- Create `app/seo/types.ts`: define the serializable public site configuration contract.
- Create `app/seo/site-config.server.ts`: validate and expose non-secret build-time SEO configuration.
- Create `app/seo/site-config.server.test.ts`: test origin and social-image configuration.
- Create `app/seo/metadata.ts`: build React Router-native descriptors from route semantics and parent loader data.
- Create `app/seo/metadata.test.ts`: test canonical, alternate, social, robots, override, and JSON-LD descriptors.
- Modify `app/i18n/config.ts`: add Open Graph locale codes.
- Modify `app/i18n/translations/{home,about,services,not-found}.ts`: add explicit localized SEO title and description.
- Modify `app/routes/$locale.tsx`: include public site configuration in parent loader data.
- Modify `app/routes/{_index,$locale._index,$locale.about,$locale.services,$locale.404}.tsx`: add route-native metadata exports.
- Create `scripts/seo-static.ts`: parse and validate rendered SEO, serialize sitemap/robots, and write stable files.
- Create `scripts/seo-static.test.ts`: cover every objective Phase 5 SEO invariant.
- Modify `scripts/finalize-static-build.ts`: invoke SEO finalization while preserving static-purity cleanup.
- Modify `scripts/finalize-static-build.test.ts`: provide valid SEO fixtures and verify generated artifacts.
- Add `public/social-card.svg`: stable generic social preview asset.
- Modify `tests/e2e/routing.spec.ts`: verify rendered metadata, sitemap, robots, noindex, and JSON-LD.

### Task 1: Validate Public Site Configuration

**Files:**
- Create: `app/seo/types.ts`
- Create: `app/seo/site-config.server.ts`
- Create: `app/seo/site-config.server.test.ts`

- [ ] **Step 1: Write failing configuration tests**

```ts
import { describe, expect, it } from "vitest";

import { createSiteConfig } from "./site-config.server";

describe("createSiteConfig", () => {
  it("uses and normalizes the template origin", () => {
    expect(createSiteConfig()).toEqual({
      origin: "https://example.com",
      siteName: "Agent-ready sites",
      defaultSocialImage: "/social-card.svg",
      xDefault: true,
    });
    expect(createSiteConfig("https://site.example/").origin).toBe(
      "https://site.example",
    );
  });

  it.each([
    "http://site.example",
    "https://user:secret@site.example",
    "https://site.example/path",
    "https://site.example?query=1",
    "https://site.example#fragment",
    "not-a-url",
  ])("rejects invalid production origin %s", (origin) => {
    expect(() => createSiteConfig(origin)).toThrow("Invalid SITE_ORIGIN");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm test -- app/seo/site-config.server.test.ts`

Expected: FAIL because `site-config.server.ts` does not exist.

- [ ] **Step 3: Implement the typed site configuration**

Create `app/seo/types.ts`:

```ts
export type PublicSiteConfig = {
  origin: string;
  siteName: string;
  defaultSocialImage: string;
  xDefault: boolean;
};
```

Then create `app/seo/site-config.server.ts`:

```ts
import type { PublicSiteConfig } from "./types";

const defaultOrigin = "https://example.com";

export function createSiteConfig(
  configuredOrigin = process.env.SITE_ORIGIN ?? defaultOrigin,
): PublicSiteConfig {
  let url: URL;
  try {
    url = new URL(configuredOrigin);
  } catch {
    throw new Error(`Invalid SITE_ORIGIN: ${configuredOrigin}`);
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`Invalid SITE_ORIGIN: ${configuredOrigin}`);
  }

  return {
    origin: url.origin,
    siteName: "Agent-ready sites",
    defaultSocialImage: "/social-card.svg",
    xDefault: true,
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- app/seo/site-config.server.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the configuration slice**

```bash
git add app/seo/types.ts app/seo/site-config.server.ts app/seo/site-config.server.test.ts
git commit -m "feat(seo): validate site configuration"
```

### Task 2: Build Native Metadata Descriptors

**Files:**
- Create: `app/seo/metadata.ts`
- Create: `app/seo/metadata.test.ts`
- Modify: `app/i18n/config.ts`

- [ ] **Step 1: Add Open Graph locale metadata to central locale configuration**

Add `ogLocale: "en_US"` to `locales.en` and `ogLocale: "pt_BR"` to `locales["pt-BR"]`. Keep `SupportedLocale` derived from this object.

- [ ] **Step 2: Write failing metadata tests**

Use a fixture with locale `en`, sibling URLs `{ en: "/en/about", "pt-BR": "/pt-BR/about" }`, origin `https://example.com`, and page semantics `{ title: "About", description: "About the template", indexable: true }`. Assert the returned descriptors contain exactly:

```ts
expect(meta).toContainEqual({ title: "About" });
expect(meta).toContainEqual({ name: "description", content: "About the template" });
expect(meta).toContainEqual({
  tagName: "link",
  rel: "canonical",
  href: "https://example.com/en/about",
});
expect(meta).toContainEqual({
  tagName: "link",
  rel: "alternate",
  hrefLang: "pt-BR",
  href: "https://example.com/pt-BR/about",
});
expect(meta).toContainEqual({
  tagName: "link",
  rel: "alternate",
  hrefLang: "x-default",
  href: "https://example.com/pt-BR/about",
});
expect(meta).toContainEqual({ name: "robots", content: "index,follow" });
expect(meta).toContainEqual({ property: "og:url", content: "https://example.com/en/about" });
expect(meta).toContainEqual({ property: "og:locale", content: "en_US" });
expect(meta).toContainEqual({ name: "twitter:card", content: "summary_large_image" });
```

Add separate tests asserting `noindex,follow`, an absolute page social-image override, omission of `x-default` when disabled, and a descriptor shaped as `{ "script:ld+json": jsonLd }` when supplied.

- [ ] **Step 3: Run the metadata test and verify RED**

Run: `npm test -- app/seo/metadata.test.ts`

Expected: FAIL because the metadata helper does not exist.

- [ ] **Step 4: Implement the metadata contract**

Define these public types and function:

```ts
import type { MetaDescriptor } from "react-router";

import {
  defaultLocale,
  locales,
  supportedLocales,
  type SupportedLocale,
} from "../i18n/config";
import type { PublicSiteConfig } from "./types";

export type SeoLoaderData = {
  urls: Record<SupportedLocale, string>;
  site: PublicSiteConfig;
};

export type PageSeo = {
  title: string;
  description: string;
  indexable: boolean;
  socialImage?: string;
  jsonLd?: Record<string, unknown>;
};

export function createPageMeta(
  locale: SupportedLocale,
  loaderData: SeoLoaderData,
  page: PageSeo,
): MetaDescriptor[];
```

Implementation rules:

- Create absolute URLs with `new URL(pathname, `${site.origin}/`).href`.
- Emit locale alternates in `supportedLocales` order using `locales[target].htmlLang` as `hrefLang`.
- Emit `x-default` only when `site.xDefault` is true.
- Use the page override or `site.defaultSocialImage`, converted to an absolute URL.
- Emit Open Graph title, description, URL, type `website`, site name, image, current locale, and one `og:locale:alternate` for every other locale.
- Emit Twitter `summary_large_image`, title, description, and image.
- Append `{ "script:ld+json": page.jsonLd }` only when JSON-LD is supplied.

Also implement:

```ts
export function getSeoLoaderData(
  matches: readonly { id: string; loaderData: unknown }[],
): SeoLoaderData {
  const data = matches.find(({ id }) => id === "routes/$locale")?.loaderData;
  if (
    !data ||
    typeof data !== "object" ||
    !("urls" in data) ||
    !("site" in data)
  ) {
    throw new Error("Missing localized SEO loader data");
  }
  return data as SeoLoaderData;
}
```

- [ ] **Step 5: Run metadata and locale tests and verify GREEN**

Run: `npm test -- app/seo/metadata.test.ts app/i18n/config.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the metadata helper**

```bash
git add app/seo/metadata.ts app/seo/metadata.test.ts app/i18n/config.ts app/i18n/config.test.ts
git commit -m "feat(seo): derive route metadata"
```

### Task 3: Add Explicit Localized Route Metadata

**Files:**
- Modify: `app/i18n/translations/home.ts`
- Modify: `app/i18n/translations/about.ts`
- Modify: `app/i18n/translations/services.ts`
- Modify: `app/i18n/translations/not-found.ts`
- Modify: `app/routes/$locale.tsx`
- Modify: `app/routes/_index.tsx`
- Modify: `app/routes/$locale._index.tsx`
- Modify: `app/routes/$locale.about.tsx`
- Modify: `app/routes/$locale.services.tsx`
- Modify: `app/routes/$locale.404.tsx`
- Modify: `app/routes/$locale.test.tsx`
- Modify: `app/routes/_index.test.tsx`

- [ ] **Step 1: Extend page translation contracts with required SEO fields**

Add this required shape to every page translation type:

```ts
seo: {
  title: string;
  description: string;
};
```

Use these complete values:

```text
Home EN title: Static Website Template for AI-Assisted Teams
Home EN description: Build fast, localized, production-ready static websites with typed content, reusable React components, and deterministic validation.
Home PT title: Modelo de Site Estático para Equipes com IA
Home PT description: Crie sites estáticos rápidos, localizados e prontos para produção com conteúdo tipado, componentes React reutilizáveis e validação determinística.

About EN title: About the Static Website Template
About EN description: Learn how this agent-ready template keeps architecture, localization, components, and quality checks explicit and easy to evolve.
About PT title: Sobre o Modelo de Site Estático
About PT description: Conheça como este modelo preparado para agentes mantém arquitetura, localização, componentes e qualidade explícitos e fáceis de evoluir.

Services EN title: Static Website Foundation Services
Services EN description: Explore the reusable foundation, typed localization, and deterministic delivery patterns demonstrated by this static website template.
Services PT title: Serviços de Base para Sites Estáticos
Services PT description: Explore a base reutilizável, a localização tipada e os padrões de entrega determinística demonstrados por este modelo de site estático.

404 EN title: Page Not Found
404 EN description: The requested page is not published. Return to a localized page using the site navigation.
404 PT title: Página Não Encontrada
404 PT description: A página solicitada não está publicada. Retorne a uma página localizada usando a navegação do site.
```

- [ ] **Step 2: Write failing route metadata tests**

Import each route's `meta` export. Build typed fixtures with parent match ID `routes/$locale`, canonical sibling URLs, and public site config. Assert:

- Home English metadata contains its localized title and an `Organization` JSON-LD descriptor.
- About Portuguese metadata contains the Portuguese title and self-canonical.
- Services metadata uses default social image.
- 404 metadata contains `noindex,follow`.
- Root metadata contains only `noindex,follow` and no canonical.
- Invalid locale params return an empty descriptor list for localized route metadata.

- [ ] **Step 3: Run route tests and verify RED**

Run: `npm test -- 'app/routes/$locale.test.tsx' app/routes/_index.test.tsx`

Expected: FAIL because route metadata exports and SEO loader data are absent.

- [ ] **Step 4: Add site configuration to localized parent loader data**

Change `getLoaderDataForPathname` to accept a third argument defaulting to `createSiteConfig()` and return both values:

```ts
export function getLoaderDataForPathname(
  manifest: CanonicalUrlManifest,
  pathname: string,
  site = createSiteConfig(),
) {
  return {
    urls: getLocalizedUrlsForPathname(manifest, pathname),
    site,
  };
}
```

Update existing exact-object tests to include the public site fixture. Preserve the catch-all output as `{ urls: null }`; catch-all routes do not emit canonical metadata and the language switcher remains hidden.

- [ ] **Step 5: Add native `meta()` exports to existing routes**

For each localized route, validate `params.locale` with `isSupportedLocale`, retrieve `getSeoLoaderData(matches)`, select that route's translation object, and call `createPageMeta`.

Home supplies:

```ts
jsonLd: {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: loaderData.site.siteName,
  url: `${loaderData.site.origin}${loaderData.urls[params.locale]}`,
}
```

Home, About, and Services pass `indexable: true`. Localized 404 passes `indexable: false`. Root exports:

```ts
export function meta() {
  return [{ name: "robots", content: "noindex,follow" }];
}
```

- [ ] **Step 6: Run route tests and type checking and verify GREEN**

Run: `npm test -- 'app/routes/$locale.test.tsx' app/routes/_index.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit explicit route metadata**

```bash
git add app/i18n/translations app/routes app/seo
git commit -m "feat(seo): add localized route metadata"
```

### Task 4: Generate and Validate Static SEO Artifacts

**Files:**
- Create: `scripts/seo-static.ts`
- Create: `scripts/seo-static.test.ts`

- [ ] **Step 1: Write failing parser and serializer tests**

Create a complete HTML fixture containing one title, description, canonical, `en`, `pt-BR`, and `x-default` alternates, robots metadata, and matching `<html lang>`. Test exported functions with a two-page manifest and assert:

- parsing returns title, description, canonical, alternates, language, and indexability;
- duplicate canonical tags throw;
- two rendered pages claiming the same canonical throw;
- missing or empty title and description throw;
- relative, malformed, wrong-path, or duplicate canonical URLs throw;
- missing, duplicate, malformed, or wrong alternate URLs throw;
- a missing localized sibling throws;
- wrong `<html lang>` throws;
- `noindex` is recognized;
- sitemap serialization contains all and only indexable absolute canonical URLs;
- sitemap validation rejects a missing indexable page, an unknown URL, and a noindex URL;
- robots serialization includes the absolute sitemap URL;
- robots validation rejects a wrong sitemap origin.

- [ ] **Step 2: Run the static SEO test and verify RED**

Run: `npm test -- scripts/seo-static.test.ts`

Expected: FAIL because `seo-static.ts` does not exist.

- [ ] **Step 3: Implement focused static SEO functions**

Export these contracts:

```ts
export type RenderedSeoPage = {
  artifact: string;
  pathname: string;
  locale: SupportedLocale;
  lang: string;
  title: string;
  description: string;
  canonical: string;
  alternates: Map<string, string>;
  indexable: boolean;
};

export function parseAndValidateSeoPage(input: {
  html: string;
  artifact: string;
  pathname: string;
  locale: SupportedLocale;
  siblingUrls: Record<SupportedLocale, string>;
  site: PublicSiteConfig;
}): RenderedSeoPage;

export function createSitemap(pages: readonly RenderedSeoPage[]): string;
export function validateRenderedSeoPages(
  pages: readonly RenderedSeoPage[],
): void;
export function validateSitemap(
  xml: string,
  pages: readonly RenderedSeoPage[],
): void;
export function createRobots(site: PublicSiteConfig): string;
export function validateRobots(text: string, site: PublicSiteConfig): void;
```

Use narrow case-insensitive tag extraction helpers for `<title>`, `<meta>`, and `<link>`. Decode `&amp;`, `&quot;`, `&#39;`, `&lt;`, and `&gt;` before comparing values. Require exactly one canonical, description, and robots declaration. Compare absolute URLs against `new URL(pathname, `${site.origin}/`).href` and compare alternates against every manifest sibling plus optional `x-default`.

`validateRenderedSeoPages` builds a canonical set and throws `Duplicate rendered canonical: <url>` when two artifacts claim the same URL. It also verifies every page's canonical is represented exactly once before sitemap serialization.

Serialize XML with escaped values and this deterministic form:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/en/</loc></url>
</urlset>
```

Sort sitemap URLs lexically. Serialize robots with a final newline:

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

- [ ] **Step 4: Run static SEO tests and verify GREEN**

Run: `npm test -- scripts/seo-static.test.ts`

Expected: PASS with every required mutation covered.

- [ ] **Step 5: Commit static SEO logic**

```bash
git add scripts/seo-static.ts scripts/seo-static.test.ts
git commit -m "feat(seo): validate static metadata"
```

### Task 5: Integrate SEO Finalization and Stable Social Image

**Files:**
- Modify: `scripts/finalize-static-build.ts`
- Modify: `scripts/finalize-static-build.test.ts`
- Add: `public/social-card.svg`

- [ ] **Step 1: Extend build-finalizer tests with complete metadata**

Update the HTML fixture helper to accept pathname, locale, sibling URLs, origin, and indexability and emit valid metadata. Add assertions that a successful finalization creates `sitemap.xml` and `robots.txt`, includes both indexable locale URLs, excludes a noindex utility URL, and still removes `build/server` and `__spa-fallback.html`.

Add integration mutations for missing metadata and sitemap/noindex contradiction by testing the exported SEO validators directly rather than weakening generated output.

- [ ] **Step 2: Run finalizer tests and verify RED**

Run: `npm test -- scripts/finalize-static-build.test.ts`

Expected: FAIL because finalization does not generate SEO files.

- [ ] **Step 3: Integrate SEO generation into finalization**

Inside `finalizeStaticBuild`, create the site config once, parse each localized artifact while it is already being read, collect `RenderedSeoPage` values, then:

```ts
const sitemap = createSitemap(renderedPages);
validateRenderedSeoPages(renderedPages);
validateSitemap(sitemap, renderedPages);
writeFileSync(join(clientDirectory, "sitemap.xml"), sitemap);

const robots = createRobots(site);
validateRobots(robots, site);
writeFileSync(join(clientDirectory, "robots.txt"), robots);
```

Keep cleanup last so any validation failure leaves evidence available. Do not add a separate route inventory or npm validation command.

- [ ] **Step 4: Add the generic stable social image**

Create this self-contained 1200×630 SVG with no external references:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">Agent-ready static sites</title>
  <desc id="description">Warm neutral social card with a teal geometric accent.</desc>
  <rect width="1200" height="630" fill="#f6f0e4" />
  <circle cx="1010" cy="120" r="190" fill="#2c756f" opacity="0.18" />
  <path d="M860 630 1200 250v380Z" fill="#2c756f" />
  <text x="96" y="275" fill="#342d28" font-family="ui-serif, Georgia, serif" font-size="72" font-weight="700">Agent-ready</text>
  <text x="96" y="365" fill="#342d28" font-family="ui-serif, Georgia, serif" font-size="72" font-weight="700">static sites</text>
  <text x="100" y="445" fill="#655b52" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30">Typed, localized, and built to ship.</text>
</svg>
```

- [ ] **Step 5: Run finalizer tests and production build and verify GREEN**

Run: `npm test -- scripts/finalize-static-build.test.ts scripts/seo-static.test.ts && npm run build`

Expected: PASS; `build/client/sitemap.xml`, `build/client/robots.txt`, and `build/client/social-card.svg` exist; server and SPA fallback artifacts do not.

- [ ] **Step 6: Commit build integration**

```bash
git add scripts/finalize-static-build.ts scripts/finalize-static-build.test.ts public/social-card.svg
git commit -m "feat(seo): generate sitemap and robots"
```

### Task 6: Browser Evidence and Phase 5 Completion

**Files:**
- Modify: `tests/e2e/routing.spec.ts`

- [ ] **Step 1: Add browser-facing SEO assertions**

For `/en/about`, assert the final title, description, absolute self-canonical, both localized alternates, `x-default`, Open Graph URL/image, and Twitter card. For `/en/`, parse the `application/ld+json` script and assert `@type === "Organization"`. For `/en/404`, assert `robots=noindex,follow`. Fetch `/sitemap.xml` and `/robots.txt`; assert 200 responses, content types accepted by the static server, indexable URLs present, and both 404 URLs absent.

- [ ] **Step 2: Run focused Playwright tests**

Run: `npm run test:e2e -- tests/e2e/routing.spec.ts`

Expected: PASS with no console or page errors.

- [ ] **Step 3: Run canonical deterministic validation**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run check`

Expected: formatting, lint, type checking, unit/component tests, coverage, build, SEO generation, and static validation all pass.

- [ ] **Step 4: Run the full browser suite**

Run: `npm run test:e2e`

Expected: all Chromium tests pass.

- [ ] **Step 5: Update the knowledge graph**

Run: `graphify update .`

Expected: graph update completes without modifying application behavior.

- [ ] **Step 6: Request architecture review**

Delegate to `architecture-review` with Phase 5 acceptance criteria, the complete Phase 5 diff, fresh `npm run check` and `npm run test:e2e` results, and an explicit statement that Phase 6+ capabilities are out of scope. Resolve every high or medium finding before completion.

- [ ] **Step 7: Commit Phase 5 browser evidence and fixes**

```bash
git add tests/e2e/routing.spec.ts
git commit -m "test(seo): verify generated metadata"
```
