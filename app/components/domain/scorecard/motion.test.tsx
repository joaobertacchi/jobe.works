import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { revealDelay, useCountUp, usePrefersReducedMotion } from "./motion";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("scorecard motion helpers", () => {
  it("reports reduced motion from matchMedia", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("treats a missing matchMedia as full motion", () => {
    vi.stubGlobal("matchMedia", undefined);

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns the target immediately when the duration is zero", () => {
    const { result } = renderHook(() => useCountUp(67, 0));
    expect(result.current).toBe(67);
  });

  it("starts counting from zero when animated", () => {
    const { result } = renderHook(() => useCountUp(67, 1000));
    expect(result.current).toBe(0);
  });

  it("exposes the reveal delay as a CSS custom property", () => {
    expect(revealDelay(120)).toEqual({ "--rs-delay": "120ms" });
  });
});
