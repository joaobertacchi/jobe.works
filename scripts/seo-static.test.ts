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
    expect(parse()).toMatchObject({
      lang: "en",
      title: "About",
      description: "About the template",
      canonical: "https://example.com/en/about",
      indexable: true,
    });
    expect(parse().alternates.get("pt-BR")).toBe(
      "https://example.com/pt-BR/about",
    );
  });

  it.each([
    [html({ title: "" }), "Missing title"],
    [html({ description: "" }), "Missing description"],
    [html({ canonical: "/en/about" }), "Invalid canonical"],
    [
      html({ canonical: "https://example.com/en/services" }),
      "Invalid canonical",
    ],
    [
      html({ lang: "pt-BR" }),
      "Expected en/about/index.html to use html lang en",
    ],
  ])("rejects invalid page metadata", (invalidHtml, message) => {
    expect(() => parse({ html: invalidHtml })).toThrow(message);
  });

  it("rejects duplicate canonical declarations", () => {
    expect(() =>
      parse({
        html: html().replace(
          "</head>",
          '<link rel="canonical" href="https://example.com/en/about"></head>',
        ),
      }),
    ).toThrow("Expected exactly one canonical");
  });

  it("rejects invalid and missing localized alternates", () => {
    expect(() =>
      parse({
        html: html().replace(
          "https://example.com/pt-BR/about",
          "https://example.com/pt-BR/services",
        ),
      }),
    ).toThrow("Invalid hreflang pt-BR");
    expect(() =>
      parse({
        html: html().replace(/<link rel="alternate" hreflang="en"[^>]+>/, ""),
      }),
    ).toThrow("Missing hreflang en");
  });

  it("recognizes explicit noindex metadata", () => {
    expect(parse({ html: html({ robots: "noindex,follow" }) }).indexable).toBe(
      false,
    );
  });

  it.each([
    ['<meta property="og:title" content="About">', "Missing og:title"],
    [
      '<meta name="twitter:description" content="About the template">',
      "Missing twitter:description",
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
    ).toThrow("Invalid og:image");
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
