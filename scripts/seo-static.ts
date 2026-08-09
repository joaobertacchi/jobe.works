import {
  defaultLocale,
  locales,
  supportedLocales,
  type SupportedLocale,
} from "../app/i18n/config";
import type { PublicSiteConfig } from "../app/seo/types";

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

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function tags(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(
    ([tag]) => tag,
  );
}

function attribute(tag: string, name: string): string | undefined {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return match ? decodeHtml(match[1] ?? match[2]) : undefined;
}

function oneMetadataValue(
  html: string,
  name: string,
  artifact: string,
): string {
  const values = tags(html, "meta")
    .filter((tag) => attribute(tag, "name")?.toLowerCase() === name)
    .map((tag) => attribute(tag, "content")?.trim() ?? "");
  if (values.length !== 1 || !values[0]) {
    throw new Error(`Missing ${name} in ${artifact}`);
  }
  return values[0];
}

function onePropertyValue(
  html: string,
  property: string,
  artifact: string,
): string {
  const values = tags(html, "meta")
    .filter((tag) => attribute(tag, "property")?.toLowerCase() === property)
    .map((tag) => attribute(tag, "content")?.trim() ?? "");
  if (values.length !== 1 || !values[0]) {
    throw new Error(`Missing ${property} in ${artifact}`);
  }
  return values[0];
}

function requireValue(
  actual: string,
  expected: string,
  label: string,
  artifact: string,
): void {
  if (actual !== expected) {
    throw new Error(`Invalid ${label} in ${artifact}`);
  }
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function absolute(site: PublicSiteConfig, pathname: string): string {
  return new URL(pathname, `${site.origin}/`).href;
}

function validateAbsoluteUrl(
  value: string,
  expected: string,
  label: string,
  artifact: string,
): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid ${label} in ${artifact}: ${value}`);
  }
  if (parsed.href !== expected) {
    throw new Error(`Invalid ${label} in ${artifact}: ${value}`);
  }
}

function parseCanonical(
  html: string,
  expected: string,
  artifact: string,
): string {
  const canonicals = tags(html, "link").filter(
    (tag) => attribute(tag, "rel")?.toLowerCase() === "canonical",
  );
  if (canonicals.length !== 1) {
    throw new Error(`Expected exactly one canonical in ${artifact}`);
  }
  const canonical = attribute(canonicals[0], "href") ?? "";
  validateAbsoluteUrl(canonical, expected, "canonical", artifact);
  return canonical;
}

function parseAlternates(html: string, artifact: string): Map<string, string> {
  const alternates = new Map<string, string>();
  for (const tag of tags(html, "link")) {
    if (attribute(tag, "rel")?.toLowerCase() !== "alternate") continue;
    const language = attribute(tag, "hreflang");
    const href = attribute(tag, "href");
    if (!language || !href || alternates.has(language)) {
      throw new Error(`Invalid hreflang in ${artifact}`);
    }
    alternates.set(language, href);
  }
  return alternates;
}

function validateAlternates(
  alternates: ReadonlyMap<string, string>,
  siblingUrls: Record<SupportedLocale, string>,
  site: PublicSiteConfig,
  artifact: string,
): void {
  for (const locale of supportedLocales) {
    const pathname = siblingUrls[locale];
    if (!pathname) throw new Error(`Missing localized sibling ${locale}`);
    const language = locales[locale].htmlLang;
    const value = alternates.get(language);
    if (!value) throw new Error(`Missing hreflang ${language} in ${artifact}`);
    validateAbsoluteUrl(
      value,
      absolute(site, pathname),
      `hreflang ${language}`,
      artifact,
    );
  }
  if (site.xDefault) {
    const value = alternates.get("x-default");
    if (!value) throw new Error(`Missing hreflang x-default in ${artifact}`);
    validateAbsoluteUrl(
      value,
      absolute(site, siblingUrls[defaultLocale]),
      "hreflang x-default",
      artifact,
    );
  }
  const expectedSize = supportedLocales.length + (site.xDefault ? 1 : 0);
  if (alternates.size !== expectedSize) {
    throw new Error(`Unexpected hreflang in ${artifact}`);
  }
}

function validateSocialMetadata(input: {
  html: string;
  artifact: string;
  locale: SupportedLocale;
  title: string;
  description: string;
  canonical: string;
  site: PublicSiteConfig;
}): void {
  const { html, artifact, locale, title, description, canonical, site } = input;
  requireValue(
    onePropertyValue(html, "og:type", artifact),
    "website",
    "og:type",
    artifact,
  );
  requireValue(
    onePropertyValue(html, "og:site_name", artifact),
    site.siteName,
    "og:site_name",
    artifact,
  );
  requireValue(
    onePropertyValue(html, "og:url", artifact),
    canonical,
    "og:url",
    artifact,
  );
  requireValue(
    onePropertyValue(html, "og:title", artifact),
    title,
    "og:title",
    artifact,
  );
  requireValue(
    onePropertyValue(html, "og:description", artifact),
    description,
    "og:description",
    artifact,
  );
  requireValue(
    onePropertyValue(html, "og:locale", artifact),
    locales[locale].ogLocale,
    "og:locale",
    artifact,
  );
  const image = onePropertyValue(html, "og:image", artifact);
  if (!isAbsoluteHttpUrl(image)) {
    throw new Error(`Invalid og:image in ${artifact}`);
  }
  const alternateLocales = tags(html, "meta")
    .filter(
      (tag) =>
        attribute(tag, "property")?.toLowerCase() === "og:locale:alternate",
    )
    .map((tag) => attribute(tag, "content") ?? "")
    .sort();
  const expectedAlternates = supportedLocales
    .filter((targetLocale) => targetLocale !== locale)
    .map((targetLocale) => locales[targetLocale].ogLocale)
    .sort();
  if (
    alternateLocales.length !== expectedAlternates.length ||
    alternateLocales.some((value, index) => value !== expectedAlternates[index])
  ) {
    throw new Error(`Invalid og:locale:alternate in ${artifact}`);
  }

  requireValue(
    oneMetadataValue(html, "twitter:card", artifact),
    "summary_large_image",
    "twitter:card",
    artifact,
  );
  requireValue(
    oneMetadataValue(html, "twitter:title", artifact),
    title,
    "twitter:title",
    artifact,
  );
  requireValue(
    oneMetadataValue(html, "twitter:description", artifact),
    description,
    "twitter:description",
    artifact,
  );
  requireValue(
    oneMetadataValue(html, "twitter:image", artifact),
    image,
    "twitter:image",
    artifact,
  );
}

export function parseAndValidateSeoPage(input: {
  html: string;
  artifact: string;
  pathname: string;
  locale: SupportedLocale;
  siblingUrls: Record<SupportedLocale, string>;
  site: PublicSiteConfig;
}): RenderedSeoPage {
  const { html, artifact, pathname, locale, siblingUrls, site } = input;
  const lang = attribute(tags(html, "html")[0] ?? "", "lang") ?? "";
  const expectedLang = locales[locale].htmlLang;
  if (lang !== expectedLang) {
    throw new Error(`Expected ${artifact} to use html lang ${expectedLang}`);
  }

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeHtml(titleMatch?.[1] ?? "").trim();
  if (!title) throw new Error(`Missing title in ${artifact}`);
  const description = oneMetadataValue(html, "description", artifact);
  const robots = oneMetadataValue(html, "robots", artifact);
  if (robots !== "index,follow" && robots !== "noindex,follow") {
    throw new Error(`Invalid robots metadata in ${artifact}`);
  }

  const canonical = parseCanonical(html, absolute(site, pathname), artifact);
  const alternates = parseAlternates(html, artifact);
  validateAlternates(alternates, siblingUrls, site, artifact);
  validateSocialMetadata({
    html,
    artifact,
    locale,
    title,
    description,
    canonical,
    site,
  });

  return {
    artifact,
    pathname,
    locale,
    lang,
    title,
    description,
    canonical,
    alternates,
    indexable: robots === "index,follow",
  };
}

export function validateRenderedSeoPages(
  pages: readonly RenderedSeoPage[],
): void {
  const canonicals = new Set<string>();
  for (const page of pages) {
    if (canonicals.has(page.canonical)) {
      throw new Error(`Duplicate rendered canonical: ${page.canonical}`);
    }
    canonicals.add(page.canonical);
  }
}

export function createSitemap(pages: readonly RenderedSeoPage[]): string {
  const urls = pages
    .filter(({ indexable }) => indexable)
    .map(({ canonical }) => canonical)
    .sort((left, right) => left.localeCompare(right, "en"));
  const entries = urls.map(
    (url) => `  <url><loc>${escapeXml(url)}</loc></url>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

export function validateSitemap(
  xml: string,
  pages: readonly RenderedSeoPage[],
): void {
  const actual = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => decodeHtml(match[1]))
    .sort();
  const expected = pages
    .filter(({ indexable }) => indexable)
    .map(({ canonical }) => canonical)
    .sort();
  if (
    actual.length !== expected.length ||
    actual.some((url, index) => url !== expected[index])
  ) {
    throw new Error("Sitemap URLs do not match indexable pages");
  }
  if (xml !== createSitemap(pages)) {
    throw new Error("Invalid sitemap document");
  }
}

export function createRobots(site: PublicSiteConfig): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`;
}

export function validateRobots(text: string, site: PublicSiteConfig): void {
  const match = text.match(/^Sitemap:\s*(\S+)$/m);
  if (match?.[1] !== `${site.origin}/sitemap.xml`) {
    throw new Error("Invalid robots sitemap URL");
  }
  if (text !== createRobots(site)) {
    throw new Error("Invalid robots document");
  }
}
