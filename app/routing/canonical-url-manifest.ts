import type { RouteConfigEntry } from "@react-router/dev/routes";

import { supportedLocales, type SupportedLocale } from "../i18n/config";

export type CanonicalUrlManifestEntry = {
  id: string;
  kind: "page" | "utility";
  pattern: string;
  urls: Record<SupportedLocale, string>;
};

export type CanonicalUrlManifest = readonly CanonicalUrlManifestEntry[];

function joinPattern(parent: string, path: string | undefined): string {
  if (!path) return parent;
  return parent ? `${parent}/${path}` : path;
}

function collectLeafPatterns(
  routes: readonly RouteConfigEntry[],
  parent = "",
): string[] {
  return routes.flatMap((route) => {
    const pattern = route.index ? parent : joinPattern(parent, route.path);
    if (route.children?.length) {
      if (route.path && !route.children.some((child) => child.index)) {
        throw new Error(
          `Path-bearing parent requires an index route: ${pattern}`,
        );
      }
      return collectLeafPatterns(route.children, pattern);
    }
    if (!pattern || pattern === ":locale/*") return [];
    if (pattern.includes("*")) {
      throw new Error(`Unsupported public splat route: ${pattern}`);
    }
    return [pattern];
  });
}

function getLogicalPath(pattern: string): string {
  if (pattern === ":locale") return "/";
  if (!pattern.startsWith(":locale/")) {
    throw new Error(`Public route must be locale-prefixed: ${pattern}`);
  }

  const suffix = pattern.slice(":locale/".length);
  if (suffix.includes(":")) {
    throw new Error(`Public route has an unresolved parameter: ${pattern}`);
  }
  if (suffix.includes("//")) {
    throw new Error(`Public route contains duplicate slashes: ${pattern}`);
  }
  if (suffix.includes(".html")) {
    throw new Error(`Public route must not contain .html: ${pattern}`);
  }
  if (suffix !== suffix.toLowerCase()) {
    throw new Error(`Public route segments must be lowercase: ${pattern}`);
  }
  return `/${suffix}`;
}

function getPageId(logicalPath: string): string {
  return logicalPath === "/"
    ? "home"
    : logicalPath.slice(1).replaceAll("/", ".");
}

function createLocalizedUrls(
  logicalPath: string,
): Record<SupportedLocale, string> {
  return Object.fromEntries(
    supportedLocales.map((locale) => [
      locale,
      logicalPath === "/" ? `/${locale}/` : `/${locale}${logicalPath}`,
    ]),
  ) as Record<SupportedLocale, string>;
}

export function createCanonicalUrlManifest(
  routes: readonly RouteConfigEntry[],
): CanonicalUrlManifest {
  const entries = collectLeafPatterns(routes).map((routePattern) => {
    const logicalPath = getLogicalPath(routePattern);
    const id = getPageId(logicalPath);
    return {
      id,
      kind: id === "404" ? ("utility" as const) : ("page" as const),
      pattern: logicalPath === "/" ? "/:locale/" : `/:locale${logicalPath}`,
      urls: createLocalizedUrls(logicalPath),
    };
  });

  entries.sort((left, right) =>
    left.pattern.localeCompare(right.pattern, "en"),
  );
  validateCanonicalUrlManifest(entries);
  return entries;
}

export function validateCanonicalUrlManifest(
  manifest: CanonicalUrlManifest,
): void {
  const pageIds = new Set<string>();
  const urls = new Set<string>();

  for (const entry of manifest) {
    if (pageIds.has(entry.id)) {
      throw new Error(`Duplicate logical page: ${entry.id}`);
    }
    pageIds.add(entry.id);

    for (const locale of supportedLocales) {
      const url = entry.urls[locale];
      if (!url) throw new Error(`Missing locale ${locale} for ${entry.id}`);
      if (urls.has(url)) throw new Error(`Duplicate canonical URL: ${url}`);
      const expectedUrl = entry.pattern.replace(":locale", locale);
      if (url !== expectedUrl) {
        throw new Error(`Invalid canonical URL for ${locale}: ${url}`);
      }
      urls.add(url);
    }
  }
}

export function getCanonicalUrls(manifest: CanonicalUrlManifest): string[] {
  return manifest.flatMap((entry) =>
    supportedLocales.map((locale) => entry.urls[locale]),
  );
}

export function getLocalizedUrlsForPathname(
  manifest: CanonicalUrlManifest,
  pathname: string,
): Record<SupportedLocale, string> {
  const entry = manifest.find(({ urls }) =>
    supportedLocales.some((locale) => urls[locale] === pathname),
  );
  if (!entry) throw new Error(`Canonical URL not found: ${pathname}`);
  return entry.urls;
}
