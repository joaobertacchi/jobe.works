import { describe, expect, it } from "vitest";

import { meta as rootMeta } from "./_index";
import { meta as notFoundMeta } from "./$locale.404";
import { meta as homeMeta } from "./$locale._index";
import { meta as privacyMeta } from "./$locale.privacy";
import { meta as scorecardMeta } from "./$locale.scorecard";

const site = {
  origin: "https://jobe.works",
  siteName: "JOBE",
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
  it("emits localized, indexable scorecard metadata", () => {
    const meta = scorecardMeta(args("/pt-BR/scorecard", "pt-BR"));

    expect(meta).toContainEqual({
      title: "Autoavaliação de Produção | JOBE — Engenharia que Funciona",
    });
    expect(meta).not.toContainEqual({
      name: "robots",
      content: "noindex,follow",
    });
  });

  it("emits localized Home metadata and Organization JSON-LD", () => {
    const meta = homeMeta(args("/en/", "en"));

    expect(meta).toContainEqual({
      title: "JOBE — Engineering that Works",
    });
    expect(meta).toContainEqual(
      expect.objectContaining({
        "script:ld+json": expect.objectContaining({
          "@type": "Organization",
          name: "JOBE",
          email: "contato@jobe.works",
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
      title: "Privacy Notice | JOBE — Engineering that Works",
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
