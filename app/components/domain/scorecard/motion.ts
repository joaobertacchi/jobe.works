import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function canMatchMedia(): boolean {
  return (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
  );
}

function subscribeToReducedMotion(onChange: () => void): () => void {
  if (!canMatchMedia()) return () => {};
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readReducedMotion(): boolean {
  return canMatchMedia() && window.matchMedia(reducedMotionQuery).matches;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    readReducedMotion,
    () => false,
  );
}

const subscribeNever = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

export function useCountUp(target: number, durationMs: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (durationMs <= 0) return;
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return durationMs <= 0 ? target : value;
}

export function revealDelay(ms: number): CSSProperties {
  return { "--rs-delay": `${ms}ms` } as CSSProperties;
}
