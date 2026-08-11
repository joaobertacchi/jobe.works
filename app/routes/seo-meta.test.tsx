import { describe, expect, it } from "vitest";

import { meta as rootMeta } from "./_index";
import { meta as notFoundMeta } from "./$locale.404";
import { meta as homeMeta } from "./$locale._index";
import { meta as privacyMeta } from "./$locale.privacy";

const site = {
  origin: "https://example.com",
  siteName: "Agent-ready sites",
  defaultSocialImage: "/social-card.svg",
  xDefault: true,
};

function args(pathname: string, locale: "en" | "pt-BR") {
  const logicalPath = pathname.replace(/^\/(en|pt-BR)/, "") || "/";
  const suffix = logicalPath === "/" ? "/" : logicalPath;
  return {
    params: { locale },
    matches: [
      { id: "root", loaderData: null },
      {
        id: "routes/$locale",
        loaderData: {
          urls: {
            en: `/en${suffix}`,
            "pt-BR": `/pt-BR${suffix}`,
          },
          site,
        },
      },
    ],
  } as never;
}

describe("route SEO metadata", () => {
  it("emits localized Home metadata and Organization JSON-LD", () => {
    const meta = homeMeta(args("/en/", "en"));

    expect(meta).toContainEqual({
      title: "Static Website Template for AI-Assisted Teams",
    });
    expect(meta).toContainEqual(
      expect.objectContaining({
        "script:ld+json": expect.objectContaining({
          "@type": "Organization",
        }),
      }),
    );
  });

  it("marks localized 404 and root infrastructure noindex", () => {
    expect(notFoundMeta(args("/en/404", "en"))).toContainEqual({
      name: "robots",
      content: "noindex,follow",
    });
    expect(rootMeta()).toEqual([{ name: "robots", content: "noindex,follow" }]);
  });

  it("emits indexable localized Privacy metadata", () => {
    const meta = privacyMeta(args("/en/privacy", "en"));
    expect(meta).toContainEqual({
      title: "Privacy Notice | Agent-ready Static Sites",
    });
    expect(meta).toContainEqual({ name: "robots", content: "index,follow" });
    expect(meta).not.toContainEqual(
      expect.objectContaining({ "script:ld+json": expect.anything() }),
    );
  });

  it("does not emit localized metadata for unsupported locales", () => {
    expect(
      homeMeta({ params: { locale: "fr" }, matches: [] } as never),
    ).toEqual([]);
  });
});
