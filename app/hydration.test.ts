import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HYDRATED_ATTRIBUTE, useHydrationMarker } from "./hydration";

afterEach(() => {
  document.documentElement.removeAttribute(HYDRATED_ATTRIBUTE);
});

describe("useHydrationMarker", () => {
  it("marks the document once mounted", () => {
    expect(document.documentElement.hasAttribute(HYDRATED_ATTRIBUTE)).toBe(
      false,
    );

    renderHook(() => useHydrationMarker());

    expect(document.documentElement.hasAttribute(HYDRATED_ATTRIBUTE)).toBe(
      true,
    );
  });
});
