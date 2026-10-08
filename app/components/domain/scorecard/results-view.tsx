import { useEffect, useRef } from "react";

import { useI18n } from "../../../i18n/i18n";
import {
  categoryIds,
  getQuestion,
  type CategoryId,
  type QuestionId,
} from "../../../scorecard/questions";
import type { Finding, ScorecardResult } from "../../../scorecard/scoring";
import { Heading } from "../../ui/heading";
import { Text } from "../../ui/text";
import { revealDelay } from "./motion";
import { NextStep } from "./next-step";
import { ScoreRing, verdictTone } from "./score-ring";

function ResultSummary({
  result,
  verdictLabel,
  focusOnMount,
}: {
  result: ScorecardResult;
  verdictLabel: string;
  focusOnMount: boolean;
}) {
  const { translate } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tone = verdictTone(result.verdict);

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <section
      aria-labelledby="scorecard-result-title"
      className={`rs-tone-${tone} grid items-center gap-10 md:grid-cols-[auto_1fr]`}
    >
      <ScoreRing score={result.score} tone={tone} />
      <div className="flex flex-col gap-4">
        <p
          className="rs-reveal font-display text-sm font-semibold uppercase tracking-widest text-brand"
          style={revealDelay(200)}
        >
          {translate("scorecard.results.eyebrow")}
        </p>
        <Heading
          className="rs-reveal font-display outline-none"
          id="scorecard-result-title"
          level="display"
          ref={headingRef}
          style={revealDelay(350)}
          tabIndex={-1}
        >
          <span className="text-muted-foreground">
            {translate("scorecard.results.readiness")}:
          </span>{" "}
          <span className="rs-tone-text">{verdictLabel}</span>
        </Heading>
        <Text
          className="rs-reveal max-w-xl"
          style={revealDelay(500)}
          tone="muted"
        >
          {translate(`scorecard.results.verdicts.${result.verdict}.summary`)}
        </Text>
        {result.criticalRisks.length > 0 ? (
          <p
            className="rs-reveal border border-risk/40 bg-risk/10 px-4 py-3 text-sm font-medium text-foreground"
            role="note"
            style={revealDelay(650)}
          >
            {translate("scorecard.results.criticalBanner")}
          </p>
        ) : null}
        <p aria-live="polite" className="sr-only">
          {translate("scorecard.results.scoreAnnouncement", {
            values: { score: result.score, verdict: verdictLabel },
          })}
        </p>
      </div>
    </section>
  );
}

function flagsByCategory(result: ScorecardResult) {
  const flags = new Map<CategoryId, Finding["severity"]>();
  const mark = (ids: QuestionId[], severity: Finding["severity"]) => {
    for (const id of ids) {
      const category = getQuestion(id).category;
      if (!flags.has(category)) flags.set(category, severity);
    }
  };
  mark(result.criticalRisks, "criticalRisk");
  mark(result.criticalGaps, "criticalGap");
  return flags;
}

function CategoryBar({
  category,
  percent,
  flag,
  delayMs,
}: {
  category: CategoryId;
  percent: number;
  flag: Finding["severity"] | undefined;
  delayMs: number;
}) {
  const { translate } = useI18n();
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          {flag ? (
            <span
              aria-hidden="true"
              className={`rs-severity-${flag} h-2 w-2 shrink-0 rounded-full bg-[var(--rs-tone)]`}
            />
          ) : null}
          <span>{translate(`scorecard.categories.${category}`)}</span>
          {flag ? (
            <span className="sr-only">
              ({translate(`scorecard.results.severities.${flag}`)})
            </span>
          ) : null}
        </span>
        <span className="font-display font-semibold tabular-nums text-muted-foreground">
          {percent}%
        </span>
      </div>
      <span
        aria-hidden="true"
        className="block h-2 overflow-hidden bg-hairline"
      >
        <span
          className="rs-bar-fill block h-full bg-brand"
          style={{ width: `${percent}%`, ...revealDelay(delayMs) }}
        />
      </span>
    </li>
  );
}

function CategoryBreakdown({ result }: { result: ScorecardResult }) {
  const { translate } = useI18n();
  const flags = flagsByCategory(result);
  return (
    <section
      aria-labelledby="scorecard-categories-title"
      className="flex flex-col gap-6"
    >
      <Heading className="font-display" id="scorecard-categories-title">
        {translate("scorecard.results.categoriesTitle")}
      </Heading>
      <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        {categoryIds.map((category, index) => (
          <CategoryBar
            category={category}
            delayMs={700 + index * 60}
            flag={flags.get(category)}
            key={category}
            percent={result.categoryScores[category].percent}
          />
        ))}
      </ul>
    </section>
  );
}

function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  const { translate } = useI18n();
  const kind = finding.severity === "gap" ? "gap" : "critical";
  return (
    <li
      className={`rs-reveal rs-finding rs-severity-${finding.severity} atlas-plate flex flex-col gap-3 p-6`}
      style={revealDelay(1200 + index * 120)}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden="true"
          className="font-display text-3xl font-bold tabular-nums text-muted-foreground"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rs-severity-tag px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider">
          {translate(`scorecard.results.severities.${finding.severity}`)}
        </span>
      </div>
      <Heading as="h3" className="font-display" level="card">
        {translate(`scorecard.categories.${finding.category}`)}
      </Heading>
      <Text tone="muted">
        {translate(`scorecard.results.findings.${finding.category}.${kind}`)}
      </Text>
    </li>
  );
}

function FindingsList({ findings }: { findings: Finding[] }) {
  const { translate } = useI18n();
  return (
    <section
      aria-labelledby="scorecard-findings-title"
      className="flex flex-col gap-6"
    >
      <Heading className="font-display" id="scorecard-findings-title">
        {translate("scorecard.results.findingsTitle")}
      </Heading>
      {findings.length === 0 ? (
        <Text tone="muted">{translate("scorecard.results.noFindings")}</Text>
      ) : (
        <ol className="grid gap-4 lg:grid-cols-3">
          {findings.map((finding, index) => (
            <FindingCard
              finding={finding}
              index={index}
              key={finding.category}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function AreasToVerify({ questionIds }: { questionIds: QuestionId[] }) {
  const { translate } = useI18n();
  return (
    <section
      aria-labelledby="scorecard-unknowns-title"
      className="rs-reveal flex flex-col gap-4 border border-dashed border-unknown p-6 sm:p-8"
      style={revealDelay(1600)}
    >
      <Heading className="font-display" id="scorecard-unknowns-title">
        {translate("scorecard.results.unknownsTitle")}
      </Heading>
      <Text tone="muted">
        {translate("scorecard.results.unknownsDescription")}
      </Text>
      <ul className="flex flex-wrap gap-2">
        {questionIds.map((id) => (
          <li
            className="border border-unknown/60 px-3 py-1 text-sm text-foreground"
            key={id}
          >
            {translate(`scorecard.questions.${id}.topic`)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResultsView({
  result,
  onRetake,
  focusOnMount,
}: {
  result: ScorecardResult;
  onRetake: () => void;
  focusOnMount: boolean;
}) {
  const { translate } = useI18n();
  const verdictLabel = translate(
    `scorecard.results.verdicts.${result.verdict}.label`,
  );

  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <ResultSummary
        focusOnMount={focusOnMount}
        result={result}
        verdictLabel={verdictLabel}
      />
      <CategoryBreakdown result={result} />
      <FindingsList findings={result.findings} />
      {result.criticalUnknowns.length > 0 ? (
        <AreasToVerify questionIds={result.criticalUnknowns} />
      ) : null}
      <NextStep
        onRetake={onRetake}
        result={result}
        verdictLabel={verdictLabel}
      />
    </div>
  );
}
