import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { CanonicalUrlManifest } from "../app/routing/canonical-url-manifest";
import { finalizeStaticBuild } from "./finalize-static-build";

const manifest = [
  {
    id: "home",
    kind: "page",
    pattern: "/:locale/",
    urls: { en: "/en/", "pt-BR": "/pt-BR/" },
  },
  {
    id: "about",
    kind: "page",
    pattern: "/:locale/about",
    urls: { en: "/en/about", "pt-BR": "/pt-BR/about" },
  },
] satisfies CanonicalUrlManifest;

function html(lang: string, href = "/en/about") {
  return `<!doctype html><html lang="${lang}"><body><a href="${href}">Link</a></body></html>`;
}

function writeHtml(client: string, url: string, content: string) {
  const segments = url.split("/").filter(Boolean);
  const directory = join(client, ...segments);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), content);
}

function createCompleteBuild() {
  const root = mkdtempSync(join(tmpdir(), "static-build-"));
  const client = join(root, "client");
  mkdirSync(client);
  writeFileSync(join(client, "index.html"), html("pt-BR", "/"));
  writeFileSync(join(client, "__spa-fallback.html"), html("pt-BR", "/"));
  writeHtml(client, "/en/", html("en"));
  writeHtml(client, "/en/about", html("en"));
  writeHtml(client, "/pt-BR/", html("pt-BR", "/pt-BR/about"));
  writeHtml(client, "/pt-BR/about", html("pt-BR", "/pt-BR/"));
  mkdirSync(join(root, "server"));
  return { client, root };
}

describe("finalizeStaticBuild", () => {
  it("accepts complete output and removes build-only artifacts", () => {
    const { client, root } = createCompleteBuild();

    finalizeStaticBuild(client, manifest);

    expect(existsSync(join(root, "server"))).toBe(false);
    expect(existsSync(join(client, "__spa-fallback.html"))).toBe(false);
  });

  it("rejects a missing manifest artifact", () => {
    const { client } = createCompleteBuild();
    const missing = join(client, "pt-BR", "about", "index.html");
    writeFileSync(missing, "");

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Invalid HTML artifact: pt-BR/about/index.html",
    );
  });

  it("rejects an unexpected unsupported-locale artifact", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/fr/about", html("fr"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unexpected HTML artifact: fr/about/index.html",
    );
  });

  it("rejects the wrong document language", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/pt-BR/about", html("en"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Expected pt-BR/about/index.html to use html lang pt-BR",
    );
  });

  it("rejects an internal link outside the manifest", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/en/about", html("en", "/en/missing"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unknown internal link /en/missing in en/about/index.html",
    );
  });

  it("rejects output without a prerendered root", () => {
    const { client } = createCompleteBuild();
    writeFileSync(join(client, "index.html"), "");

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Invalid HTML artifact: index.html",
    );
  });

  it("rejects output without SPA-fallback build evidence", () => {
    const { client } = createCompleteBuild();
    writeFileSync(join(client, "__spa-fallback.html"), "");

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Invalid prerender evidence: __spa-fallback.html",
    );
  });
});
