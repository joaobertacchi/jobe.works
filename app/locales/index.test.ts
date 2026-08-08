import { describe, expect, it } from "vitest";

import { translations } from "./index";

describe("locale scaffolding", () => {
  it("registers the committed locale dictionaries", () => {
    expect(translations).toEqual({
      en: {},
      "pt-BR": {},
    });
  });
});
