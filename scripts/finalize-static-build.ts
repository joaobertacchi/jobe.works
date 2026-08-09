import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";

import { isSupportedLocale, supportedLocales } from "../app/i18n/config";
import {
  getCanonicalUrls,
  type CanonicalUrlManifest,
} from "../app/routing/canonical-url-manifest";
import { createSiteConfig } from "../app/seo/site-config.server";
import type { PublicSiteConfig } from "../app/seo/types";
import {
  createRobots,
  createSitemap,
  parseAndValidateSeoPage,
  type RenderedSeoPage,
  validateRenderedSeoPages,
  validateRobots,
  validateSitemap,
} from "./seo-static";

function artifactPath(url: string): string {
  if (url === "/") return "index.html";
  const path = url.replace(/^\//, "").replace(/\/$/, "");
  return `${path}/index.html`;
}

function listHtmlFiles(directory: string, root = directory): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path, root);
    if (!entry.name.endsWith(".html")) return [];
    return [relative(root, path).split(sep).join("/")];
  });
}

function readRequiredHtml(clientDirectory: string, path: string): string {
  const file = join(clientDirectory, path);
  if (!existsSync(file)) throw new Error(`Missing HTML artifact: ${path}`);
  const content = readFileSync(file, "utf8");
  if (!content.trim()) throw new Error(`Invalid HTML artifact: ${path}`);
  return content;
}

function resolveInternalLink(
  href: string,
  pathname: string,
  site: PublicSiteConfig,
  artifact: string,
): URL | undefined {
  if (!href || href.startsWith("#")) return undefined;
  const isAbsoluteHttp = /^https?:\/\//i.test(href);
  const hasOtherScheme = /^[a-z][a-z\d+.-]*:/i.test(href) && !isAbsoluteHttp;
  if (hasOtherScheme) return undefined;
  if (!isAbsoluteHttp && !href.startsWith("/")) {
    throw new Error(`Unknown internal link ${href} in ${artifact}`);
  }
  const destination = new URL(href, new URL(pathname, `${site.origin}/`));
  return destination.origin === site.origin ? destination : undefined;
}

function validateLinks(
  html: string,
  artifact: string,
  pathname: string,
  publishedUrls: ReadonlySet<string>,
  site: PublicSiteConfig,
): void {
  const anchorPattern =
    /<a\b[^>]*\bhref\s*=\s*(?:(["'])([^"']*)\1|([^\s>]+))/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const href = match[2] ?? match[3];
    const destination = resolveInternalLink(href, pathname, site, artifact);
    if (!destination) continue;
    if (destination.pathname === "/" && pathname !== "/") {
      throw new Error(`Unknown internal link ${href} in ${artifact}`);
    }
    if (
      destination.pathname !== "/" &&
      !publishedUrls.has(destination.pathname)
    ) {
      throw new Error(`Unknown internal link ${href} in ${artifact}`);
    }
  }
}

function validateLocaleDirectories(clientDirectory: string): void {
  const localePattern = /^[a-z]{2}(?:-[A-Za-z]{2})?$/;
  for (const entry of readdirSync(clientDirectory, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      localePattern.test(entry.name) &&
      !isSupportedLocale(entry.name)
    ) {
      throw new Error(`Unsupported locale directory: ${entry.name}`);
    }
  }
}

function validateLocalizedHtml(
  clientDirectory: string,
  manifest: CanonicalUrlManifest,
  publishedUrls: ReadonlySet<string>,
  site: PublicSiteConfig,
): RenderedSeoPage[] {
  const pages: RenderedSeoPage[] = [];
  for (const entry of manifest) {
    for (const locale of supportedLocales) {
      const artifact = artifactPath(entry.urls[locale]);
      const html = readRequiredHtml(clientDirectory, artifact);
      validateLinks(html, artifact, entry.urls[locale], publishedUrls, site);
      pages.push(
        parseAndValidateSeoPage({
          html,
          artifact,
          pathname: entry.urls[locale],
          locale,
          siblingUrls: entry.urls,
          site,
        }),
      );
    }
  }
  return pages;
}

export function finalizeStaticBuild(
  clientDirectory: string,
  manifest: CanonicalUrlManifest,
): void {
  const site = createSiteConfig();
  const fallbackArtifact = "__spa-fallback.html";
  validateLocaleDirectories(clientDirectory);
  const rootHtml = readRequiredHtml(clientDirectory, "index.html");
  const fallbackFile = join(clientDirectory, fallbackArtifact);
  if (
    !existsSync(fallbackFile) ||
    !readFileSync(fallbackFile, "utf8").includes("<html")
  ) {
    throw new Error(`Invalid prerender evidence: ${fallbackArtifact}`);
  }

  const canonicalUrls = getCanonicalUrls(manifest);
  const expectedArtifacts = new Set([
    "index.html",
    ...canonicalUrls.map(artifactPath),
  ]);
  const actualArtifacts = listHtmlFiles(clientDirectory).filter(
    (path) => path !== fallbackArtifact,
  );
  for (const artifact of actualArtifacts) {
    if (!expectedArtifacts.has(artifact)) {
      throw new Error(`Unexpected HTML artifact: ${artifact}`);
    }
  }
  for (const artifact of expectedArtifacts) {
    readRequiredHtml(clientDirectory, artifact);
  }

  const publishedUrls = new Set(canonicalUrls);
  validateLinks(rootHtml, "index.html", "/", publishedUrls, site);
  const renderedPages = validateLocalizedHtml(
    clientDirectory,
    manifest,
    publishedUrls,
    site,
  );
  validateRenderedSeoPages(renderedPages);
  const sitemap = createSitemap(renderedPages);
  validateSitemap(sitemap, renderedPages);
  writeFileSync(join(clientDirectory, "sitemap.xml"), sitemap);
  const robots = createRobots(site);
  validateRobots(robots, site);
  writeFileSync(join(clientDirectory, "robots.txt"), robots);

  rmSync(join(dirname(clientDirectory), "server"), {
    force: true,
    recursive: true,
  });
  rmSync(join(clientDirectory, fallbackArtifact));
}
