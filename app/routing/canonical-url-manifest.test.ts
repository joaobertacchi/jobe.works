import type { RouteConfigEntry } from "@react-router/dev/routes";
import { describe, expect, it } from "vitest";

import {
  createCanonicalUrlManifest,
  getCanonicalUrls,
  getLocalizedUrlsForPathname,
  type CanonicalUrlManifest,
  validateCanonicalUrlManifest,
} from "./canonical-url-manifest";

function localizedRoutes(children: RouteConfigEntry[]): RouteConfigEntry[] {
  const localizedChildren = children.some((child) => child.index)
    ? children
    : [{ file: "routes/$locale._index.tsx", index: true }, ...children];
  return [
    { file: "routes/_index.tsx", index: true },
    {
      file: "routes/$locale.tsx",
      path: ":locale",
      children: localizedChildren,
    },
  ];
}

describe("canonical URL manifest", () => {
  it("expands publishable filesystem routes for every locale", () => {
    const manifest = createCanonicalUrlManifest(
      localizedRoutes([
        { file: "routes/$locale._index.tsx", index: true },
        { file: "routes/$locale.about.tsx", path: "about" },
        { file: "routes/$locale.services.tsx", path: "services" },
        { file: "routes/$locale.404.tsx", path: "404" },
        { file: "routes/$locale.$.tsx", path: "*" },
      ]),
    );

    expect(manifest).toEqual([
      {
        id: "home",
        kind: "page",
        pattern: "/:locale/",
        urls: { en: "/en/", "pt-BR": "/pt-BR/" },
      },
      {
        id: "404",
        kind: "utility",
        pattern: "/:locale/404",
        urls: { en: "/en/404", "pt-BR": "/pt-BR/404" },
      },
      {
        id: "about",
        kind: "page",
        pattern: "/:locale/about",
        urls: { en: "/en/about", "pt-BR": "/pt-BR/about" },
      },
      {
        id: "services",
        kind: "page",
        pattern: "/:locale/services",
        urls: { en: "/en/services", "pt-BR": "/pt-BR/services" },
      },
    ]);
    expect(getCanonicalUrls(manifest)).toEqual([
      "/en/",
      "/pt-BR/",
      "/en/404",
      "/pt-BR/404",
      "/en/about",
      "/pt-BR/about",
      "/en/services",
      "/pt-BR/services",
    ]);
  });

  it.each([
    ["/en/", { en: "/en/", "pt-BR": "/pt-BR/" }],
    ["/en/about", { en: "/en/about", "pt-BR": "/pt-BR/about" }],
  ] as const)("resolves localized siblings for %s", (pathname, expected) => {
    const manifest = createCanonicalUrlManifest(
      localizedRoutes([
        { file: "routes/$locale._index.tsx", index: true },
        { file: "routes/$locale.about.tsx", path: "about" },
        { file: "routes/$locale.services.tsx", path: "services" },
        { file: "routes/$locale.404.tsx", path: "404" },
        { file: "routes/$locale.$.tsx", path: "*" },
      ]),
    );

    expect(getLocalizedUrlsForPathname(manifest, pathname)).toEqual(expected);
  });

  it("rejects a pathname absent from the canonical manifest", () => {
    const manifest = createCanonicalUrlManifest(
      localizedRoutes([
        { file: "routes/$locale._index.tsx", index: true },
        { file: "routes/$locale.about.tsx", path: "about" },
        { file: "routes/$locale.services.tsx", path: "services" },
        { file: "routes/$locale.404.tsx", path: "404" },
        { file: "routes/$locale.$.tsx", path: "*" },
      ]),
    );

    expect(() =>
      getLocalizedUrlsForPathname(manifest, "/en/not-published"),
    ).toThrow("Canonical URL not found: /en/not-published");
    expect(() => getLocalizedUrlsForPathname(manifest, "/en/about/")).toThrow(
      "Canonical URL not found: /en/about/",
    );
    expect(() => getLocalizedUrlsForPathname(manifest, "/en/About")).toThrow(
      "Canonical URL not found: /en/About",
    );
  });

  it.each([
    ["blog/:slug", "unresolved parameter"],
    ["About", "lowercase"],
    ["about.html", ".html"],
    ["about//team", "duplicate slashes"],
  ])("rejects invalid route pattern %s", (path, message) => {
    const routes = localizedRoutes([{ file: "routes/invalid.tsx", path }]);

    expect(() => createCanonicalUrlManifest(routes)).toThrow(message);
  });

  it("rejects a public leaf without a locale prefix", () => {
    const routes = [{ file: "routes/about.tsx", path: "about" }];

    expect(() => createCanonicalUrlManifest(routes)).toThrow("locale-prefixed");
  });

  it("rejects duplicate logical paths", () => {
    const routes = localizedRoutes([
      { file: "routes/about.tsx", path: "about" },
      { file: "routes/duplicate-about.tsx", path: "about" },
    ]);

    expect(() => createCanonicalUrlManifest(routes)).toThrow(
      "Duplicate logical page: about",
    );
  });

  it("rejects a path-bearing parent without an index route", () => {
    const routes = localizedRoutes([
      {
        file: "routes/docs.tsx",
        path: "docs",
        children: [{ file: "routes/docs.guide.tsx", path: "guide" }],
      },
    ]);

    expect(() => createCanonicalUrlManifest(routes)).toThrow(
      "Path-bearing parent requires an index route: :locale/docs",
    );
  });

  it("rejects a locale root without an index route", () => {
    const routes = [
      {
        file: "routes/$locale.tsx",
        path: ":locale",
        children: [{ file: "routes/$locale.about.tsx", path: "about" }],
      },
    ];

    expect(() => createCanonicalUrlManifest(routes)).toThrow(
      "Path-bearing parent requires an index route: :locale",
    );
  });

  it("rejects non-structural splat routes", () => {
    const routes = localizedRoutes([
      { file: "routes/files.$.tsx", path: "files/*" },
    ]);

    expect(() => createCanonicalUrlManifest(routes)).toThrow(
      "Unsupported public splat route: :locale/files/*",
    );
  });

  it("rejects incomplete locale siblings", () => {
    const incomplete = [
      {
        id: "about",
        kind: "page",
        pattern: "/:locale/about",
        urls: { en: "/en/about" },
      },
    ] as unknown as CanonicalUrlManifest;

    expect(() => validateCanonicalUrlManifest(incomplete)).toThrow(
      "Missing locale pt-BR for about",
    );
  });

  it("rejects a URL under the wrong canonical locale", () => {
    const invalid = [
      {
        id: "about",
        kind: "page",
        pattern: "/:locale/about",
        urls: { en: "/en/about", "pt-BR": "/fr/about" },
      },
    ] as CanonicalUrlManifest;

    expect(() => validateCanonicalUrlManifest(invalid)).toThrow(
      "Invalid canonical URL for pt-BR: /fr/about",
    );
  });

  it("rejects duplicate concrete URLs", () => {
    const invalid = [
      {
        id: "about",
        kind: "page",
        pattern: "/:locale/about",
        urls: { en: "/en/about", "pt-BR": "/en/about" },
      },
    ] as CanonicalUrlManifest;

    expect(() => validateCanonicalUrlManifest(invalid)).toThrow(
      "Duplicate canonical URL: /en/about",
    );
  });
});
