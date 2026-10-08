import { useState } from "react";

import { useAnalytics } from "../../../analytics/analytics";
import { useI18n } from "../../../i18n/i18n";
import {
  isStrongResult,
  type ScorecardResult,
} from "../../../scorecard/scoring";
import { Button } from "../../ui/button";
import { revealDelay } from "./motion";

function useDiagnosticMailto(
  result: ScorecardResult,
  verdictLabel: string,
): string {
  const { translate } = useI18n();
  const findings =
    result.findings
      .map(
        (finding) =>
          `${translate(`scorecard.categories.${finding.category}`)} — ${translate(`scorecard.results.severities.${finding.severity}`)}`,
      )
      .join("; ") || translate("scorecard.mailto.none");
  const subject = translate("scorecard.mailto.subject", {
    values: { score: result.score },
  });
  const body = translate("scorecard.mailto.body", {
    values: {
      score: result.score,
      verdict: verdictLabel,
      findings,
      unknowns: result.criticalUnknowns.length,
      url: window.location.href,
    },
  });
  return `mailto:${translate("contact.emailAddress")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function CopyResultLink() {
  const { translate } = useI18n();
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  }

  return (
    <>
      <Button onClick={() => void copy()} variant="secondary">
        {translate(
          status === "copied"
            ? "scorecard.results.copied"
            : "scorecard.results.copyLink",
        )}
      </Button>
      {status === "manual" ? (
        <label className="flex w-full flex-col gap-2 text-sm">
          {translate("scorecard.results.copyFallback")}
          <input
            autoFocus
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            onFocus={(event) => event.currentTarget.select()}
            readOnly
            value={window.location.href}
          />
        </label>
      ) : null}
    </>
  );
}

type NextStepProps = {
  result: ScorecardResult;
  verdictLabel: string;
  onRetake: () => void;
};

export function NextStep({ result, verdictLabel, onRetake }: NextStepProps) {
  const { translate } = useI18n();
  const { capture } = useAnalytics();
  const href = useDiagnosticMailto(result, verdictLabel);
  const strong = isStrongResult(result);

  return (
    <section
      aria-labelledby="scorecard-next-step-title"
      className="rs-reveal flex flex-col gap-6 rounded-2xl bg-brand p-8 text-brand-foreground sm:p-12"
      style={revealDelay(1800)}
    >
      <h2
        className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
        id="scorecard-next-step-title"
      >
        {translate(
          strong
            ? "scorecard.results.nextStep.strongTitle"
            : "scorecard.results.nextStep.title",
        )}
      </h2>
      <p className="max-w-2xl text-lg leading-relaxed opacity-90">
        {translate(
          strong
            ? "scorecard.results.nextStep.strongDescription"
            : "scorecard.results.nextStep.description",
        )}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          className="inline-flex min-h-11 items-center justify-center bg-brand-foreground px-5 py-3 font-medium text-brand transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-foreground"
          href={href}
          onClick={() =>
            capture({
              eventName: "cta_pressed",
              ctaId: "scorecard-book",
              context: "scorecard-results",
            })
          }
        >
          {translate(
            strong
              ? "scorecard.results.nextStep.strongCta"
              : "scorecard.results.nextStep.cta",
          )}
        </a>
        <CopyResultLink />
        <Button onClick={onRetake} variant="secondary">
          {translate("scorecard.results.retake")}
        </Button>
      </div>
    </section>
  );
}
