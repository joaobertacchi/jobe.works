import { useEffect } from "react";

/**
 * Set on <html> once React has hydrated the prerendered document. Browser
 * tests wait for it before interacting, since prerendered markup is visible
 * and clickable before its handlers are attached.
 */
export const HYDRATED_ATTRIBUTE = "data-hydrated";

export function useHydrationMarker(): void {
  useEffect(() => {
    document.documentElement.setAttribute(HYDRATED_ATTRIBUTE, "");
  }, []);
}
