import type { PublicSiteConfig } from "./types";

const defaultOrigin = "https://jobe.works";

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
    siteName: "JOBE",
    defaultSocialImage: "/social-card.svg",
    xDefault: true,
  };
}
