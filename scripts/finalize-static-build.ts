import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
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

const applicationImagePattern =
  /^\/assets\/.+-(?=[A-Za-z0-9_-]{8}\.[^/]+$)[A-Za-z0-9_-]{8}\.[^/]+$/;
const browserImageExtensionPattern =
  /\.(?:svg|png|jpe?g|gif|webp|avif|ico|apng|bmp|jfif|pjpeg|pjp|cur|jxl)$/i;

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

function resolveLocalImage(
  src: string,
  pathname: string,
  artifact: string,
): URL | undefined {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return undefined;
  let destination: URL;
  try {
    destination = new URL(src, new URL(pathname, "https://static.invalid/"));
  } catch {
    throw new Error(`Missing local image ${src} in ${artifact}`);
  }
  return destination.origin === "https://static.invalid"
    ? destination
    : undefined;
}

function imageFilePath(
  clientDirectory: string,
  decodedPathname: string,
  artifact: string,
  src: string,
): string {
  const file = join(
    clientDirectory,
    ...decodedPathname.split("/").filter(Boolean),
  );
  const outsideClient = relative(clientDirectory, file);
  if (outsideClient === ".." || outsideClient.startsWith(`..${sep}`)) {
    throw new Error(`Missing local image ${src} in ${artifact}`);
  }
  return file;
}

function invalidImageSource(src: string, artifact: string): never {
  const label = src === "" ? "(empty)" : src;
  throw new Error(`Invalid local image source ${label} in ${artifact}`);
}

function validateImageTarget(
  file: string,
  pathname: string,
  src: string,
  artifact: string,
): void {
  if (!browserImageExtensionPattern.test(pathname)) {
    invalidImageSource(src, artifact);
  }
  if (!existsSync(file)) {
    throw new Error(`Missing local image ${src} in ${artifact}`);
  }
  if (!statSync(file).isFile()) {
    invalidImageSource(src, artifact);
  }
}

function validateImageSource(
  src: string,
  artifact: string,
  pathname: string,
  clientDirectory: string,
): void {
  const destination = resolveLocalImage(src, pathname, artifact);
  if (!destination) return;
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(destination.pathname);
  } catch {
    throw new Error(`Missing local image ${src} in ${artifact}`);
  }
  const file = imageFilePath(clientDirectory, decodedPathname, artifact, src);
  validateImageTarget(file, decodedPathname, src, artifact);
  if (
    decodedPathname.startsWith("/assets/") &&
    !applicationImagePattern.test(decodedPathname)
  ) {
    throw new Error(`Unhashed application image ${src} in ${artifact}`);
  }
}

function findImageTagEnd(html: string, start: number): number {
  let quote: string | undefined;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }
  return -1;
}

function skipAttributeWhitespace(tag: string, start: number): number {
  let index = start;
  while (index < tag.length && /\s/.test(tag[index])) index += 1;
  return index;
}

function readAttributeName(tag: string, start: number): [string, number] {
  let index = start;
  while (index < tag.length && !/[\s=/>]/.test(tag[index])) index += 1;
  return [tag.slice(start, index).toLowerCase(), index];
}

function readQuotedAttributeValue(
  tag: string,
  start: number,
  quote: string,
): [string, number] | undefined {
  let index = start + 1;
  while (index < tag.length && tag[index] !== quote) index += 1;
  if (index >= tag.length) return undefined;
  return [tag.slice(start + 1, index), index + 1];
}

function readUnquotedAttributeValue(
  tag: string,
  start: number,
): [string, number] {
  let index = start;
  while (index < tag.length && !/[\s>]/.test(tag[index])) index += 1;
  return [tag.slice(start, index), index];
}

function readAttributeValue(
  tag: string,
  start: number,
): [string, number] | undefined {
  const index = skipAttributeWhitespace(tag, start);
  const quote = tag[index];
  if (quote === '"' || quote === "'") {
    return readQuotedAttributeValue(tag, index, quote);
  }
  return readUnquotedAttributeValue(tag, index);
}

function extractImageSource(tag: string): string | undefined {
  let index = 4;
  while (index < tag.length - 1) {
    index = skipAttributeWhitespace(tag, index);
    if (tag[index] === "/" || tag[index] === ">") break;
    const [name, nameEnd] = readAttributeName(tag, index);
    index = skipAttributeWhitespace(tag, nameEnd);
    if (tag[index] !== "=") continue;
    const value = readAttributeValue(tag, index + 1);
    if (!value) return undefined;
    index = value[1];
    if (name === "src") return value[0];
  }
  return undefined;
}

function validateImages(
  html: string,
  artifact: string,
  pathname: string,
  clientDirectory: string,
): void {
  const imageStartPattern = /<img(?=[\s/>])/gi;
  for (const match of html.matchAll(imageStartPattern)) {
    const start = match.index ?? 0;
    const end = findImageTagEnd(html, start);
    if (end < 0) continue;
    const src = extractImageSource(html.slice(start, end + 1));
    if (src === undefined) {
      throw new Error(`Missing image src in ${artifact}`);
    }
    validateImageSource(src, artifact, pathname, clientDirectory);
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
      validateImages(html, artifact, entry.urls[locale], clientDirectory);
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
  validateImages(rootHtml, "index.html", "/", clientDirectory);
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
