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

function absoluteUrl(site: PublicSiteConfig, pathname: string): string {
  return new URL(pathname, `${site.origin}/`).href;
}

export function createPageMeta(
  locale: SupportedLocale,
  loaderData: SeoLoaderData,
  page: PageSeo,
): MetaDescriptor[] {
  const { site, urls } = loaderData;
  const canonical = absoluteUrl(site, urls[locale]);
  const image = absoluteUrl(site, page.socialImage ?? site.defaultSocialImage);
  const alternateLocales = supportedLocales.filter(
    (targetLocale) => targetLocale !== locale,
  );
  const alternateDescriptors: MetaDescriptor[] = supportedLocales.map(
    (targetLocale) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: locales[targetLocale].htmlLang,
      href: absoluteUrl(site, urls[targetLocale]),
    }),
  );
  if (site.xDefault) {
    alternateDescriptors.push({
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: absoluteUrl(site, urls[defaultLocale]),
    });
  }
  const descriptors: MetaDescriptor[] = [
    { title: page.title },
    { name: "description", content: page.description },
    {
      name: "robots",
      content: page.indexable ? "index,follow" : "noindex,follow",
    },
    { tagName: "link", rel: "canonical", href: canonical },
    ...alternateDescriptors,
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: site.siteName },
    { property: "og:url", content: canonical },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:image", content: image },
    { property: "og:locale", content: locales[locale].ogLocale },
    ...alternateLocales.map((targetLocale) => ({
      property: "og:locale:alternate",
      content: locales[targetLocale].ogLocale,
    })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: image },
  ];

  if (page.jsonLd) descriptors.push({ "script:ld+json": page.jsonLd });
  return descriptors;
}

export function getSeoLoaderData(
  matches: readonly ({ id: string; loaderData: unknown } | undefined)[],
): SeoLoaderData {
  const data = matches.find(
    (match) => match?.id === "routes/$locale",
  )?.loaderData;
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
