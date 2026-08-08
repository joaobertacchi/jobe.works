import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

import {
  isSupportedLocale,
  locales,
  supportedLocales,
} from "../app/i18n/config";
import {
  getCanonicalUrls,
  type CanonicalUrlManifest,
} from "../app/routing/canonical-url-manifest";

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

function validateLinks(
  html: string,
  artifact: string,
  publishedUrls: ReadonlySet<string>,
): void {
  const anchorPattern = /<a\b[^>]*\bhref\s*=\s*(["'])(\/[^"'#?]*)[^"']*\1/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const href = match[2];
    if (href !== "/" && !publishedUrls.has(href)) {
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
): void {
  for (const entry of manifest) {
    for (const locale of supportedLocales) {
      const artifact = artifactPath(entry.urls[locale]);
      const html = readRequiredHtml(clientDirectory, artifact);
      const expectedLang = locales[locale].htmlLang;
      if (!html.includes(`<html lang="${expectedLang}"`)) {
        throw new Error(
          `Expected ${artifact} to use html lang ${expectedLang}`,
        );
      }
      validateLinks(html, artifact, publishedUrls);
    }
  }
}

export function finalizeStaticBuild(
  clientDirectory: string,
  manifest: CanonicalUrlManifest,
): void {
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
  validateLinks(rootHtml, "index.html", publishedUrls);
  validateLocalizedHtml(clientDirectory, manifest, publishedUrls);

  rmSync(join(dirname(clientDirectory), "server"), {
    force: true,
    recursive: true,
  });
  rmSync(join(clientDirectory, fallbackArtifact));
}
