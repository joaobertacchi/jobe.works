import { describe, expect, it } from "vitest";

import config from "../react-router.config";

describe("React Router static configuration", () => {
  it("disables runtime SSR and prerenders every static route", () => {
    expect(config).toMatchObject({
      ssr: false,
      prerender: true,
    });
  });
});
