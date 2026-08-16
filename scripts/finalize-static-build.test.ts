import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

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

function html(lang: string, href = "/en/about", pathname?: string) {
  if (!pathname) {
    return `<!doctype html><html lang="${lang}"><body><a href="${href}">Link</a></body></html>`;
  }
  const logicalPath = pathname.replace(/^\/(en|pt-BR)/, "") || "/";
  const suffix = logicalPath === "/" ? "/" : logicalPath;
  const canonical = `https://jobe.works${pathname}`;
  const ogLocale = lang === "en" ? "en_US" : "pt_BR";
  const alternateOgLocale = lang === "en" ? "pt_BR" : "en_US";
  return `<!doctype html><html lang="${lang}"><head><title>Page</title><meta name="description" content="Description"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en" href="https://jobe.works/en${suffix}"><link rel="alternate" hreflang="pt-BR" href="https://jobe.works/pt-BR${suffix}"><link rel="alternate" hreflang="x-default" href="https://jobe.works/pt-BR${suffix}"><meta property="og:type" content="website"><meta property="og:site_name" content="JOBE"><meta property="og:url" content="${canonical}"><meta property="og:title" content="Page"><meta property="og:description" content="Description"><meta property="og:image" content="https://jobe.works/social-card.svg"><meta property="og:locale" content="${ogLocale}"><meta property="og:locale:alternate" content="${alternateOgLocale}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Page"><meta name="twitter:description" content="Description"><meta name="twitter:image" content="https://jobe.works/social-card.svg"></head><body><a href="${href}">Link</a></body></html>`;
}

function withImage(content: string, src: string) {
  return content.replace("</body>", `<img src="${src}" alt="Workflow"></body>`);
}

function writeHtml(client: string, url: string, content: string) {
  const segments = url.split("/").filter(Boolean);
  const directory = join(client, ...segments);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), content);
}

function writeAsset(client: string, path: string) {
  const file = join(client, ...path.split("/").filter(Boolean));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, "asset");
}

function createCompleteBuild() {
  const root = mkdtempSync(join(tmpdir(), "static-build-"));
  const client = join(root, "client");
  mkdirSync(client);
  writeFileSync(join(client, "index.html"), html("pt-BR", "/"));
  writeFileSync(join(client, "__spa-fallback.html"), html("pt-BR", "/"));
  writeHtml(client, "/en/", html("en", "/en/about", "/en/"));
  writeHtml(client, "/en/about", html("en", "/en/about", "/en/about"));
  writeHtml(client, "/pt-BR/", html("pt-BR", "/pt-BR/about", "/pt-BR/"));
  writeHtml(client, "/pt-BR/about", html("pt-BR", "/pt-BR/", "/pt-BR/about"));
  mkdirSync(join(root, "server"));
  return { client, root };
}

describe("finalizeStaticBuild", () => {
  it("accepts complete output and removes build-only artifacts", () => {
    const { client, root } = createCompleteBuild();

    finalizeStaticBuild(client, manifest);

    expect(existsSync(join(root, "server"))).toBe(false);
    expect(existsSync(join(client, "__spa-fallback.html"))).toBe(false);
    expect(readFileSync(join(client, "sitemap.xml"), "utf8")).toContain(
      "https://jobe.works/en/about",
    );
    expect(readFileSync(join(client, "robots.txt"), "utf8")).toContain(
      "Sitemap: https://jobe.works/sitemap.xml",
    );
  });

  it.each([
    ["index.html", "Missing HTML artifact: index.html"],
    ["pt-BR/about/index.html", "Missing HTML artifact: pt-BR/about/index.html"],
  ])(
    "rejects a physically missing required artifact %s",
    (artifact, message) => {
      const { client } = createCompleteBuild();
      rmSync(join(client, artifact));

      expect(() => finalizeStaticBuild(client, manifest)).toThrow(message);
    },
  );

  it("rejects an empty required artifact", () => {
    const { client } = createCompleteBuild();
    writeFileSync(join(client, "en", "about", "index.html"), "");

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Invalid HTML artifact: en/about/index.html",
    );
  });

  it("rejects an unsupported-locale artifact", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/fr/about", html("fr"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unsupported locale directory: fr",
    );
  });

  it("rejects an unexpected artifact under a supported locale", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/en/unexpected", html("en"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unexpected HTML artifact: en/unexpected/index.html",
    );
  });

  it("rejects the wrong document language", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/pt-BR/about", html("en", "/pt-BR/", "/pt-BR/about"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Expected pt-BR/about/index.html to use html lang pt-BR",
    );
  });

  it("rejects an internal link outside the manifest", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/en/about", html("en", "/en/missing", "/en/about"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unknown internal link /en/missing in en/about/index.html",
    );
  });

  it("validates single-quoted anchor links with spaced attributes", () => {
    const { client } = createCompleteBuild();
    writeHtml(
      client,
      "/en/about",
      html("en", "/en/missing", "/en/about").replace(
        '<a href="/en/missing">',
        "<a href = '/en/missing'>",
      ),
    );

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unknown internal link /en/missing in en/about/index.html",
    );
  });

  it.each(["services", "https://jobe.works/en/missing"])(
    "rejects invalid internal link %s",
    (href) => {
      const { client } = createCompleteBuild();
      writeHtml(client, "/en/about", html("en", href, "/en/about"));

      expect(() => finalizeStaticBuild(client, manifest)).toThrow(
        `Unknown internal link ${href} in en/about/index.html`,
      );
    },
  );

  it("rejects nonlocalized root links from localized pages", () => {
    const { client } = createCompleteBuild();
    writeHtml(client, "/en/about", html("en", "/", "/en/about"));

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unknown internal link / in en/about/index.html",
    );
  });

  it("validates unquoted internal href values", () => {
    const { client } = createCompleteBuild();
    writeHtml(
      client,
      "/en/about",
      html("en", "/en/missing", "/en/about").replace(
        'href="/en/missing"',
        "href=/en/missing",
      ),
    );

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unknown internal link /en/missing in en/about/index.html",
    );
  });

  it("allows external and non-navigation link schemes", () => {
    const { client } = createCompleteBuild();
    writeHtml(
      client,
      "/en/about",
      html("en", "mailto:hello@example.com", "/en/about"),
    );

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });

  it("rejects unsupported locale directories without HTML", () => {
    const { client } = createCompleteBuild();
    const localeDirectory = join(client, "fr");
    mkdirSync(localeDirectory);
    writeFileSync(join(localeDirectory, "asset.txt"), "unsupported locale");

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unsupported locale directory: fr",
    );
  });

  it("rejects output without SPA-fallback build evidence", () => {
    const { client } = createCompleteBuild();
    writeFileSync(join(client, "__spa-fallback.html"), "");

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Invalid prerender evidence: __spa-fallback.html",
    );
  });

  it("accepts an existing hashed application image", () => {
    const { client } = createCompleteBuild();
    const image = "/assets/about-workflow-Ab12Cd34.svg";
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), image),
    );
    writeAsset(client, image);

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });

  it("accepts an existing lowercase-only hashed application image", () => {
    const { client } = createCompleteBuild();
    const image = "/assets/about-workflow-abcdefgh.svg";
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), image),
    );
    writeAsset(client, image);

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });

  it("resolves relative images from the public page pathname", () => {
    const { client } = createCompleteBuild();
    const image = "workflow.svg";
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), image),
    );
    writeAsset(client, "/en/workflow.svg");

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });

  it.each(["apng", "bmp", "jfif", "pjpeg", "pjp", "cur", "jxl"])(
    "accepts an existing hashed image with the %s extension",
    (extension) => {
      const { client } = createCompleteBuild();
      const image = `/assets/workflow-Ab12Cd34.${extension}`;
      writeHtml(
        client,
        "/en/about",
        withImage(html("en", "/en/about", "/en/about"), image),
      );
      writeAsset(client, image);

      expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
    },
  );

  it("rejects a missing local application image", () => {
    const { client } = createCompleteBuild();
    const image = "/assets/about-workflow-Ab12Cd34.svg";
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), image),
    );

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Missing local image /assets/about-workflow-Ab12Cd34.svg in en/about/index.html",
    );
  });

  it("rejects an unhashed local application image", () => {
    const { client } = createCompleteBuild();
    const image = "/assets/about-image.svg";
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), image),
    );
    writeAsset(client, image);

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      "Unhashed application image /assets/about-image.svg in en/about/index.html",
    );
  });

  it.each(["", "/", "?v=1", "#fragment"])(
    "rejects an invalid local image source %s",
    (src) => {
      const { client } = createCompleteBuild();
      const label = src || "(empty)";
      writeHtml(
        client,
        "/en/about",
        withImage(html("en", "/en/about", "/en/about"), src),
      );

      expect(() => finalizeStaticBuild(client, manifest)).toThrow(
        `Invalid local image source ${label} in en/about/index.html`,
      );
    },
  );

  it("validates an image's exact src attribute instead of data-src", () => {
    const { client } = createCompleteBuild();
    const image = "/assets/good-Ab12Cd34.svg";
    writeHtml(
      client,
      "/en/about",
      html("en", "/en/about", "/en/about").replace(
        "</body>",
        `<img src="${image}" data-src="/assets/missing.svg"></body>`,
      ),
    );
    writeAsset(client, image);

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });

  it.each(['<img alt="Workflow">', '<img src alt="Workflow">'])(
    "rejects an image without an assigned src attribute",
    (imageTag) => {
      const { client } = createCompleteBuild();
      writeHtml(
        client,
        "/en/about",
        html("en", "/en/about", "/en/about").replace(
          "</body>",
          `${imageTag}</body>`,
        ),
      );

      expect(() => finalizeStaticBuild(client, manifest)).toThrow(
        "Missing image src in en/about/index.html",
      );
    },
  );

  it("finds an image src after greater-than signs in quoted values", () => {
    const { client } = createCompleteBuild();
    const image = "/assets/missing.svg";
    writeHtml(
      client,
      "/en/about",
      html("en", "/en/about", "/en/about").replace(
        "</body>",
        `<img alt="1 > 0" src="${image}"></body>`,
      ),
    );

    expect(() => finalizeStaticBuild(client, manifest)).toThrow(
      `Missing local image ${image} in en/about/index.html`,
    );
  });

  it.each([
    "https://cdn.example.com/about-workflow.svg",
    "data:image/svg+xml,<svg></svg>",
    "https://static.invalid/external.svg",
    "//static.invalid/external.svg",
  ])("ignores non-local image %s", (image) => {
    const { client } = createCompleteBuild();
    writeHtml(
      client,
      "/en/about",
      withImage(html("en", "/en/about", "/en/about"), image),
    );

    expect(() => finalizeStaticBuild(client, manifest)).not.toThrow();
  });
});
