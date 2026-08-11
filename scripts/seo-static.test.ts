import { describe, expect, it } from "vitest";

import {
  createRobots,
  createSitemap,
  parseAndValidateSeoPage,
  validateRenderedSeoPages,
  validateRobots,
  validateSitemap,
} from "./seo-static";

const site = {
  origin: "https://example.com",
  siteName: "Agent-ready sites",
  defaultSocialImage: "/social-card.svg",
  xDefault: true,
};
const siblings = { en: "/en/about", "pt-BR": "/pt-BR/about" };

function html({
  canonical = "https://example.com/en/about",
  description = "About the template",
  lang = "en",
  robots = "index,follow",
  title = "About",
} = {}) {
  return `<!doctype html><html lang="${lang}"><head><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en" href="https://example.com/en/about"><link rel="alternate" hreflang="pt-BR" href="https://example.com/pt-BR/about"><link rel="alternate" hreflang="x-default" href="https://example.com/pt-BR/about"><meta property="og:type" content="website"><meta property="og:site_name" content="Agent-ready sites"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="https://example.com/social-card.svg"><meta property="og:locale" content="${lang === "en" ? "en_US" : "pt_BR"}"><meta property="og:locale:alternate" content="${lang === "en" ? "pt_BR" : "en_US"}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="https://example.com/social-card.svg"></head><body></body></html>`;
}

function parse(
  overrides: Partial<Parameters<typeof parseAndValidateSeoPage>[0]> = {},
) {
  return parseAndValidateSeoPage({
    html: html(),
    artifact: "en/about/index.html",
    pathname: "/en/about",
    locale: "en",
    siblingUrls: siblings,
    site,
    ...overrides,
  });
}

describe("parseAndValidateSeoPage", () => {
  it("parses complete indexable metadata", () => {
    const page = parse();

    expect(page).toMatchObject({
      lang: "en",
      title: "About",
      description: "About the template",
      canonical: "https://example.com/en/about",
      indexable: true,
    });
    expect(page.alternates).toEqual(
      new Map([
        ["en", "https://example.com/en/about"],
        ["pt-BR", "https://example.com/pt-BR/about"],
        ["x-default", "https://example.com/pt-BR/about"],
      ]),
    );
  });

  it("rejects a missing title", () => {
    expect(() => parse({ html: html({ title: "" }) })).toThrow(
      "Missing title in en/about/index.html",
    );
  });

  it("rejects a missing description", () => {
    expect(() => parse({ html: html({ description: "" }) })).toThrow(
      "Missing description in en/about/index.html",
    );
  });

  it("rejects a non-absolute canonical URL", () => {
    expect(() => parse({ html: html({ canonical: "/en/about" }) })).toThrow(
      "Invalid canonical in en/about/index.html: /en/about",
    );
  });

  it("rejects a malformed canonical URL", () => {
    expect(() => parse({ html: html({ canonical: "https://" }) })).toThrow(
      "Invalid canonical in en/about/index.html: https://",
    );
  });

  it("rejects a canonical URL for another pathname", () => {
    expect(() =>
      parse({ html: html({ canonical: "https://example.com/en/services" }) }),
    ).toThrow(
      "Invalid canonical in en/about/index.html: https://example.com/en/services",
    );
  });

  it("rejects a document-language mismatch", () => {
    expect(() => parse({ html: html({ lang: "pt-BR" }) })).toThrow(
      "Expected en/about/index.html to use html lang en",
    );
  });

  it("rejects duplicate canonical declarations", () => {
    expect(() =>
      parse({
        html: html().replace(
          "</head>",
          '<link rel="canonical" href="https://example.com/en/about"></head>',
        ),
      }),
    ).toThrow("Expected exactly one canonical in en/about/index.html");
  });

  it("rejects an invalid localized alternate target", () => {
    expect(() =>
      parse({
        html: html().replace(
          "https://example.com/pt-BR/about",
          "https://example.com/pt-BR/services",
        ),
      }),
    ).toThrow(
      "Invalid hreflang pt-BR in en/about/index.html: https://example.com/pt-BR/services",
    );
  });

  it("rejects a missing localized alternate", () => {
    expect(() =>
      parse({
        html: html().replace(/<link rel="alternate" hreflang="en"[^>]+>/, ""),
      }),
    ).toThrow("Missing hreflang en in en/about/index.html");
  });

  it("rejects a missing x-default alternate", () => {
    expect(() =>
      parse({
        html: html().replace(
          /<link rel="alternate" hreflang="x-default"[^>]+>/,
          "",
        ),
      }),
    ).toThrow("Missing hreflang x-default in en/about/index.html");
  });

  it("rejects an invalid x-default alternate target", () => {
    expect(() =>
      parse({
        html: html().replace(
          'hreflang="x-default" href="https://example.com/pt-BR/about"',
          'hreflang="x-default" href="https://example.com/pt-BR/services"',
        ),
      }),
    ).toThrow(
      "Invalid hreflang x-default in en/about/index.html: https://example.com/pt-BR/services",
    );
  });

  it("rejects a duplicate alternate declaration", () => {
    expect(() =>
      parse({
        html: html().replace(
          "</head>",
          '<link rel="alternate" hreflang="en" href="https://example.com/en/about"></head>',
        ),
      }),
    ).toThrow("Invalid hreflang in en/about/index.html");
  });

  it("rejects an unexpected alternate declaration", () => {
    expect(() =>
      parse({
        html: html().replace(
          "</head>",
          '<link rel="alternate" hreflang="fr" href="https://example.com/fr/about"></head>',
        ),
      }),
    ).toThrow("Unexpected hreflang in en/about/index.html");
  });

  it("recognizes explicit noindex metadata", () => {
    expect(parse({ html: html({ robots: "noindex,follow" }) }).indexable).toBe(
      false,
    );
  });

  it("rejects unsupported robots metadata", () => {
    expect(() => parse({ html: html({ robots: "index,noindex" }) })).toThrow(
      "Invalid robots metadata in en/about/index.html",
    );
  });

  it.each([
    [
      '<meta property="og:title" content="About">',
      "Missing og:title in en/about/index.html",
    ],
    [
      '<meta name="twitter:description" content="About the template">',
      "Missing twitter:description in en/about/index.html",
    ],
  ])("rejects missing social metadata", (descriptor, message) => {
    expect(() => parse({ html: html().replace(descriptor, "") })).toThrow(
      message,
    );
  });

  it("rejects malformed absolute social-image URLs", () => {
    expect(() =>
      parse({
        html: html()
          .replace(
            '<meta property="og:image" content="https://example.com/social-card.svg">',
            '<meta property="og:image" content="https://">',
          )
          .replace(
            '<meta name="twitter:image" content="https://example.com/social-card.svg">',
            '<meta name="twitter:image" content="https://">',
          ),
      }),
    ).toThrow("Invalid og:image in en/about/index.html");
  });
});

describe("SEO static artifacts", () => {
  const english = parse();
  const portuguese = parseAndValidateSeoPage({
    html: html({
      canonical: "https://example.com/pt-BR/about",
      lang: "pt-BR",
      title: "Sobre",
    }),
    artifact: "pt-BR/about/index.html",
    pathname: "/pt-BR/about",
    locale: "pt-BR",
    siblingUrls: siblings,
    site,
  });

  it("rejects duplicate rendered canonicals", () => {
    expect(() => validateRenderedSeoPages([english, english])).toThrow(
      "Duplicate rendered canonical",
    );
  });

  it("serializes and validates indexable sitemap URLs", () => {
    const xml = createSitemap([portuguese, english]);

    expect(xml.indexOf("/en/about")).toBeLessThan(xml.indexOf("/pt-BR/about"));
    expect(() => validateSitemap(xml, [english, portuguese])).not.toThrow();
    expect(() =>
      validateSitemap(xml.replace(/\s*<url><loc>[^<]+<\/loc><\/url>/, ""), [
        english,
        portuguese,
      ]),
    ).toThrow("Sitemap URLs do not match indexable pages");
    expect(() =>
      validateSitemap(
        xml
          .replace("<urlset", "<not-a-sitemap")
          .replace("</urlset>", "</not-a-sitemap>"),
        [english, portuguese],
      ),
    ).toThrow("Invalid sitemap document");
  });

  it("excludes noindex pages and rejects their inclusion", () => {
    const noindex = {
      ...english,
      canonical: "https://example.com/en/404",
      indexable: false,
    };
    const xml = createSitemap([english, noindex]);
    expect(xml).not.toContain("/en/404");
    expect(() =>
      validateSitemap(
        xml.replace(
          "</urlset>",
          "  <url><loc>https://example.com/en/404</loc></url>\n</urlset>",
        ),
        [english, noindex],
      ),
    ).toThrow("Sitemap URLs do not match indexable pages");
  });

  it("serializes and validates robots", () => {
    const robots = createRobots(site);
    expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
    expect(() => validateRobots(robots, site)).not.toThrow();
    expect(() =>
      validateRobots(robots.replace("example.com", "invalid.example"), site),
    ).toThrow("Invalid robots sitemap URL");
    expect(() =>
      validateRobots(robots.replace("Allow: /", "Disallow: /"), site),
    ).toThrow("Invalid robots document");
  });
});
