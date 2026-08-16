import { describe, expect, it } from "vitest";

import { createPageMeta, getSeoLoaderData } from "./metadata";
import type { SeoLoaderData } from "./metadata";

const loaderData = {
  urls: { en: "/en/about", "pt-BR": "/pt-BR/about" },
  site: {
    origin: "https://jobe.works",
    siteName: "JOBE",
    defaultSocialImage: "/social-card.svg",
    xDefault: true,
  },
} satisfies SeoLoaderData;

describe("createPageMeta", () => {
  it("derives canonical, alternate, and social metadata", () => {
    const meta = createPageMeta("en", loaderData, {
      title: "About",
      description: "About the template",
      indexable: true,
    });

    expect(meta).toContainEqual({ title: "About" });
    expect(meta).toContainEqual({
      name: "description",
      content: "About the template",
    });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "canonical",
      href: "https://jobe.works/en/about",
    });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "alternate",
      hrefLang: "pt-BR",
      href: "https://jobe.works/pt-BR/about",
    });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: "https://jobe.works/pt-BR/about",
    });
    expect(meta).toContainEqual({
      name: "robots",
      content: "index,follow",
    });
    expect(meta).toContainEqual({
      property: "og:url",
      content: "https://jobe.works/en/about",
    });
    expect(meta).toContainEqual({ property: "og:locale", content: "en_US" });
    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://jobe.works/social-card.svg",
    });
    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });
  });

  it("supports noindex, social-image overrides, and JSON-LD", () => {
    const jsonLd = { "@context": "https://schema.org", "@type": "WebPage" };
    const meta = createPageMeta("pt-BR", loaderData, {
      title: "Sobre",
      description: "Sobre o modelo",
      indexable: false,
      socialImage: "/about-card.svg",
      jsonLd,
    });

    expect(meta).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    });
    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://jobe.works/about-card.svg",
    });
    expect(meta).toContainEqual({ "script:ld+json": jsonLd });
  });

  it("omits x-default when disabled", () => {
    const meta = createPageMeta(
      "en",
      { ...loaderData, site: { ...loaderData.site, xDefault: false } },
      { title: "About", description: "Description", indexable: true },
    );

    expect(meta).not.toContainEqual(
      expect.objectContaining({ hrefLang: "x-default" }),
    );
  });
});

describe("getSeoLoaderData", () => {
  it("returns localized parent loader data", () => {
    expect(
      getSeoLoaderData([
        undefined,
        { id: "root", loaderData: null },
        { id: "routes/$locale", loaderData },
      ] as never),
    ).toBe(loaderData);
  });

  it("rejects missing parent loader data", () => {
    expect(() => getSeoLoaderData([])).toThrow(
      "Missing localized SEO loader data",
    );
  });
});
