import {
  categoryIds,
  getQuestion,
  questions,
  type CategoryId,
  type Question,
  type QuestionId,
} from "./questions";

export type Answer = "yes" | "partial" | "no" | "unknown" | "na";
export type Answers = Partial<Record<QuestionId, Answer>>;

export type Band = "strong" | "someGaps" | "significantGaps" | "highRisk";
export type Verdict = Band | "needsAttention";
export type FindingSeverity = "criticalRisk" | "criticalGap" | "gap";

export type Finding = {
  category: CategoryId;
  severity: FindingSeverity;
};

export type CategoryScore = {
  earned: number;
  applicable: number;
  percent: number;
};

export type ScorecardResult = {
  score: number;
  band: Band;
  verdict: Verdict;
  criticalRisks: QuestionId[];
  criticalGaps: QuestionId[];
  criticalUnknowns: QuestionId[];
  categoryScores: Record<CategoryId, CategoryScore>;
  findings: Finding[];
};

const answerFactors = { yes: 1, partial: 0.5, no: 0, unknown: 0 } as const;
const severityRank: Record<FindingSeverity, number> = {
  criticalRisk: 0,
  criticalGap: 1,
  gap: 2,
};
const maxFindings = 3;
const gapThresholdPercent = 70;

export function applyAnswer(
  answers: Answers,
  id: QuestionId,
  answer: Answer,
): Answers {
  const question = getQuestion(id);
  if (answer === "na" && !question.allowsNotApplicable) {
    throw new Error(`${id} does not accept na`);
  }
  const next: Answers = { ...answers, [id]: answer };
  for (const dependent of questions.filter((item) => item.dependsOn === id)) {
    if (answer === "na") next[dependent.id] = "na";
    else if (next[dependent.id] === "na") delete next[dependent.id];
  }
  return next;
}

export function getQuestionFlow(answers: Answers): Question[] {
  return questions.filter(
    (question) => !question.dependsOn || answers[question.dependsOn] !== "na",
  );
}

export function isComplete(answers: Answers): boolean {
  return getQuestionFlow(answers).every(
    (question) => answers[question.id] !== undefined,
  );
}

export function bandForScore(score: number): Band {
  if (score >= 85) return "strong";
  if (score >= 70) return "someGaps";
  if (score >= 50) return "significantGaps";
  return "highRisk";
}

function verdictFor(band: Band, criticalRiskCount: number): Verdict {
  if (criticalRiskCount >= 2) return "highRisk";
  if (criticalRiskCount === 1 && (band === "strong" || band === "someGaps")) {
    return "needsAttention";
  }
  return band;
}

function toPercent(earned: number, applicable: number): number {
  return applicable === 0 ? 100 : Math.round((earned / applicable) * 100);
}

function scoreCategories(answers: Answers): Record<CategoryId, CategoryScore> {
  const totals = Object.fromEntries(
    categoryIds.map((category) => [category, { earned: 0, applicable: 0 }]),
  ) as Record<CategoryId, { earned: number; applicable: number }>;

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === "na") continue;
    totals[question.category].earned += question.weight * answerFactors[answer];
    totals[question.category].applicable += question.weight;
  }

  return Object.fromEntries(
    categoryIds.map((category) => {
      const { earned, applicable } = totals[category];
      return [
        category,
        { earned, applicable, percent: toPercent(earned, applicable) },
      ];
    }),
  ) as Record<CategoryId, CategoryScore>;
}

function criticalIdsWith(answers: Answers, answer: Answer): QuestionId[] {
  return questions
    .filter((question) => question.critical && answers[question.id] === answer)
    .map((question) => question.id);
}

function categoryOf(id: QuestionId): CategoryId {
  return getQuestion(id).category;
}

function severityFor(
  category: CategoryId,
  percent: number,
  risks: QuestionId[],
  gaps: QuestionId[],
): FindingSeverity | undefined {
  if (risks.some((id) => categoryOf(id) === category)) return "criticalRisk";
  if (gaps.some((id) => categoryOf(id) === category)) return "criticalGap";
  if (percent < gapThresholdPercent) return "gap";
  return undefined;
}

function rankFindings(
  categoryScores: Record<CategoryId, CategoryScore>,
  risks: QuestionId[],
  gaps: QuestionId[],
): Finding[] {
  const candidates = categoryIds.flatMap((category, order) => {
    const { earned, applicable, percent } = categoryScores[category];
    const severity = severityFor(category, percent, risks, gaps);
    return severity
      ? [{ category, severity, lost: applicable - earned, order }]
      : [];
  });

  return candidates
    .sort(
      (a, b) =>
        severityRank[a.severity] - severityRank[b.severity] ||
        b.lost - a.lost ||
        a.order - b.order,
    )
    .slice(0, maxFindings)
    .map(({ category, severity }) => ({ category, severity }));
}

export function computeResult(answers: Answers): ScorecardResult {
  if (!isComplete(answers)) {
    throw new Error("Scorecard answers are incomplete");
  }
  const categoryScores = scoreCategories(answers);
  const earned = categoryIds.reduce(
    (sum, id) => sum + categoryScores[id].earned,
    0,
  );
  const applicable = categoryIds.reduce(
    (sum, id) => sum + categoryScores[id].applicable,
    0,
  );
  const score = toPercent(earned, applicable);
  const band = bandForScore(score);
  const criticalRisks = criticalIdsWith(answers, "no");
  const criticalGaps = criticalIdsWith(answers, "partial");

  return {
    score,
    band,
    verdict: verdictFor(band, criticalRisks.length),
    criticalRisks,
    criticalGaps,
    criticalUnknowns: criticalIdsWith(answers, "unknown"),
    categoryScores,
    findings: rankFindings(categoryScores, criticalRisks, criticalGaps),
  };
}

export function isStrongResult(result: ScorecardResult): boolean {
  return (
    result.verdict === "strong" &&
    result.findings.length === 0 &&
    result.criticalUnknowns.length === 0
  );
}
