import { useEffect, useState } from "react";

import type { Verdict } from "../../../scorecard/scoring";
import { useCountUp, usePrefersReducedMotion } from "./motion";

export type VerdictTone = "strong" | "gap" | "risk";

export function verdictTone(verdict: Verdict): VerdictTone {
  if (verdict === "strong") return "strong";
  if (verdict === "highRisk") return "risk";
  return "gap";
}

const radius = 54;
const circumference = 2 * Math.PI * radius;

export function ScoreRing({
  score,
  tone,
}: {
  score: number;
  tone: VerdictTone;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const displayed = useCountUp(score, reducedMotion ? 0 : 1100);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const filled = drawn || reducedMotion ? score : 0;

  return (
    <div
      aria-hidden="true"
      className={`rs-tone-${tone} relative h-48 w-48 shrink-0 sm:h-56 sm:w-56`}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          fill="none"
          r={radius}
          stroke="var(--hairline)"
          strokeWidth="8"
        />
        <circle
          className="rs-ring-arc"
          cx="64"
          cy="64"
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled / 100)}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-bold leading-none tabular-nums text-foreground sm:text-7xl">
          {displayed}
        </span>
        <span className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          /100
        </span>
      </div>
    </div>
  );
}
