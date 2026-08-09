import { describe, expect, it } from "vitest";

import { createSiteConfig } from "./site-config.server";

describe("createSiteConfig", () => {
  it("uses and normalizes the template origin", () => {
    expect(createSiteConfig()).toEqual({
      origin: "https://example.com",
      siteName: "Agent-ready sites",
      defaultSocialImage: "/social-card.svg",
      xDefault: true,
    });
    expect(createSiteConfig("https://site.example/").origin).toBe(
      "https://site.example",
    );
  });

  it.each([
    "http://site.example",
    "https://user:secret@site.example",
    "https://site.example/path",
    "https://site.example?query=1",
    "https://site.example#fragment",
    "not-a-url",
  ])("rejects invalid production origin %s", (origin) => {
    expect(() => createSiteConfig(origin)).toThrow("Invalid SITE_ORIGIN");
  });
});
