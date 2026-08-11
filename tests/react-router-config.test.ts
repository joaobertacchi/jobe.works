import { describe, expect, it } from "vitest";

import type { CanonicalUrlManifest } from "../app/routing/canonical-url-manifest";
import config, { getPrerenderPaths } from "../react-router.config";

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

describe("React Router static configuration", () => {
  it("disables runtime SSR and expands concrete prerender boundaries", () => {
    expect(config.ssr).toBe(false);
    expect(
      getPrerenderPaths(
        ["/", "/health", "/:locale/about", "/files/*", "/en/about"],
        manifest,
      ),
    ).toEqual(["/", "/health", "/en/about", "/en/", "/pt-BR/", "/pt-BR/about"]);
  });
});
