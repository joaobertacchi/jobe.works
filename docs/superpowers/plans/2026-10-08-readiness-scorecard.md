# Product Readiness Scorecard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an animated, localized, fully static 20-question Product Readiness Scorecard at `/{locale}/scorecard`, with critical-risk-aware results and a prefilled diagnostic email CTA, linked from the home, case, and contact pages.

**Architecture:**
- Pure TypeScript scoring and URL-hash encoding live in `app/scorecard/` and are the single source of truth.
- React domain components in `app/components/domain/scorecard/` render a client-side state machine: intro → questions → results.
- Copy lives in a typed `scorecard` translation namespace.
- The route is prerendered like every other page.
- Answers exist only in React state and the URL hash.

**Tech Stack:** React Router 8 Framework Mode (`ssr: false`), React 19, TypeScript, Tailwind CSS 4 plus `app/app.css`, i18n-js typed dictionaries, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-08-readiness-scorecard-design.md`

## Global Constraints

- Run `nvm use` (Node `22.22.2` from `.nvmrc`) before any npm command.
- `ssr: false`; prerender every public route. Add no backend, serverless function, route action, or runtime server.
- Add no new npm dependencies. Animation uses CSS plus `requestAnimationFrame` only.
- All user-facing copy goes in `app/i18n/translations/scorecard.ts` (or the existing page dictionaries) for both `en` and `pt-BR`. pt-BR question text is verbatim from the source checklist.
- Analytics go only through `useAnalytics().capture` with typed events. Never send individual answers.
- ESLint enforces `complexity: ["error", 10]` per function and `eslint-plugin-react-hooks` recommended rules. Keep functions small and never call `setState` synchronously inside an effect body (use the `queueMicrotask` pattern from `app/consent/consent-context.tsx`).
- Coverage thresholds stay at statements 80 / branches 75 / functions 80 / lines 80. Do not lower them.
- Scoring:
  - Factors are yes 1.0, partial 0.5, no 0, unknown 0.
  - `na` is valid only on q15, which forces q16 to `na`. Both are removed from the numerator and the denominator.
  - Score = `round(earned / applicable × 100)`.
- Bands: 85–100 `strong`, 70–84 `someGaps`, 50–69 `significantGaps`, 0–49 `highRisk`.
- Verdict:
  - 0 Critical Risks → the band.
  - 1 Critical Risk → `needsAttention` if the band is `strong` or `someGaps`, else the band.
  - 2+ Critical Risks → `highRisk`.
- Findings:
  - Max 3, one per category.
  - Severity: `criticalRisk` > `criticalGap` > `gap`.
  - `gap` means percent < 70 with no Critical Risk or Critical Gap in the category.
  - Sort by severity, then lost weight descending, then canonical category order.
- Hash format: `#r=1.<20 chars>` using `y p n u x`.
- Contact email comes from `translate("contact.emailAddress")` (`joao@jobe.works`).
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Answering twice in a row:** a fast double press of `1`, or a double click during the advance delay, must answer the current question once and land on the next question, not skip one. Tested in Task 6.
2. **Modifier shortcuts:** `Cmd/Ctrl/Alt + 1` is a browser shortcut and must not answer a question. Keys typed into an input (the copy-link fallback field) must not answer either. Tested in Task 6.
3. **Pre-hydration clicks:** a click on "Start" before hydration must not be lost silently. The button is disabled until hydrated. Tested in Task 9 (`toBeEnabled` before click).
4. **Shared result links:** a hand-edited or truncated `#r=` hash must show the intro, never a crash or a fabricated result. Tested in Tasks 2 and 6.
5. **Narrow phones:** long pt-BR labels on a 375 px phone must not cause horizontal page scroll on question or results screens. Tested in Task 9.

---

## File Map

| File | Responsibility |
|---|---|
| `app/scorecard/questions.ts` | Category ids, question ids, question metadata, `getQuestion` |
| `app/scorecard/scoring.ts` | `Answer`, `Answers`, `applyAnswer`, `getQuestionFlow`, `isComplete`, `bandForScore`, `computeResult`, `isStrongResult` |
| `app/scorecard/encoding.ts` | `toResultHash`, `fromResultHash` |
| `app/i18n/translations/scorecard.ts` | `ScorecardTranslation` + en/pt-BR copy |
| `app/analytics/types.ts` | `scorecard_started`, `scorecard_completed` events |
| `app/app.css` | Severity tokens, `.rs-*` motion and tone classes |
| `app/components/domain/scorecard/motion.ts` | `usePrefersReducedMotion`, `useHydrated`, `useCountUp`, `revealDelay` |
| `app/components/domain/scorecard/scorecard-intro.tsx` | Intro + category constellation |
| `app/components/domain/scorecard/progress-rail.tsx` | 7-segment category progress |
| `app/components/domain/scorecard/question-step.tsx` | One question, radiogroup, shortcuts |
| `app/components/domain/scorecard/score-ring.tsx` | Animated SVG dial |
| `app/components/domain/scorecard/results-view.tsx` | Summary, category bars, findings, areas to verify |
| `app/components/domain/scorecard/next-step.tsx` | Mailto CTA, copy link, retake |
| `app/components/domain/scorecard/scorecard.tsx` | State machine, hash, analytics |
| `app/routes/$locale.scorecard.tsx` | Route meta + composition |
| `tests/e2e/scorecard.spec.ts` | Browser tests |

---

### Task 1: Question metadata and scoring engine

**Files:**
- Create: `app/scorecard/questions.ts`
- Create: `app/scorecard/scoring.ts`
- Test: `app/scorecard/scoring.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `categoryIds: readonly CategoryId[]`, `type CategoryId`
  - `questionIds: readonly QuestionId[]`, `type QuestionId`
  - `type Question`, `questions: readonly Question[]`, `getQuestion(id: QuestionId): Question`
  - `type Answer = "yes" | "partial" | "no" | "unknown" | "na"`, `type Answers = Partial<Record<QuestionId, Answer>>`
  - `type Band`, `type Verdict`, `type FindingSeverity`, `type Finding`, `type CategoryScore`, `type ScorecardResult`
  - `applyAnswer(answers: Answers, id: QuestionId, answer: Answer): Answers`
  - `getQuestionFlow(answers: Answers): Question[]`
  - `isComplete(answers: Answers): boolean`
  - `bandForScore(score: number): Band`
  - `computeResult(answers: Answers): ScorecardResult`
  - `isStrongResult(result: ScorecardResult): boolean`

- [ ] **Step 1: Write the failing tests**

Create `app/scorecard/scoring.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { questionIds } from "./questions";
import {
  applyAnswer,
  bandForScore,
  computeResult,
  getQuestionFlow,
  isComplete,
  isStrongResult,
  type Answer,
  type Answers,
} from "./scoring";

function allAnswers(base: Exclude<Answer, "na">, overrides: Answers = {}) {
  const answers: Answers = Object.fromEntries(
    questionIds.map((id) => [id, base]),
  );
  return { ...answers, ...overrides };
}

describe("question flow", () => {
  it("contains all 20 questions by default", () => {
    expect(getQuestionFlow({}).map((question) => question.id)).toEqual(
      questionIds,
    );
  });

  it("forces q16 to na when q15 is not applicable and removes it from the flow", () => {
    const answers = applyAnswer({}, "q15", "na");

    expect(answers.q16).toBe("na");
    expect(getQuestionFlow(answers)).toHaveLength(19);
    expect(getQuestionFlow(answers).map((question) => question.id)).not.toContain(
      "q16",
    );
  });

  it("re-inserts q16 when q15 changes from na to an answer", () => {
    const answers = applyAnswer(applyAnswer({}, "q15", "na"), "q15", "yes");

    expect(answers.q16).toBeUndefined();
    expect(getQuestionFlow(answers)).toHaveLength(20);
  });

  it("rejects na on questions that do not allow it", () => {
    expect(() => applyAnswer({}, "q01", "na")).toThrow(
      "q01 does not accept na",
    );
  });

  it("reports completeness against the current flow", () => {
    expect(isComplete({})).toBe(false);
    expect(isComplete(allAnswers("yes"))).toBe(true);
    const withoutQ16 = applyAnswer(
      allAnswers("yes", { q16: undefined }),
      "q15",
      "na",
    );
    expect(isComplete(withoutQ16)).toBe(true);
  });
});

describe("score", () => {
  it("scores 100 when every answer is yes", () => {
    const result = computeResult(allAnswers("yes"));

    expect(result.score).toBe(100);
    expect(result.band).toBe("strong");
    expect(result.verdict).toBe("strong");
    expect(result.findings).toEqual([]);
    expect(isStrongResult(result)).toBe(true);
  });

  it("weights partial answers at half and no at zero", () => {
    expect(computeResult(allAnswers("yes", { q02: "partial" })).score).toBe(97);
    expect(computeResult(allAnswers("yes", { q01: "no" })).score).toBe(96);
  });

  it("removes not-applicable backup questions from the denominator", () => {
    const answers = applyAnswer(
      allAnswers("yes", { q05: "no" }),
      "q15",
      "na",
    );

    expect(computeResult(answers).score).toBe(93);
  });

  it("scores 0 and flags every critical question as unknown when nothing is known", () => {
    const result = computeResult(allAnswers("unknown"));

    expect(result.score).toBe(0);
    expect(result.verdict).toBe("highRisk");
    expect(result.criticalRisks).toEqual([]);
    expect(result.criticalUnknowns).toEqual([
      "q04",
      "q07",
      "q08",
      "q10",
      "q11",
      "q13",
      "q14",
      "q15",
      "q16",
      "q20",
    ]);
  });

  it("reports per-category scores", () => {
    const result = computeResult(allAnswers("yes", { q12: "partial" }));

    expect(result.categoryScores.security).toEqual({
      earned: 16,
      applicable: 17,
      percent: 94,
    });
    expect(result.categoryScores.delivery.percent).toBe(100);
  });

  it("refuses to score incomplete answers", () => {
    expect(() => computeResult({ q01: "yes" })).toThrow(
      "Scorecard answers are incomplete",
    );
  });
});

describe("bands", () => {
  it.each([
    [100, "strong"],
    [85, "strong"],
    [84, "someGaps"],
    [70, "someGaps"],
    [69, "significantGaps"],
    [50, "significantGaps"],
    [49, "highRisk"],
    [0, "highRisk"],
  ] as const)("maps %i to %s", (score, band) => {
    expect(bandForScore(score)).toBe(band);
  });
});

describe("critical override", () => {
  it("caps a strong score with one critical risk at needsAttention", () => {
    const result = computeResult(allAnswers("yes", { q07: "no" }));

    expect(result.score).toBe(94);
    expect(result.band).toBe("strong");
    expect(result.verdict).toBe("needsAttention");
    expect(result.criticalRisks).toEqual(["q07"]);
  });

  it("caps a someGaps score with one critical risk at needsAttention", () => {
    const result = computeResult(
      allAnswers("yes", { q07: "no", q01: "no", q02: "no", q03: "no" }),
    );

    expect(result.score).toBe(81);
    expect(result.verdict).toBe("needsAttention");
  });

  it("keeps a worse band when there is one critical risk", () => {
    const result = computeResult(
      allAnswers("yes", {
        q07: "no",
        q01: "no",
        q02: "no",
        q03: "no",
        q05: "no",
        q06: "no",
        q09: "no",
        q12: "no",
      }),
    );

    expect(result.score).toBe(62);
    expect(result.verdict).toBe("significantGaps");
  });

  it("forces highRisk with two or more critical risks", () => {
    const result = computeResult(allAnswers("yes", { q07: "no", q08: "no" }));

    expect(result.score).toBe(88);
    expect(result.verdict).toBe("highRisk");
  });

  it("classifies partial critical answers as critical gaps without changing the verdict", () => {
    const result = computeResult(allAnswers("yes", { q04: "partial" }));

    expect(result.criticalGaps).toEqual(["q04"]);
    expect(result.verdict).toBe("strong");
    expect(isStrongResult(result)).toBe(false);
  });
});

describe("findings", () => {
  it("orders by severity, then lost weight, then category order, capped at three", () => {
    const result = computeResult(
      allAnswers("yes", { q13: "no", q07: "no", q04: "partial", q05: "no" }),
    );

    expect(result.findings).toEqual([
      { category: "security", severity: "criticalRisk" },
      { category: "observability", severity: "criticalRisk" },
      { category: "delivery", severity: "criticalGap" },
    ]);
  });

  it("reports a low-scoring category as a gap even when its only flag is unknown", () => {
    const result = computeResult(allAnswers("yes", { q20: "unknown" }));

    expect(result.criticalUnknowns).toEqual(["q20"]);
    expect(result.findings).toEqual([{ category: "privacy", severity: "gap" }]);
  });

  it("ranks gap categories by lost weight", () => {
    const result = computeResult(allAnswers("unknown"));

    expect(result.findings).toEqual([
      { category: "security", severity: "gap" },
      { category: "delivery", severity: "gap" },
      { category: "reliability", severity: "gap" },
    ]);
  });

  it("does not report a category scoring 70% or more without critical flags", () => {
    const result = computeResult(allAnswers("yes", { q19: "no" }));

    expect(result.categoryScores.performance.percent).toBe(67);
    expect(result.findings).toEqual([
      { category: "performance", severity: "gap" },
    ]);
    expect(
      computeResult(allAnswers("yes", { q17: "partial" })).findings,
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/scorecard/scoring.test.ts`
Expected: FAIL with `Failed to resolve import "./questions"`.

- [ ] **Step 3: Write `app/scorecard/questions.ts`**

```ts
export const categoryIds = [
  "delivery",
  "testing",
  "security",
  "observability",
  "reliability",
  "performance",
  "privacy",
] as const;

export type CategoryId = (typeof categoryIds)[number];

export const questionIds = [
  "q01",
  "q02",
  "q03",
  "q04",
  "q05",
  "q06",
  "q07",
  "q08",
  "q09",
  "q10",
  "q11",
  "q12",
  "q13",
  "q14",
  "q15",
  "q16",
  "q17",
  "q18",
  "q19",
  "q20",
] as const;

export type QuestionId = (typeof questionIds)[number];

export type Question = {
  id: QuestionId;
  category: CategoryId;
  classification: "required" | "recommended";
  critical: boolean;
  weight: 1 | 2 | 3;
  allowsNotApplicable?: true;
  dependsOn?: QuestionId;
};

export const questions: readonly Question[] = [
  { id: "q01", category: "delivery", classification: "required", critical: false, weight: 2 },
  { id: "q02", category: "delivery", classification: "required", critical: false, weight: 3 },
  { id: "q03", category: "delivery", classification: "required", critical: false, weight: 2 },
  { id: "q04", category: "delivery", classification: "required", critical: true, weight: 3 },
  { id: "q05", category: "testing", classification: "required", critical: false, weight: 3 },
  { id: "q06", category: "testing", classification: "required", critical: false, weight: 2 },
  { id: "q07", category: "security", classification: "required", critical: true, weight: 3 },
  { id: "q08", category: "security", classification: "required", critical: true, weight: 3 },
  { id: "q09", category: "security", classification: "required", critical: false, weight: 3 },
  { id: "q10", category: "security", classification: "required", critical: true, weight: 3 },
  { id: "q11", category: "security", classification: "required", critical: true, weight: 3 },
  { id: "q12", category: "security", classification: "recommended", critical: false, weight: 2 },
  { id: "q13", category: "observability", classification: "required", critical: true, weight: 3 },
  { id: "q14", category: "observability", classification: "required", critical: true, weight: 3 },
  {
    id: "q15",
    category: "reliability",
    classification: "required",
    critical: true,
    weight: 3,
    allowsNotApplicable: true,
  },
  {
    id: "q16",
    category: "reliability",
    classification: "required",
    critical: true,
    weight: 3,
    dependsOn: "q15",
  },
  { id: "q17", category: "reliability", classification: "required", critical: false, weight: 2 },
  { id: "q18", category: "performance", classification: "required", critical: false, weight: 2 },
  { id: "q19", category: "performance", classification: "recommended", critical: false, weight: 1 },
  { id: "q20", category: "privacy", classification: "required", critical: true, weight: 3 },
];

const questionsById = new Map(questions.map((question) => [question.id, question]));

export function getQuestion(id: QuestionId): Question {
  const question = questionsById.get(id);
  if (!question) throw new Error(`Unknown scorecard question: ${id}`);
  return question;
}
```

(Prettier will reflow the one-line objects; run `npx prettier --write` in Step 6.)

- [ ] **Step 4: Write `app/scorecard/scoring.ts`**

```ts
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
    (question) =>
      !question.dependsOn || answers[question.dependsOn] !== "na",
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
      return [category, { earned, applicable, percent: toPercent(earned, applicable) }];
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
  const earned = categoryIds.reduce((sum, id) => sum + categoryScores[id].earned, 0);
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run app/scorecard/scoring.test.ts`
Expected: PASS (all tests).

- [ ] **Step 6: Format, lint, commit**

```bash
npx prettier --write app/scorecard && npx eslint app/scorecard && npx tsc --noEmit -p .
git add app/scorecard
git commit -m "feat(scorecard): add question metadata and scoring engine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shareable result hash encoding

**Files:**
- Create: `app/scorecard/encoding.ts`
- Test: `app/scorecard/encoding.test.ts`

**Interfaces:**
- Consumes: `questionIds`, `Answers`, `Answer`, `isComplete` from Task 1.
- Produces:
  - `toResultHash(answers: Answers): string` returns e.g. `"#r=1.yyyy…"` and throws if incomplete.
  - `fromResultHash(hash: string): Answers | null`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";

import { questionIds } from "./questions";
import { applyAnswer, type Answers } from "./scoring";
import { fromResultHash, toResultHash } from "./encoding";

const allYes: Answers = Object.fromEntries(
  questionIds.map((id) => [id, "yes"]),
);

describe("result hash", () => {
  it("encodes complete answers with a version prefix", () => {
    expect(toResultHash(allYes)).toBe("#r=1.yyyyyyyyyyyyyyyyyyyy");
  });

  it("round-trips mixed answers including not applicable", () => {
    const answers = applyAnswer(
      { ...allYes, q01: "partial", q07: "no", q20: "unknown" },
      "q15",
      "na",
    );
    const hash = toResultHash(answers);

    expect(hash).toBe("#r=1.pyyyyynyyyyyyyxxyyyu");
    expect(fromResultHash(hash)).toEqual(answers);
  });

  it("refuses to encode incomplete answers", () => {
    expect(() => toResultHash({ q01: "yes" })).toThrow(
      "Scorecard answers are incomplete",
    );
  });

  it.each([
    ["empty", ""],
    ["no result key", "#foo"],
    ["unknown version", "#r=2.yyyyyyyyyyyyyyyyyyyy"],
    ["too short", "#r=1.yyyy"],
    ["too long", "#r=1.yyyyyyyyyyyyyyyyyyyyy"],
    ["unknown character", "#r=1.yyyyyyyyyyyyyyyyyyyz"],
    ["na outside backup questions", "#r=1.xyyyyyyyyyyyyyyyyyyy"],
    ["q15 na without q16 na", "#r=1.yyyyyyyyyyyyyyxyyyyy"],
    ["q16 na without q15 na", "#r=1.yyyyyyyyyyyyyyyxyyyy"],
  ])("rejects %s", (_label, hash) => {
    expect(fromResultHash(hash)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/scorecard/encoding.test.ts`
Expected: FAIL with `Failed to resolve import "./encoding"`.

- [ ] **Step 3: Write `app/scorecard/encoding.ts`**

```ts
import { questionIds } from "./questions";
import { applyAnswer, isComplete, type Answer, type Answers } from "./scoring";

const version = "1";
const prefix = `#r=${version}.`;
const codes: Record<Answer, string> = {
  yes: "y",
  partial: "p",
  no: "n",
  unknown: "u",
  na: "x",
};
const answersByCode = new Map(
  Object.entries(codes).map(([answer, code]) => [code, answer as Answer]),
);

export function toResultHash(answers: Answers): string {
  if (!isComplete(answers)) {
    throw new Error("Scorecard answers are incomplete");
  }
  return prefix + questionIds.map((id) => codes[answers[id] ?? "unknown"]).join("");
}

function decodeAnswers(encoded: string): Answers | null {
  let answers: Answers = {};
  for (const [index, id] of questionIds.entries()) {
    const answer = answersByCode.get(encoded[index]);
    if (!answer) return null;
    if (answer === "na" && id === "q16") continue;
    try {
      answers = applyAnswer(answers, id, answer);
    } catch {
      return null;
    }
  }
  return answers;
}

export function fromResultHash(hash: string): Answers | null {
  if (!hash.startsWith(prefix)) return null;
  const encoded = hash.slice(prefix.length);
  if (encoded.length !== questionIds.length) return null;
  const answers = decodeAnswers(encoded);
  if (!answers || (encoded[15] === "x") !== (answers.q15 === "na")) return null;
  return answers;
}
```

`applyAnswer` handles three of the rules:
- It throws on `x` outside q15. That is caught and returns null.
- It forces q16 to `na` when q15 is `x`.
- A literal `y` at q16 after q15 `x` overwrites q16 with a non-`na` value. The final check then sees q16 ≠ `x` while q15 is `na`, and rejects.

A `x` at q16 with a non-`na` q15 also fails the final equality check.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run app/scorecard`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
npx prettier --write app/scorecard && npx eslint app/scorecard
git add app/scorecard
git commit -m "feat(scorecard): encode results in a shareable URL hash

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Localized scorecard copy

**Files:**
- Create: `app/i18n/translations/scorecard.ts`
- Modify: `app/i18n/translations/index.ts`, `app/i18n/types.ts`
- Test: `app/i18n/translations/scorecard.test.ts`

**Interfaces:**
- Consumes: `CategoryId`, `QuestionId` (Task 1). `Answer`, `Verdict`, `FindingSeverity` (Task 1).
- Produces: the `scorecard.*` translation scope:

  | Key | Contents |
  |---|---|
  | `scorecard.seo.{title,description}` | SEO metadata |
  | `scorecard.intro.{eyebrow,title,description,start,note}` | Intro copy |
  | `scorecard.intro.stats.{questions,duration,signup}` | Intro stats |
  | `scorecard.answers.<Answer>` | Answer labels |
  | `scorecard.categories.<CategoryId>` | Category names |
  | `scorecard.categoryShort.<CategoryId>` | Short category names |
  | `scorecard.questions.<QuestionId>.{text,hint,topic}` | Question copy |
  | `scorecard.navigation.{back,position,progress,shortcutHint}` | Navigation |
  | `scorecard.results.{eyebrow,readiness,scoreAnnouncement,criticalBanner,categoriesTitle,findingsTitle,noFindings,unknownsTitle,unknownsDescription,copyLink,copied,copyFallback,retake}` | Results labels |
  | `scorecard.results.verdicts.<Verdict>.{label,summary}` | Verdicts |
  | `scorecard.results.severities.<FindingSeverity>` | Severity tags |
  | `scorecard.results.findings.<CategoryId>.{critical,gap}` | Finding sentences |
  | `scorecard.results.nextStep.{title,description,cta,strongTitle,strongDescription,strongCta}` | Next step |
  | `scorecard.mailto.{subject,body,none}` | Mailto template |

  Interpolation uses i18n-js `%{name}`:
  - `position` takes `%{current}`, `%{total}`.
  - `scoreAnnouncement` takes `%{score}`, `%{verdict}`.
  - `mailto.subject` takes `%{score}`.
  - `mailto.body` takes `%{score}`, `%{verdict}`, `%{findings}`, `%{unknowns}`, `%{url}`.

- [ ] **Step 1: Write the failing test**

Create `app/i18n/translations/scorecard.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { questionIds } from "../../scorecard/questions";
import { scorecardTranslations } from "./scorecard";

describe("scorecard translations", () => {
  it.each(["en", "pt-BR"] as const)(
    "provides non-empty text, hint, and topic for every question in %s",
    (locale) => {
      for (const id of questionIds) {
        const copy = scorecardTranslations[locale].questions[id];
        expect(copy.text.trim(), `${locale}.${id}.text`).not.toBe("");
        expect(copy.hint.trim(), `${locale}.${id}.hint`).not.toBe("");
        expect(copy.topic.trim(), `${locale}.${id}.topic`).not.toBe("");
      }
    },
  );

  it("keeps the pt-BR question copy verbatim from the checklist", () => {
    expect(scorecardTranslations["pt-BR"].questions.q08.text).toBe(
      "O backend verifica corretamente quem pode acessar ou modificar cada dado ou funcionalidade protegida?",
    );
    expect(scorecardTranslations["pt-BR"].questions.q08.hint).toBe(
      "Não basta esconder uma opção ou tela na interface.",
    );
  });

  it("interpolates every mailto placeholder in both locales", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      const { body } = scorecardTranslations[locale].mailto;
      for (const key of ["score", "verdict", "findings", "unknowns", "url"]) {
        expect(body).toContain(`%{${key}}`);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run app/i18n/translations/scorecard.test.ts`
Expected: FAIL with `Failed to resolve import "./scorecard"`.

- [ ] **Step 3: Write `app/i18n/translations/scorecard.ts`**

```ts
import type { CategoryId, QuestionId } from "../../scorecard/questions";
import type {
  Answer,
  FindingSeverity,
  Verdict,
} from "../../scorecard/scoring";
import type { SupportedLocale } from "../config";

type QuestionCopy = { text: string; hint: string; topic: string };
type VerdictCopy = { label: string; summary: string };

export type ScorecardTranslation = {
  seo: { title: string; description: string };
  intro: {
    eyebrow: string;
    title: string;
    description: string;
    stats: { questions: string; duration: string; signup: string };
    start: string;
    note: string;
  };
  answers: Record<Answer, string>;
  categories: Record<CategoryId, string>;
  categoryShort: Record<CategoryId, string>;
  questions: Record<QuestionId, QuestionCopy>;
  navigation: {
    back: string;
    position: string;
    progress: string;
    shortcutHint: string;
  };
  results: {
    eyebrow: string;
    readiness: string;
    scoreAnnouncement: string;
    criticalBanner: string;
    verdicts: Record<Verdict, VerdictCopy>;
    categoriesTitle: string;
    findingsTitle: string;
    noFindings: string;
    severities: Record<FindingSeverity, string>;
    findings: Record<CategoryId, { critical: string; gap: string }>;
    unknownsTitle: string;
    unknownsDescription: string;
    copyLink: string;
    copied: string;
    copyFallback: string;
    retake: string;
    nextStep: {
      title: string;
      description: string;
      cta: string;
      strongTitle: string;
      strongDescription: string;
      strongCta: string;
    };
  };
  mailto: { subject: string; body: string; none: string };
};

export const scorecardTranslations = {
  en: {
    seo: {
      title: "Product Readiness Scorecard | JOBE — Engineering that Works",
      description:
        "A free 20-question scorecard for AI products in production: get a readiness score, critical risk flags, and the findings to address first.",
    },
    intro: {
      eyebrow: "Product Readiness Scorecard",
      title: "Is your product ready for production?",
      description:
        "Twenty questions across delivery, testing, security, operations, recovery, performance, and privacy. Get a readiness score, the critical risks behind it, and where to look first.",
      stats: {
        questions: "20 questions",
        duration: "~4 minutes",
        signup: "No sign-up",
      },
      start: "Start the scorecard",
      note: "Answers stay in your browser.",
    },
    answers: {
      yes: "Yes",
      partial: "Partially",
      no: "No",
      unknown: "I don't know",
      na: "Not applicable",
    },
    categories: {
      delivery: "Development & Delivery",
      testing: "Testing & Quality",
      security: "Security",
      observability: "Observability & Operations",
      reliability: "Reliability & Recovery",
      performance: "Performance & Growth",
      privacy: "Data & Privacy",
    },
    categoryShort: {
      delivery: "Delivery",
      testing: "Testing",
      security: "Security",
      observability: "Observability",
      reliability: "Recovery",
      performance: "Performance",
      privacy: "Privacy",
    },
    questions: {
      q01: {
        text: "Do code changes go through review before reaching production?",
        hint: "e.g. pull requests, merge requests, or another code review process.",
        topic: "Code review",
      },
      q02: {
        text: "Are changes validated automatically before being merged or released?",
        hint: "e.g. tests, build, lint, or other CI checks.",
        topic: "Automated validation (CI)",
      },
      q03: {
        text: "Is the production release process consistent and reproducible?",
        hint: "e.g. an automated pipeline or a clearly defined procedure, not improvised manual deploys.",
        topic: "Reproducible releases",
      },
      q04: {
        text: "Can you tell which version of the code is running in production and roll back a problematic release?",
        hint: "e.g. versioned releases, deploy history, or one-step rollback.",
        topic: "Release versioning and rollback",
      },
      q05: {
        text: "Do the product's main flows have automated tests?",
        hint: "e.g. sign-up, login, payment, or other business-critical flows.",
        topic: "Automated tests for key flows",
      },
      q06: {
        text: "Do tests run automatically whenever relevant changes are made?",
        hint: "e.g. on every pull request or push to the main branch.",
        topic: "Automatic test execution",
      },
      q07: {
        text: "Are passwords, tokens, API keys, and other secrets kept out of the source code?",
        hint: "e.g. environment variables or a secrets manager, never committed to the repository.",
        topic: "Secrets management",
      },
      q08: {
        text: "Does the backend correctly check who can access or modify each protected piece of data or functionality?",
        hint: "Hiding an option or screen in the interface is not enough.",
        topic: "Backend authorization",
      },
      q09: {
        text: "Is data received from users, APIs, and other external systems validated on the backend?",
        hint: "e.g. schema validation for requests, webhooks, and integration responses.",
        topic: "Backend input validation",
      },
      q10: {
        text: "Is the product protected against common web application and API vulnerabilities?",
        hint: "e.g. injection, XSS, unauthorized data access, and insecure configuration.",
        topic: "Protection against common vulnerabilities",
      },
      q11: {
        text: "Is sensitive data properly protected in transit and at rest?",
        hint: "e.g. HTTPS and appropriate protection for credentials and personal information.",
        topic: "Protection of sensitive data",
      },
      q12: {
        text: "Are the product's dependencies and libraries checked for known vulnerabilities?",
        hint: "e.g. Dependabot, npm audit, Snyk, or an equivalent tool.",
        topic: "Dependency vulnerability checks",
      },
      q13: {
        text: "Are unexpected production errors recorded and possible to investigate?",
        hint: "e.g. an error tracking tool, or structured logs with stack traces.",
        topic: "Production error tracking",
      },
      q14: {
        text: "Can you quickly tell if the product is down or showing an abnormal number of errors?",
        hint: "e.g. monitoring, health checks, or alerts.",
        topic: "Availability and error monitoring",
      },
      q15: {
        text: "Is there a backup strategy for data that cannot be lost?",
        hint: "If the product stores no persistent data that matters, answer Not applicable.",
        topic: "Backup strategy",
      },
      q16: {
        text: "Are you confident those backups can actually be restored?",
        hint: "e.g. a restore has been tested or there is a proven procedure.",
        topic: "Backup restore confidence",
      },
      q17: {
        text: "Are failures or slowness in external services handled without leaving the product stuck indefinitely?",
        hint: "e.g. timeouts, controlled retries, and proper handling of unavailability.",
        topic: "Handling external service failures",
      },
      q18: {
        text: "Do the main flows perform acceptably with the current volume of users and data?",
        hint: "e.g. key pages and API calls respond quickly under real usage.",
        topic: "Current performance",
      },
      q19: {
        text: "Does the team know the main bottlenecks or limits that could appear if usage grows significantly?",
        hint: "e.g. database load, third-party rate limits, or AI inference costs.",
        topic: "Known growth bottlenecks",
      },
      q20: {
        text: "Does the team know what personal or sensitive data the product collects, and have adequate controls for access, retention, and deletion?",
        hint: "Also consider applicable legal or contractual requirements.",
        topic: "Personal data controls",
      },
    },
    navigation: {
      back: "Back",
      position: "Question %{current} of %{total}",
      progress: "Scorecard progress",
      shortcutHint: "Tip: press 1–4 to answer",
    },
    results: {
      eyebrow: "Your result",
      readiness: "Readiness",
      scoreAnnouncement:
        "Product Readiness Score: %{score} out of 100. Readiness: %{verdict}.",
      criticalBanner:
        "Critical risk: at least one critical risk should be addressed before considering the product production-ready.",
      verdicts: {
        strong: {
          label: "Strong foundation",
          summary:
            "The product shows a solid foundation for production. There may still be specific risks or opportunities to improve.",
        },
        someGaps: {
          label: "Some important gaps",
          summary:
            "A reasonable foundation, with gaps worth addressing before growth or higher criticality.",
        },
        significantGaps: {
          label: "Significant readiness gaps",
          summary:
            "There are relevant engineering, security, or operational gaps. A deeper technical review is recommended.",
        },
        needsAttention: {
          label: "Needs attention",
          summary:
            "The overall score is reasonable, but a critical risk needs to be addressed first.",
        },
        highRisk: {
          label: "High risk",
          summary:
            "Several signs suggest the product does not yet have the controls needed for reliable production operation.",
        },
      },
      categoriesTitle: "By category",
      findingsTitle: "Main findings",
      noFindings: "No major findings. Your answers point to a solid foundation.",
      severities: {
        criticalRisk: "Critical risk",
        criticalGap: "Critical gap",
        gap: "Gap",
      },
      findings: {
        delivery: {
          critical:
            "You may not be able to tell what's running in production or roll back a bad release quickly.",
          gap: "Changes may reach production without consistent review, automated checks, or a repeatable release process.",
        },
        testing: {
          critical:
            "Business-critical flows may break without any automated signal.",
          gap: "Key product flows may break without automated tests catching it first.",
        },
        security: {
          critical:
            "Access control, secrets, or data protection may need review before more users rely on the product.",
          gap: "Input validation or dependency checks may leave avoidable openings.",
        },
        observability: {
          critical:
            "Production failures may go unnoticed until users report them.",
          gap: "Problems in production may not be detected or investigated quickly.",
        },
        reliability: {
          critical:
            "Data that cannot be lost may not be recoverable after an incident.",
          gap: "Slow or failing external services may leave the product stuck.",
        },
        performance: {
          critical: "Performance may not hold under the current load.",
          gap: "Performance limits may surface as usage grows.",
        },
        privacy: {
          critical:
            "Personal data collection, retention, or deletion may not be under control.",
          gap: "There may be limited visibility into how personal data is handled.",
        },
      },
      unknownsTitle: "Areas to verify",
      unknownsDescription:
        "You answered “I don't know” on critical controls. These areas may never have been assessed, or lack visibility.",
      copyLink: "Copy result link",
      copied: "Link copied",
      copyFallback: "Copy this link:",
      retake: "Retake",
      nextStep: {
        title: "Discover which risks to fix first",
        description:
          "Book a diagnostic conversation to review these findings and identify the highest-impact actions.",
        cta: "Book a diagnostic conversation",
        strongTitle: "Keep it that way as you grow",
        strongDescription:
          "A short conversation can confirm the foundation and spot risks before they scale.",
        strongCta: "Talk about your next stage",
      },
    },
    mailto: {
      subject: "Product Readiness Scorecard — %{score}/100",
      body: "Hi João,\n\nI took the Product Readiness Scorecard and would like to book a diagnostic conversation.\n\nScore: %{score}/100\nReadiness: %{verdict}\nMain findings: %{findings}\nAreas to verify: %{unknowns}\n\nResult: %{url}\n",
      none: "none",
    },
  },
  "pt-BR": {
    seo: {
      title: "Product Readiness Scorecard | JOBE — Engenharia que Funciona",
      description:
        "Um scorecard gratuito de 20 perguntas para produtos de IA em produção: receba um score de readiness, alertas de riscos críticos e os findings a tratar primeiro.",
    },
    intro: {
      eyebrow: "Product Readiness Scorecard",
      title: "Seu produto está pronto para produção?",
      description:
        "Vinte perguntas sobre entrega, testes, segurança, operação, recuperação, desempenho e privacidade. Receba um score de readiness, os riscos críticos por trás dele e por onde começar.",
      stats: {
        questions: "20 perguntas",
        duration: "~4 minutos",
        signup: "Sem cadastro",
      },
      start: "Começar o scorecard",
      note: "As respostas ficam no seu navegador.",
    },
    answers: {
      yes: "Sim",
      partial: "Parcialmente",
      no: "Não",
      unknown: "Não sei",
      na: "Não se aplica",
    },
    categories: {
      delivery: "Desenvolvimento & Entrega",
      testing: "Testes & Qualidade",
      security: "Segurança",
      observability: "Observabilidade & Operação",
      reliability: "Confiabilidade & Recuperação",
      performance: "Desempenho & Crescimento",
      privacy: "Dados & Privacidade",
    },
    categoryShort: {
      delivery: "Entrega",
      testing: "Testes",
      security: "Segurança",
      observability: "Observabilidade",
      reliability: "Recuperação",
      performance: "Desempenho",
      privacy: "Privacidade",
    },
    questions: {
      q01: {
        text: "Alterações no código passam por revisão antes de chegar à produção?",
        hint: "Ex.: Pull Request, Merge Request ou outro processo de code review.",
        topic: "Revisão de código",
      },
      q02: {
        text: "Alterações são validadas automaticamente antes de serem integradas ou publicadas?",
        hint: "Ex.: execução automática de testes, build, lint ou outras verificações via CI.",
        topic: "Validação automática (CI)",
      },
      q03: {
        text: "O processo de publicação em produção é consistente e reproduzível?",
        hint: "Ex.: pipeline automatizado ou procedimento claramente definido, evitando deploys manuais improvisados.",
        topic: "Publicação reproduzível",
      },
      q04: {
        text: "É possível identificar qual versão do código está rodando em produção e reverter uma publicação problemática?",
        hint: "Ex.: releases versionadas, histórico de deploys ou rollback em um passo.",
        topic: "Versionamento e rollback de releases",
      },
      q05: {
        text: "Os principais fluxos do produto possuem testes automatizados?",
        hint: "Ex.: cadastro, login, pagamento ou outros fluxos essenciais para o negócio.",
        topic: "Testes automatizados dos fluxos principais",
      },
      q06: {
        text: "Os testes são executados automaticamente sempre que mudanças relevantes são realizadas?",
        hint: "Ex.: a cada pull request ou push na branch principal.",
        topic: "Execução automática de testes",
      },
      q07: {
        text: "Senhas, tokens, chaves de API e outros secrets são mantidos fora do código-fonte?",
        hint: "Ex.: variáveis de ambiente ou um gerenciador de secrets, nunca commitados no repositório.",
        topic: "Gestão de secrets",
      },
      q08: {
        text: "O backend verifica corretamente quem pode acessar ou modificar cada dado ou funcionalidade protegida?",
        hint: "Não basta esconder uma opção ou tela na interface.",
        topic: "Autorização no backend",
      },
      q09: {
        text: "Dados recebidos de usuários, APIs e outros sistemas externos são validados no backend?",
        hint: "Ex.: validação de schema em requisições, webhooks e respostas de integrações.",
        topic: "Validação de entradas no backend",
      },
      q10: {
        text: "O produto possui proteção contra vulnerabilidades comuns de aplicações web e APIs?",
        hint: "Ex.: injection, XSS, acesso indevido a dados e configurações inseguras.",
        topic: "Proteção contra vulnerabilidades comuns",
      },
      q11: {
        text: "Dados sensíveis são protegidos adequadamente durante transmissão e armazenamento?",
        hint: "Ex.: HTTPS e proteção apropriada para credenciais e informações pessoais.",
        topic: "Proteção de dados sensíveis",
      },
      q12: {
        text: "Dependências e bibliotecas utilizadas pelo produto são verificadas em busca de vulnerabilidades conhecidas?",
        hint: "Ex.: Dependabot, npm audit, Snyk ou ferramenta equivalente.",
        topic: "Verificação de vulnerabilidades em dependências",
      },
      q13: {
        text: "Erros inesperados em produção são registrados e podem ser investigados?",
        hint: "Ex.: ferramenta de error tracking ou logs estruturados com stack trace.",
        topic: "Registro de erros em produção",
      },
      q14: {
        text: "É possível saber rapidamente se o produto está indisponível ou apresentando uma quantidade anormal de erros?",
        hint: "Ex.: monitoramento, health check ou alertas.",
        topic: "Monitoramento de disponibilidade e erros",
      },
      q15: {
        text: "Existe uma estratégia de backup para os dados que não podem ser perdidos?",
        hint: "Se o produto não armazena dados persistentes relevantes, responda Não se aplica.",
        topic: "Estratégia de backup",
      },
      q16: {
        text: "Existe confiança de que esses backups realmente podem ser restaurados?",
        hint: "Ex.: a restauração já foi testada ou existe um procedimento comprovado.",
        topic: "Confiabilidade da restauração de backups",
      },
      q17: {
        text: "Falhas ou lentidão de serviços externos são tratadas sem deixar o produto indefinidamente travado?",
        hint: "Ex.: timeouts, retries controlados e tratamento adequado de indisponibilidade.",
        topic: "Tratamento de falhas de serviços externos",
      },
      q18: {
        text: "Os principais fluxos apresentam desempenho aceitável com o volume atual de usuários e dados?",
        hint: "Ex.: páginas e chamadas de API principais respondem rápido com o uso real.",
        topic: "Desempenho atual",
      },
      q19: {
        text: "A equipe conhece os principais gargalos ou limitações que podem aparecer se o uso do produto crescer significativamente?",
        hint: "Ex.: carga no banco de dados, limites de APIs de terceiros ou custo de inferência de IA.",
        topic: "Gargalos de crescimento conhecidos",
      },
      q20: {
        text: "A equipe sabe quais dados pessoais ou sensíveis o produto coleta e possui controles adequados para acesso, retenção e exclusão?",
        hint: "Considere também requisitos legais ou contratuais aplicáveis ao produto.",
        topic: "Controles de dados pessoais",
      },
    },
    navigation: {
      back: "Voltar",
      position: "Pergunta %{current} de %{total}",
      progress: "Progresso do scorecard",
      shortcutHint: "Dica: use as teclas 1–4 para responder",
    },
    results: {
      eyebrow: "Seu resultado",
      readiness: "Readiness",
      scoreAnnouncement:
        "Product Readiness Score: %{score} de 100. Readiness: %{verdict}.",
      criticalBanner:
        "Risco crítico: existe pelo menos um risco crítico que deve ser tratado antes de considerar o produto pronto para produção.",
      verdicts: {
        strong: {
          label: "Base sólida",
          summary:
            "O produto apresenta uma base sólida para operação em produção. Ainda podem existir riscos específicos ou oportunidades de melhoria.",
        },
        someGaps: {
          label: "Lacunas importantes",
          summary:
            "Uma base razoável, com lacunas que merecem tratamento antes de crescimento ou aumento de criticidade.",
        },
        significantGaps: {
          label: "Lacunas significativas",
          summary:
            "Existem lacunas relevantes de engenharia, segurança ou operação. Uma análise técnica mais aprofundada é recomendada.",
        },
        needsAttention: {
          label: "Requer atenção",
          summary:
            "A pontuação geral é razoável, mas existe um risco crítico que deve ser tratado primeiro.",
        },
        highRisk: {
          label: "Alto risco",
          summary:
            "Diversos sinais indicam que o produto ainda não possui os controles necessários para operação confiável em produção.",
        },
      },
      categoriesTitle: "Por categoria",
      findingsTitle: "Principais findings",
      noFindings:
        "Nenhum finding relevante. Suas respostas indicam uma base sólida.",
      severities: {
        criticalRisk: "Risco crítico",
        criticalGap: "Lacuna crítica",
        gap: "Lacuna",
      },
      findings: {
        delivery: {
          critical:
            "Pode não ser possível saber o que está rodando em produção ou reverter rapidamente uma publicação problemática.",
          gap: "Alterações podem chegar à produção sem revisão consistente, verificações automáticas ou um processo de publicação reproduzível.",
        },
        testing: {
          critical:
            "Fluxos críticos para o negócio podem quebrar sem nenhum sinal automático.",
          gap: "Fluxos principais podem quebrar sem que testes automatizados detectem antes.",
        },
        security: {
          critical:
            "Controle de acesso, secrets ou proteção de dados podem precisar de revisão antes de mais usuários dependerem do produto.",
          gap: "Validação de entradas ou verificação de dependências podem deixar brechas evitáveis.",
        },
        observability: {
          critical:
            "Falhas em produção podem passar despercebidas até que usuários reclamem.",
          gap: "Problemas em produção podem não ser detectados ou investigados rapidamente.",
        },
        reliability: {
          critical:
            "Dados que não podem ser perdidos podem não ser recuperáveis após um incidente.",
          gap: "Serviços externos lentos ou indisponíveis podem deixar o produto travado.",
        },
        performance: {
          critical: "O desempenho pode não se sustentar com a carga atual.",
          gap: "Limites de desempenho podem aparecer com o crescimento do uso.",
        },
        privacy: {
          critical:
            "A coleta, retenção ou exclusão de dados pessoais pode não estar sob controle.",
          gap: "Pode haver pouca visibilidade sobre como dados pessoais são tratados.",
        },
      },
      unknownsTitle: "Áreas para verificar",
      unknownsDescription:
        "Você respondeu “Não sei” em controles críticos. Estas áreas talvez nunca tenham sido avaliadas ou carecem de visibilidade.",
      copyLink: "Copiar link do resultado",
      copied: "Link copiado",
      copyFallback: "Copie este link:",
      retake: "Refazer",
      nextStep: {
        title: "Descubra quais riscos corrigir primeiro",
        description:
          "Agende uma conversa de diagnóstico para revisar os principais findings e identificar as ações de maior impacto.",
        cta: "Agendar conversa de diagnóstico",
        strongTitle: "Mantenha essa base enquanto cresce",
        strongDescription:
          "Uma conversa curta pode confirmar essa base e identificar riscos antes que escalem.",
        strongCta: "Conversar sobre a próxima fase",
      },
    },
    mailto: {
      subject: "Product Readiness Scorecard — %{score}/100",
      body: "Olá João,\n\nFiz o Product Readiness Scorecard e gostaria de agendar uma conversa de diagnóstico.\n\nScore: %{score}/100\nReadiness: %{verdict}\nPrincipais findings: %{findings}\nÁreas para verificar: %{unknowns}\n\nResultado: %{url}\n",
      none: "nenhum",
    },
  },
} satisfies Record<SupportedLocale, ScorecardTranslation>;
```

- [ ] **Step 4: Register the namespace**

In `app/i18n/types.ts`:
1. Add the import `import type { ScorecardTranslation } from "./translations/scorecard";`, sorted with the others.
2. Add `scorecard: ScorecardTranslation;` to `Translation` after `case`.

In `app/i18n/translations/index.ts`:
1. Add the import `import { scorecardTranslations } from "./scorecard";`.
2. Add `scorecard: scorecardTranslations.en,` to `en`, after `case`.
3. Add `scorecard: scorecardTranslations["pt-BR"],` to `"pt-BR"`, after `case`.

- [ ] **Step 5: Run the tests and typecheck**

Run: `npx vitest run app/i18n && npm run typecheck`
Expected: PASS. Typecheck succeeds, which proves both locales satisfy the type.

- [ ] **Step 6: Commit**

```bash
npx prettier --write app/i18n
git add app/i18n
git commit -m "feat(scorecard): add localized scorecard copy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Typed scorecard analytics events

**Files:**
- Modify: `app/analytics/types.ts`
- Modify: `app/analytics/events.type-test.ts`

**Interfaces:**
- Consumes: `Band`, `Verdict` from Task 1.
- Produces: `capture({ eventName: "scorecard_started" })` and `capture({ eventName: "scorecard_completed", verdict, band, criticalRiskCount, unknownCount })`.

- [ ] **Step 1: Add the failing type assertions** to the end of `app/analytics/events.type-test.ts`:

```ts
capture({ eventName: "scorecard_started" });
capture({
  eventName: "scorecard_completed",
  verdict: "needsAttention",
  band: "strong",
  criticalRiskCount: 1,
  unknownCount: 0,
});

capture({
  eventName: "scorecard_completed",
  // @ts-expect-error Verdicts are limited to the scoring vocabulary.
  verdict: "great",
  band: "strong",
  criticalRiskCount: 0,
  unknownCount: 0,
});

capture({
  eventName: "scorecard_completed",
  verdict: "strong",
  band: "strong",
  criticalRiskCount: 0,
  unknownCount: 0,
  // @ts-expect-error Individual answers are never sent to analytics.
  answers: { q01: "yes" },
});
```

- [ ] **Step 2: Run the typecheck to verify it fails**

Run: `npm run typecheck`
Expected: FAIL. The error is `Type '"scorecard_started"' is not assignable…`.

- [ ] **Step 3: Extend `app/analytics/types.ts`**

Add the import `import type { Band, Verdict } from "../scorecard/scoring";`, then replace the `AnalyticsCustomEvent` union with:

```ts
export type ScorecardStartedEvent = {
  eventName: "scorecard_started";
};

export type ScorecardCompletedEvent = {
  eventName: "scorecard_completed";
  verdict: Verdict;
  band: Band;
  criticalRiskCount: number;
  unknownCount: number;
};

export type AnalyticsCustomEvent =
  | PageViewEvent
  | CtaPressedEvent
  | LeadSubmittedEvent
  | ScorecardStartedEvent
  | ScorecardCompletedEvent;
```

Then check whether any tracker switches exhaustively on `eventName`:

```bash
grep -rn "eventName" app/analytics/trackers
```

If a tracker maps events to provider calls with an exhaustive `switch`, add cases that forward the two new events in that tracker's existing style.

- [ ] **Step 4: Run the checks**

Run: `npm run typecheck && npx vitest run app/analytics`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/analytics
git commit -m "feat(analytics): add typed scorecard events

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Severity tokens, motion CSS, and motion hooks

**Files:**
- Modify: `app/app.css`
- Create: `app/components/domain/scorecard/motion.ts`
- Test: `app/components/domain/scorecard/motion.test.tsx`
- Modify: `app/app-css.test.ts`

**Interfaces:**
- Produces:
  - Tailwind colors `risk`, `gap`, `unknown`, giving utilities such as `bg-risk`, `border-unknown`, `bg-risk/10`.
  - CSS classes:
    - `.rs-step-enter`, `.rs-reveal`, `.rs-bar-fill`, `.rs-ring-arc`, `.rs-pulse`
    - `.rs-tone-strong|gap|risk`
    - `.rs-severity-criticalRisk|criticalGap|gap`, `.rs-severity-tag`, `.rs-finding`
    - `.rs-tone-text`
    - `.rs-constellation*`
  - Each CSS class reads `--rs-delay` and/or `--rs-tone`.
  - Hooks and helpers:
    - `usePrefersReducedMotion(): boolean`
    - `useHydrated(): boolean`
    - `useCountUp(target: number, durationMs: number): number`
    - `revealDelay(ms: number): CSSProperties`

- [ ] **Step 1: Write the failing tests**

Append to `app/app-css.test.ts`, inside the `describe`:

```ts
  it("defines scorecard severity tokens for light and dark themes", () => {
    const css = readFileSync("app/app.css", "utf8");
    const [light, dark] = css.split(/^\.dark \{/m);

    for (const token of ["--risk:", "--gap:", "--unknown:"]) {
      expect(light).toContain(token);
      expect(dark).toContain(token);
    }
    expect(css).toContain("--color-risk: var(--risk);");
  });

  it("disables scorecard motion for reduced-motion users", () => {
    const css = readFileSync("app/app.css", "utf8");
    const reduced = css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));

    expect(reduced).toContain(".rs-reveal");
    expect(reduced).toContain(".rs-ring-arc");
  });
```

Create `app/components/domain/scorecard/motion.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/app-css.test.ts app/components/domain/scorecard/motion.test.tsx`
Expected: FAIL. The CSS assertions fail and `./motion` does not resolve.

- [ ] **Step 3: Add the tokens to `app/app.css`**

1. In `@theme inline`, after `--color-hairline`, add:

```css
  --color-risk: var(--risk);
  --color-gap: var(--gap);
  --color-unknown: var(--unknown);
```

2. In `:root`, after `--brand-foreground`, add:

```css
  --risk: oklch(0.55 0.19 27);
  --gap: oklch(0.62 0.14 65);
  --unknown: oklch(0.55 0.04 262);
```

3. In `.dark`, after `--brand-foreground`, add:

```css
  --risk: oklch(0.7 0.16 27);
  --gap: oklch(0.78 0.13 75);
  --unknown: oklch(0.72 0.04 262);
```

4. Append at the end of the file:

```css
/* Product Readiness Scorecard */

@keyframes rs-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rs-fill {
  from {
    transform: scaleX(0);
  }
}

@keyframes rs-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}

.rs-step-enter {
  animation: rs-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.rs-reveal {
  animation: rs-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--rs-delay, 0ms);
}

.rs-bar-fill {
  transform-origin: left;
  animation: rs-fill 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--rs-delay, 0ms);
}

.rs-pulse {
  animation: rs-pulse 1.6s ease-in-out infinite;
}

.rs-tone-strong {
  --rs-tone: var(--brand);
}

.rs-tone-gap,
.rs-severity-criticalGap,
.rs-severity-gap {
  --rs-tone: var(--gap);
}

.rs-tone-risk,
.rs-severity-criticalRisk {
  --rs-tone: var(--risk);
}

.rs-tone-text {
  color: var(--rs-tone);
}

.rs-ring-arc {
  stroke: var(--rs-tone);
  transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.rs-finding {
  border-top: 3px solid var(--rs-tone);
}

.rs-severity-tag {
  color: var(--rs-tone);
  background: color-mix(in oklch, var(--rs-tone) 14%, transparent);
}

.rs-constellation__orbit {
  fill: none;
  stroke: var(--border);
  stroke-dasharray: 3 6;
}

.rs-constellation__node {
  animation: rs-pulse 3.2s ease-in-out infinite;
  animation-delay: var(--rs-delay, 0ms);
}

.rs-constellation__node line {
  stroke: var(--border);
}

.rs-constellation__node circle {
  fill: var(--background);
  stroke: var(--brand);
  stroke-width: 2;
}

.rs-constellation__node text {
  fill: var(--muted-foreground);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rs-constellation__core {
  fill: var(--brand);
}

@media (prefers-reduced-motion: reduce) {
  .rs-step-enter,
  .rs-reveal,
  .rs-bar-fill,
  .rs-pulse,
  .rs-constellation__node {
    animation: none;
  }

  .rs-ring-arc {
    transition: none;
  }
}
```

- [ ] **Step 4: Write `app/components/domain/scorecard/motion.ts`**

```ts
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function canMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run app/app-css.test.ts app/components/domain/scorecard/motion.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
npx prettier --write app/app.css app/app-css.test.ts app/components/domain/scorecard
npx eslint app/components/domain/scorecard
git add app/app.css app/app-css.test.ts app/components/domain/scorecard
git commit -m "feat(scorecard): add severity tokens and motion primitives

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Intro, question flow, and the scorecard state machine

**Files:**
- Create: `app/components/domain/scorecard/scorecard-intro.tsx`
- Create: `app/components/domain/scorecard/progress-rail.tsx`
- Create: `app/components/domain/scorecard/question-step.tsx`
- Create: `app/components/domain/scorecard/scorecard.tsx`
- Create (temporary stub replaced in Task 7): `app/components/domain/scorecard/results-view.tsx`
- Test: `app/components/domain/scorecard/test-utils.tsx`, `app/components/domain/scorecard/scorecard.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces:
  - `Scorecard({ advanceDelayMs?: number })`, with a default delay of 220 ms.
  - `ResultsView({ result: ScorecardResult; onRetake: () => void; focusOnMount: boolean })`. Task 7 replaces the stub implementation but keeps this signature.

- [ ] **Step 1: Write the shared test harness**

Create `app/components/domain/scorecard/test-utils.tsx`:

```tsx
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { AnalyticsProvider } from "../../../analytics/analytics";
import type {
  AnalyticsCustomEvent,
  TrackerRegistration,
} from "../../../analytics/types";
import type { SupportedLocale } from "../../../i18n/config";
import { I18nProvider } from "../../../i18n/i18n";
import { Scorecard } from "./scorecard";

export function renderScorecard(locale: SupportedLocale = "en") {
  const events: AnalyticsCustomEvent[] = [];
  const trackers: TrackerRegistration[] = [
    {
      consentCategory: "analytics",
      tracker: (event) => {
        events.push(event);
      },
    },
  ];
  const router = createMemoryRouter(
    [
      {
        path: "/:locale/scorecard",
        element: (
          <I18nProvider locale={locale}>
            <AnalyticsProvider
              consent={{ analytics: true, marketing: true }}
              trackers={trackers}
            >
              <Scorecard advanceDelayMs={0} />
            </AnalyticsProvider>
          </I18nProvider>
        ),
      },
    ],
    { initialEntries: [`/${locale}/scorecard`] },
  );
  render(<RouterProvider router={router} />);

  return {
    scorecardEvents: () =>
      events.filter((event) => event.eventName.startsWith("scorecard_")),
  };
}
```

Exclude it from coverage noise by keeping it next to the tests. It is imported only by `*.test.tsx`.

- [ ] **Step 2: Write the failing flow tests**

Create `app/components/domain/scorecard/scorecard.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { scorecardTranslations } from "../../../i18n/translations/scorecard";
import { renderScorecard } from "./test-utils";

const copy = scorecardTranslations.en;

async function start() {
  const button = await screen.findByRole("button", { name: copy.intro.start });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

async function answerWithKeys(keys: string[], total = 20) {
  for (const [index, key] of keys.entries()) {
    await screen.findByText(`Question ${index + 1} of ${total}`);
    fireEvent.keyDown(document, { key });
  }
}

beforeEach(() => {
  window.history.replaceState(null, "", "/en/scorecard");
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("Scorecard flow", () => {
  it("starts from the intro and focuses the first question", async () => {
    const { scorecardEvents } = renderScorecard();

    await start();

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: copy.questions.q01.text,
    });
    expect(heading).toHaveFocus();
    await waitFor(() =>
      expect(scorecardEvents()).toEqual([{ eventName: "scorecard_started" }]),
    );
  });

  it("completes with keyboard shortcuts and emits only aggregate analytics", async () => {
    const { scorecardEvents } = renderScorecard();
    await start();

    await answerWithKeys(Array(20).fill("1"));

    expect(
      await screen.findByText(copy.results.verdicts.strong.label),
    ).toBeVisible();
    expect(window.location.hash).toBe("#r=1.yyyyyyyyyyyyyyyyyyyy");
    await waitFor(() =>
      expect(scorecardEvents()).toEqual([
        { eventName: "scorecard_started" },
        {
          eventName: "scorecard_completed",
          verdict: "strong",
          band: "strong",
          criticalRiskCount: 0,
          unknownCount: 0,
        },
      ]),
    );
  });

  it("keeps earlier answers when going back", async () => {
    renderScorecard();
    await start();

    fireEvent.click(
      await screen.findByRole("radio", { name: new RegExp(copy.answers.partial) }),
    );
    await screen.findByText("Question 2 of 20");
    fireEvent.click(screen.getByRole("button", { name: copy.navigation.back }));

    await screen.findByText("Question 1 of 20");
    expect(
      screen.getByRole("radio", { name: new RegExp(copy.answers.partial) }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("returns to the intro when going back from the first question", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.click(screen.getByRole("button", { name: copy.navigation.back }));

    expect(
      await screen.findByRole("button", { name: copy.intro.start }),
    ).toBeVisible();
  });

  it("skips the restore question when backups are not applicable", async () => {
    renderScorecard();
    await start();

    await answerWithKeys(Array(14).fill("1"));
    await screen.findByText("Question 15 of 20");
    expect(
      screen.getByRole("radio", { name: new RegExp(copy.answers.na) }),
    ).toBeVisible();
    fireEvent.keyDown(document, { key: "5" });

    expect(await screen.findByText("Question 16 of 19")).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: copy.questions.q17.text }),
    ).toBeVisible();
  });

  it("ignores shortcut keys pressed with modifiers", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.keyDown(document, { key: "1", metaKey: true });
    fireEvent.keyDown(document, { key: "1", ctrlKey: true });
    fireEvent.keyDown(document, { key: "1", altKey: true });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText("Question 1 of 20")).toBeVisible();
  });

  it("answers the current question once when pressed twice quickly", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.keyDown(document, { key: "1" });
    fireEvent.keyDown(document, { key: "2" });

    expect(await screen.findByText("Question 2 of 20")).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText("Question 2 of 20")).toBeVisible();
  });

  it("moves focus between answers with arrow keys", async () => {
    renderScorecard();
    await start();
    const radios = await screen.findAllByRole("radio");

    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(radios[1]).toHaveFocus();
    fireEvent.keyDown(radios[1], { key: "ArrowUp" });
    expect(radios[0]).toHaveFocus();
    fireEvent.keyDown(radios[0], { key: "ArrowUp" });
    expect(radios[radios.length - 1]).toHaveFocus();
  });
});

describe("Scorecard shared results", () => {
  it("opens a valid shared hash on the results without completion analytics", async () => {
    window.history.replaceState(null, "", "/en/scorecard#r=1.nnnnnnnnnnnnnnnnnnnn");
    const { scorecardEvents } = renderScorecard();

    expect(
      await screen.findByText(copy.results.verdicts.highRisk.label),
    ).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scorecardEvents()).toEqual([]);
  });

  it("shows the intro for an invalid shared hash", async () => {
    window.history.replaceState(null, "", "/en/scorecard#r=1.broken");
    renderScorecard();

    expect(
      await screen.findByRole("button", { name: copy.intro.start }),
    ).toBeVisible();
  });
});
```

Task 7 adds the tests that cover results content (mailto, copy link, retake, findings).

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run app/components/domain/scorecard/scorecard.test.tsx`
Expected: FAIL with `Failed to resolve import "./scorecard"`.

- [ ] **Step 4: Write `scorecard-intro.tsx`**

```tsx
import { useI18n } from "../../../i18n/i18n";
import { categoryIds } from "../../../scorecard/questions";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { revealDelay, useHydrated } from "./motion";

const center = 200;
const orbit = 140;

function nodePosition(index: number) {
  const angle = (index / categoryIds.length) * Math.PI * 2 - Math.PI / 2;
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    x: round(center + Math.cos(angle) * orbit),
    y: round(center + Math.sin(angle) * orbit),
  };
}

function CategoryConstellation() {
  const { translate } = useI18n();

  return (
    <svg
      aria-hidden="true"
      className="mx-auto w-full max-w-md overflow-visible"
      viewBox="0 0 400 400"
    >
      <circle className="rs-constellation__orbit" cx={center} cy={center} r={orbit} />
      {categoryIds.map((category, index) => {
        const { x, y } = nodePosition(index);
        return (
          <g
            className="rs-constellation__node"
            key={category}
            style={revealDelay(index * 140)}
          >
            <line x1={center} x2={x} y1={center} y2={y} />
            <circle cx={x} cy={y} r="7" />
            <text textAnchor="middle" x={x} y={y > center ? y + 28 : y - 16}>
              {translate(`scorecard.categoryShort.${category}`)}
            </text>
          </g>
        );
      })}
      <circle className="rs-constellation__core" cx={center} cy={center} r="22" />
    </svg>
  );
}

export function ScorecardIntro({ onStart }: { onStart: () => void }) {
  const { translate } = useI18n();
  const hydrated = useHydrated();
  const stats = [
    translate("scorecard.intro.stats.questions"),
    translate("scorecard.intro.stats.duration"),
    translate("scorecard.intro.stats.signup"),
  ];

  return (
    <section
      aria-labelledby="scorecard-intro-title"
      className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="rs-step-enter flex flex-col gap-6">
        <h2
          className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-7xl"
          id="scorecard-intro-title"
        >
          {translate("scorecard.intro.title")}
        </h2>
        <Text className="max-w-xl text-lg" tone="muted">
          {translate("scorecard.intro.description")}
        </Text>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((stat) => (
            <li
              className="flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wider text-foreground"
              key={stat}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
              {stat}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <Button disabled={!hydrated} onClick={onStart}>
            {translate("scorecard.intro.start")}
          </Button>
          <Text as="span" className="text-sm" tone="muted">
            {translate("scorecard.intro.note")}
          </Text>
        </div>
      </div>
      <CategoryConstellation />
    </section>
  );
}
```

- [ ] **Step 5: Write `progress-rail.tsx`**

```tsx
import { useI18n } from "../../../i18n/i18n";
import {
  categoryIds,
  getQuestion,
  type CategoryId,
  type QuestionId,
} from "../../../scorecard/questions";
import { getQuestionFlow, type Answers } from "../../../scorecard/scoring";

function segmentFor(category: CategoryId, answers: Answers) {
  const inCategory = getQuestionFlow(answers).filter(
    (question) => question.category === category,
  );
  const answered = inCategory.filter(
    (question) => answers[question.id] !== undefined,
  ).length;
  return { total: inCategory.length, answered };
}

export function ProgressRail({
  answers,
  currentQuestionId,
}: {
  answers: Answers;
  currentQuestionId: QuestionId;
}) {
  const { translate } = useI18n();
  const currentCategory = getQuestion(currentQuestionId).category;

  return (
    <ol aria-label={translate("scorecard.navigation.progress")} className="flex gap-1.5">
      {categoryIds.map((category) => {
        const { total, answered } = segmentFor(category, answers);
        const active = category === currentCategory;
        return (
          <li
            aria-current={active ? "step" : undefined}
            className="flex min-w-0 flex-col gap-2"
            key={category}
            style={{ flexBasis: 0, flexGrow: total }}
          >
            <span
              className={`relative block h-1.5 overflow-hidden rounded-full ${active ? "rs-pulse bg-brand/25" : "bg-hairline"}`}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-500 ease-out"
                style={{ width: `${(answered / total) * 100}%` }}
              />
            </span>
            <span
              className={`hidden truncate font-display text-xs font-semibold uppercase tracking-wider md:block ${active ? "text-brand" : "text-muted-foreground"}`}
            >
              {translate(`scorecard.categoryShort.${category}`)}
            </span>
            <span className="sr-only">
              {translate(`scorecard.categories.${category}`)}: {answered}/{total}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 6: Write `question-step.tsx`**

```tsx
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { useI18n } from "../../../i18n/i18n";
import type { Question } from "../../../scorecard/questions";
import type { Answer } from "../../../scorecard/scoring";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";

const baseOptions: readonly Answer[] = ["yes", "partial", "no", "unknown"];
const naOptions: readonly Answer[] = [...baseOptions, "na"];

type QuestionStepProps = {
  question: Question;
  selected: Answer | undefined;
  position: number;
  total: number;
  onAnswer: (answer: Answer) => void;
  onBack: () => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest("input, textarea, select, [contenteditable='true']") !== null
  );
}

function shortcutAnswer(
  event: KeyboardEvent,
  options: readonly Answer[],
): Answer | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey) return undefined;
  if (isTypingTarget(event.target)) return undefined;
  return options[Number(event.key) - 1];
}

function arrowDelta(key: string): number {
  if (key === "ArrowDown" || key === "ArrowRight") return 1;
  if (key === "ArrowUp" || key === "ArrowLeft") return -1;
  return 0;
}

function optionClasses(checked: boolean): string {
  const base =
    "group flex min-h-16 items-center gap-4 rounded-xl border px-5 py-4 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  return checked
    ? `${base} border-brand bg-brand text-brand-foreground`
    : `${base} border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-brand`;
}

export function QuestionStep({
  question,
  selected,
  position,
  total,
  onAnswer,
  onBack,
}: QuestionStepProps) {
  const { translate } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const options = question.allowsNotApplicable ? naOptions : baseOptions;
  const headingId = `scorecard-question-${question.id}`;
  const focusIndex = selected ? options.indexOf(selected) : 0;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const answer = shortcutAnswer(event, options);
      if (!answer) return;
      event.preventDefault();
      onAnswer(answer);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onAnswer, options]);

  function onOptionKeyDown(event: ReactKeyboardEvent, index: number) {
    const delta = arrowDelta(event.key);
    if (delta === 0) return;
    event.preventDefault();
    optionRefs.current[(index + delta + options.length) % options.length]?.focus();
  }

  return (
    <section aria-labelledby={headingId} className="rs-step-enter flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-sm font-semibold uppercase tracking-widest text-brand">
          <span>{translate(`scorecard.categories.${question.category}`)}</span>
          <span aria-hidden="true" className="h-px w-6 bg-border" />
          <span className="text-muted-foreground">
            {translate("scorecard.navigation.position", {
              values: { current: position, total },
            })}
          </span>
        </p>
        <h2
          className="max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground outline-none sm:text-5xl"
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
        >
          {translate(`scorecard.questions.${question.id}.text`)}
        </h2>
        <Text className="max-w-2xl italic" tone="muted">
          {translate(`scorecard.questions.${question.id}.hint`)}
        </Text>
      </div>

      <div aria-labelledby={headingId} className="grid gap-3 sm:grid-cols-2" role="radiogroup">
        {options.map((option, index) => (
          <button
            aria-checked={selected === option}
            className={optionClasses(selected === option)}
            key={option}
            onClick={() => onAnswer(option)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            role="radio"
            tabIndex={index === Math.max(focusIndex, 0) ? 0 : -1}
            type="button"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/30 font-display text-sm font-semibold tabular-nums opacity-80"
            >
              {index + 1}
            </span>
            <span className="font-display text-xl font-semibold">
              {translate(`scorecard.answers.${option}`)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button onClick={onBack} size="sm" variant="secondary">
          <span aria-hidden="true" className="mr-2">
            ←
          </span>
          {translate("scorecard.navigation.back")}
        </Button>
        <Text as="span" className="hidden text-sm sm:inline" tone="muted">
          {translate("scorecard.navigation.shortcutHint")}
        </Text>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Write a temporary `results-view.tsx` stub**

Task 7 replaces this stub with the real view.

```tsx
import { useI18n } from "../../../i18n/i18n";
import type { ScorecardResult } from "../../../scorecard/scoring";

export function ResultsView({
  result,
}: {
  result: ScorecardResult;
  onRetake: () => void;
  focusOnMount: boolean;
}) {
  const { translate } = useI18n();
  return <h2>{translate(`scorecard.results.verdicts.${result.verdict}.label`)}</h2>;
}
```

- [ ] **Step 8: Write `scorecard.tsx`**

```tsx
import { useCallback, useEffect, useRef, useState } from "react";

import { useAnalytics } from "../../../analytics/analytics";
import { fromResultHash, toResultHash } from "../../../scorecard/encoding";
import { questions, type QuestionId } from "../../../scorecard/questions";
import {
  applyAnswer,
  computeResult,
  getQuestionFlow,
  type Answer,
  type Answers,
} from "../../../scorecard/scoring";
import { ProgressRail } from "./progress-rail";
import { QuestionStep } from "./question-step";
import { ResultsView } from "./results-view";
import { ScorecardIntro } from "./scorecard-intro";

type Phase =
  | { name: "intro" }
  | { name: "question"; questionId: QuestionId }
  | { name: "results"; shared: boolean };

function replaceHash(hash: string) {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", `${pathname}${search}${hash}`);
}

function nextQuestionId(answers: Answers, current: QuestionId) {
  const flow = getQuestionFlow(answers);
  return flow[flow.findIndex((question) => question.id === current) + 1]?.id;
}

function previousQuestionId(answers: Answers, current: QuestionId) {
  const flow = getQuestionFlow(answers);
  return flow[flow.findIndex((question) => question.id === current) - 1]?.id;
}

export function Scorecard({ advanceDelayMs = 220 }: { advanceDelayMs?: number }) {
  const { capture } = useAnalytics();
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const advanceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Deferred one-shot read keeps the prerendered and hydrated trees identical.
    queueMicrotask(() => {
      const shared = fromResultHash(window.location.hash);
      if (!shared) return;
      setAnswers(shared);
      setPhase({ name: "results", shared: true });
    });
    return () => window.clearTimeout(advanceTimer.current);
  }, []);

  const finish = useCallback(
    (completed: Answers) => {
      const result = computeResult(completed);
      replaceHash(toResultHash(completed));
      capture({
        eventName: "scorecard_completed",
        verdict: result.verdict,
        band: result.band,
        criticalRiskCount: result.criticalRisks.length,
        unknownCount: result.criticalUnknowns.length,
      });
      setPhase({ name: "results", shared: false });
    },
    [capture],
  );

  const answer = useCallback(
    (questionId: QuestionId, value: Answer) => {
      const next = applyAnswer(answers, questionId, value);
      setAnswers(next);
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        const following = nextQuestionId(next, questionId);
        if (following) setPhase({ name: "question", questionId: following });
        else finish(next);
      }, advanceDelayMs);
    },
    [answers, advanceDelayMs, finish],
  );

  function start() {
    capture({ eventName: "scorecard_started" });
    setPhase({ name: "question", questionId: questions[0].id });
  }

  function back(questionId: QuestionId) {
    window.clearTimeout(advanceTimer.current);
    const previous = previousQuestionId(answers, questionId);
    setPhase(previous ? { name: "question", questionId: previous } : { name: "intro" });
  }

  function retake() {
    replaceHash("");
    setAnswers({});
    setPhase({ name: "intro" });
  }

  if (phase.name === "results") {
    return (
      <ResultsView
        focusOnMount={!phase.shared}
        onRetake={retake}
        result={computeResult(answers)}
      />
    );
  }

  if (phase.name === "question") {
    const flow = getQuestionFlow(answers);
    const position = flow.findIndex((question) => question.id === phase.questionId);
    const question = flow[position];
    return (
      <div className="flex flex-col gap-10">
        <ProgressRail answers={answers} currentQuestionId={question.id} />
        <QuestionStep
          key={question.id}
          onAnswer={(value) => answer(question.id, value)}
          onBack={() => back(question.id)}
          position={position + 1}
          question={question}
          selected={answers[question.id]}
          total={flow.length}
        />
      </div>
    );
  }

  return <ScorecardIntro onStart={start} />;
}
```

How the double press resolves (Review Focus #1):
- Both key presses fire while the q01 step is mounted, so both call `answer("q01", …)`.
- The second call clears the first timer and re-applies q01.
- The flow therefore advances exactly once, to q02.

The QuestionStep effect re-subscribes when `onAnswer` changes identity. That costs one listener swap per render, which is harmless.

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npx vitest run app/components/domain/scorecard`
Expected: PASS.

If ESLint's complexity rule flags `Scorecard`, extract the question-phase JSX into a local `QuestionPhase` component that takes `answers`, `questionId`, `onAnswer`, and `onBack`.

- [ ] **Step 10: Lint and commit**

```bash
npx prettier --write app/components/domain/scorecard && npx eslint app/components/domain/scorecard && npm run typecheck
git add app/components/domain/scorecard
git commit -m "feat(scorecard): add intro, question flow, and state machine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Animated results view and next step

**Files:**
- Create: `app/components/domain/scorecard/score-ring.tsx`
- Replace: `app/components/domain/scorecard/results-view.tsx`
- Create: `app/components/domain/scorecard/next-step.tsx`
- Test: `app/components/domain/scorecard/results-view.test.tsx`

**Interfaces:**
- Consumes:
  - `ScorecardResult`, `isStrongResult`, `Verdict` (Task 1)
  - `revealDelay`, `useCountUp`, `usePrefersReducedMotion` (Task 5)
  - `renderScorecard` (Task 6)
- Produces:
  - `ResultsView({ result, onRetake, focusOnMount })`
  - `NextStep({ result, verdictLabel, onRetake })`
  - `ScoreRing({ score, tone })`
  - `type VerdictTone`, `verdictTone(verdict: Verdict): VerdictTone`

- [ ] **Step 1: Write the failing tests**

Create `app/components/domain/scorecard/results-view.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { scorecardTranslations } from "../../../i18n/translations/scorecard";
import { renderScorecard } from "./test-utils";

const copy = scorecardTranslations.en;

function openShared(encoded: string) {
  window.history.replaceState(null, "", `/en/scorecard#r=1.${encoded}`);
  return renderScorecard();
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

describe("ResultsView", () => {
  it("announces the score and verdict, and shows the critical banner when a critical risk exists", async () => {
    // q08 "no": 49/52 → 94, one critical risk → needsAttention
    openShared("yyyyyyynyyyyyyyyyyyy");

    expect(
      await screen.findByText(
        "Product Readiness Score: 94 out of 100. Readiness: Needs attention.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.results.criticalBanner)).toBeVisible();
    expect(screen.getByText(copy.results.findings.security.critical)).toBeVisible();
    expect(screen.getByText(copy.results.severities.criticalRisk)).toBeVisible();
  });

  it("lists critical unknowns under areas to verify", async () => {
    openShared("yyyyyyyyyyyyyyyyyyyu");

    expect(
      await screen.findByRole("heading", { name: copy.results.unknownsTitle }),
    ).toBeVisible();
    expect(screen.getByText(copy.questions.q20.topic)).toBeVisible();
  });

  it("renders every category with its percentage", async () => {
    openShared("yyyyyyyyyyypyyyyyyyy");

    expect(await screen.findByText(copy.categories.security)).toBeVisible();
    expect(screen.getByText("94%")).toBeVisible();
    expect(screen.getAllByText("100%")).toHaveLength(6);
  });

  it("builds a prefilled diagnostic email", async () => {
    openShared("yyyyyyynyyyyyyyyyyyy");

    const cta = await screen.findByRole("link", { name: copy.results.nextStep.cta });
    const href = decodeURIComponent(cta.getAttribute("href") ?? "");

    expect(href).toMatch(/^mailto:joao@jobe\.works\?subject=/);
    expect(href).toContain("Product Readiness Scorecard — 94/100");
    expect(href).toContain("Readiness: Needs attention");
    expect(href).toContain("Main findings: Security — Critical risk");
    expect(href).toContain("Areas to verify: 0");
    expect(href).toContain("#r=1.yyyyyyynyyyyyyyyyyyy");
  });

  it("uses the softer call to action for a strong result", async () => {
    openShared("yyyyyyyyyyyyyyyyyyyy");

    expect(
      await screen.findByRole("heading", { name: copy.results.nextStep.strongTitle }),
    ).toBeVisible();
    expect(screen.getByText(copy.results.noFindings)).toBeVisible();
    expect(
      screen.getByRole("link", { name: copy.results.nextStep.strongCta }),
    ).toBeVisible();
  });

  it("copies the result link to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    openShared("yyyyyyyyyyyyyyyyyyyy");

    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.copyLink }),
    );

    await screen.findByRole("button", { name: copy.results.copied });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("#r=1.yyyyyyyyyyyyyyyyyyyy"),
    );
  });

  it("falls back to a selectable field when the clipboard is unavailable", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    openShared("yyyyyyyyyyyyyyyyyyyy");

    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.copyLink }),
    );

    const field = await screen.findByLabelText(copy.results.copyFallback);
    expect(field).toHaveValue(expect.stringContaining("#r=1.") as unknown as string);
  });

  it("ignores scorecard shortcuts typed into the fallback field", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    openShared("yyyyyyyyyyyyyyyyyyyy");
    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.copyLink }),
    );
    const field = await screen.findByLabelText(copy.results.copyFallback);

    fireEvent.keyDown(field, { key: "1" });

    expect(screen.getByLabelText(copy.results.copyFallback)).toBeVisible();
  });

  it("clears the hash and returns to the intro on retake", async () => {
    openShared("yyyyyyyyyyyyyyyyyyyy");

    fireEvent.click(await screen.findByRole("button", { name: copy.results.retake }));

    await waitFor(() => expect(window.location.hash).toBe(""));
    expect(screen.getByRole("button", { name: copy.intro.start })).toBeVisible();
  });
});
```

If `toHaveValue(expect.stringContaining(...))` is rejected by the jest-dom types, use `expect((field as HTMLInputElement).value).toContain("#r=1.")`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/components/domain/scorecard/results-view.test.tsx`
Expected: FAIL. The stub has no announcement, banner, or CTA.

- [ ] **Step 3: Write `score-ring.tsx`**

```tsx
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

export function ScoreRing({ score, tone }: { score: number; tone: VerdictTone }) {
  const reducedMotion = usePrefersReducedMotion();
  const displayed = useCountUp(score, reducedMotion ? 0 : 1100);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const filled = drawn || reducedMotion ? score : 0;

  return (
    <div aria-hidden="true" className={`rs-tone-${tone} relative h-48 w-48 shrink-0 sm:h-56 sm:w-56`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" fill="none" r={radius} stroke="var(--hairline)" strokeWidth="8" />
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
```

- [ ] **Step 4: Write `next-step.tsx`**

```tsx
import { useState } from "react";

import { useAnalytics } from "../../../analytics/analytics";
import { useI18n } from "../../../i18n/i18n";
import { isStrongResult, type ScorecardResult } from "../../../scorecard/scoring";
import { Button } from "../../ui/button";
import { revealDelay } from "./motion";

function useDiagnosticMailto(result: ScorecardResult, verdictLabel: string): string {
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
        {translate(status === "copied" ? "scorecard.results.copied" : "scorecard.results.copyLink")}
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
        {translate(strong ? "scorecard.results.nextStep.strongTitle" : "scorecard.results.nextStep.title")}
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
          {translate(strong ? "scorecard.results.nextStep.strongCta" : "scorecard.results.nextStep.cta")}
        </a>
        <CopyResultLink />
        <Button onClick={onRetake} variant="secondary">
          {translate("scorecard.results.retake")}
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Replace `results-view.tsx`**

```tsx
import { useEffect, useRef } from "react";

import { useI18n } from "../../../i18n/i18n";
import {
  categoryIds,
  getQuestion,
  type CategoryId,
  type QuestionId,
} from "../../../scorecard/questions";
import type { Finding, ScorecardResult } from "../../../scorecard/scoring";
import { Text } from "../../ui/text";
import { revealDelay } from "./motion";
import { NextStep } from "./next-step";
import { ScoreRing, verdictTone } from "./score-ring";

const sectionTitleClass =
  "font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl";

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
        <h2
          className="rs-reveal font-display text-4xl font-bold leading-tight tracking-tight text-foreground outline-none sm:text-6xl"
          id="scorecard-result-title"
          ref={headingRef}
          style={revealDelay(350)}
          tabIndex={-1}
        >
          <span className="text-muted-foreground">{translate("scorecard.results.readiness")}:</span>{" "}
          <span className="rs-tone-text">{verdictLabel}</span>
        </h2>
        <Text className="rs-reveal max-w-xl" style={revealDelay(500)} tone="muted">
          {translate(`scorecard.results.verdicts.${result.verdict}.summary`)}
        </Text>
        {result.criticalRisks.length > 0 ? (
          <p
            className="rs-reveal rounded-lg border border-risk/40 bg-risk/10 px-4 py-3 text-sm font-medium text-foreground"
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
            <span aria-hidden="true" className={`rs-severity-${flag} h-2 w-2 shrink-0 rounded-full bg-[var(--rs-tone)]`} />
          ) : null}
          <span>{translate(`scorecard.categories.${category}`)}</span>
          {flag ? (
            <span className="sr-only">({translate(`scorecard.results.severities.${flag}`)})</span>
          ) : null}
        </span>
        <span className="font-display font-semibold tabular-nums text-muted-foreground">{percent}%</span>
      </div>
      <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-hairline">
        <span
          className="rs-bar-fill block h-full rounded-full bg-brand"
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
    <section aria-labelledby="scorecard-categories-title" className="flex flex-col gap-6">
      <h2 className={sectionTitleClass} id="scorecard-categories-title">
        {translate("scorecard.results.categoriesTitle")}
      </h2>
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
      className={`rs-reveal rs-finding rs-severity-${finding.severity} flex flex-col gap-3 rounded-xl border border-border bg-surface p-6`}
      style={revealDelay(1200 + index * 120)}
    >
      <div className="flex items-center justify-between gap-3">
        <span aria-hidden="true" className="font-display text-3xl font-bold tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rs-severity-tag rounded-full px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider">
          {translate(`scorecard.results.severities.${finding.severity}`)}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        {translate(`scorecard.categories.${finding.category}`)}
      </h3>
      <Text tone="muted">{translate(`scorecard.results.findings.${finding.category}.${kind}`)}</Text>
    </li>
  );
}

function FindingsList({ findings }: { findings: Finding[] }) {
  const { translate } = useI18n();
  return (
    <section aria-labelledby="scorecard-findings-title" className="flex flex-col gap-6">
      <h2 className={sectionTitleClass} id="scorecard-findings-title">
        {translate("scorecard.results.findingsTitle")}
      </h2>
      {findings.length === 0 ? (
        <Text tone="muted">{translate("scorecard.results.noFindings")}</Text>
      ) : (
        <ol className="grid gap-4 lg:grid-cols-3">
          {findings.map((finding, index) => (
            <FindingCard finding={finding} index={index} key={finding.category} />
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
      className="rs-reveal flex flex-col gap-4 rounded-xl border border-dashed border-unknown p-6 sm:p-8"
      style={revealDelay(1600)}
    >
      <h2 className={sectionTitleClass} id="scorecard-unknowns-title">
        {translate("scorecard.results.unknownsTitle")}
      </h2>
      <Text tone="muted">{translate("scorecard.results.unknownsDescription")}</Text>
      <ul className="flex flex-wrap gap-2">
        {questionIds.map((id) => (
          <li className="rounded-full border border-unknown/60 px-3 py-1 text-sm text-foreground" key={id}>
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
  const verdictLabel = translate(`scorecard.results.verdicts.${result.verdict}.label`);

  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <ResultSummary focusOnMount={focusOnMount} result={result} verdictLabel={verdictLabel} />
      <CategoryBreakdown result={result} />
      <FindingsList findings={result.findings} />
      {result.criticalUnknowns.length > 0 ? (
        <AreasToVerify questionIds={result.criticalUnknowns} />
      ) : null}
      <NextStep onRetake={onRetake} result={result} verdictLabel={verdictLabel} />
    </div>
  );
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run app/components/domain/scorecard`
Expected: PASS. This covers both `scorecard.test.tsx` and `results-view.test.tsx`.

The `scorecard.test.tsx` assertions still work against the real view:
- `findByText(copy.results.verdicts.strong.label)` finds the verdict span.
- `findByText(...highRisk.label)` finds the verdict span.

- [ ] **Step 7: Lint and commit**

```bash
npx prettier --write app/components/domain/scorecard && npx eslint app/components/domain/scorecard && npm run typecheck
git add app/components/domain/scorecard
git commit -m "feat(scorecard): add animated results and diagnostic CTA

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Route and site integration

**Files:**
- Create: `app/routes/$locale.scorecard.tsx`
- Modify: `app/routes/seo-meta.test.tsx`
- Modify: `app/routes/$locale._index.tsx` (hero CTA ~line 150, funnel heading ~line 245)
- Modify: `app/i18n/translations/home.ts`
- Modify: `app/routes/$locale.case.tsx`, `app/i18n/translations/case.ts`
- Modify: `app/routes/$locale.contact.tsx`, `app/i18n/translations/contact.ts`
- Test: `app/routes/$locale.test.tsx` (extend)

**Interfaces:**
- Consumes: `Scorecard` (Task 6) and `scorecardTranslations` (Task 3).
- Produces:
  - Public routes `/en/scorecard` and `/pt-BR/scorecard`.
  - New translation keys:

    | Key | Purpose |
    |---|---|
    | `home.funnel.scorecardPrompt` | Funnel link text |
    | `case.scorecard.{title,description,cta}` | Case study closing band |
    | `contact.scorecardPrompt` | Contact page link text |

- [ ] **Step 1: Write the failing tests**

1. Add the import `import { meta as scorecardMeta } from "./$locale.scorecard";` to `app/routes/seo-meta.test.tsx`.
2. Add this test inside its `describe`:

```ts
  it("emits localized, indexable scorecard metadata", () => {
    const meta = scorecardMeta(args("/pt-BR/scorecard", "pt-BR"));

    expect(meta).toContainEqual({
      title: "Product Readiness Scorecard | JOBE — Engenharia que Funciona",
    });
    expect(meta).not.toContainEqual({
      name: "robots",
      content: "noindex,follow",
    });
  });
```

In `app/routes/$locale.test.tsx`:
1. Find the existing test that renders the home route through `renderLocalizedRoute` and asserts hero links. If none exists, add a new `it` that follows the nearest existing `renderLocalizedRoute("/en/…")` home test.
2. Add this assertion:

```ts
    expect(
      screen.getByRole("link", { name: /Take the readiness scorecard/ }),
    ).toHaveAttribute("href", "/en/scorecard");
    expect(
      screen.getByRole("link", { name: /Start with the 4-minute scorecard/ }),
    ).toHaveAttribute("href", "/en/scorecard");
```

You also need to:
1. Add `{ id: "scorecard", kind: "page", pattern: "/:locale/scorecard", urls: { en: "/en/scorecard", "pt-BR": "/pt-BR/scorecard" } }` to `canonicalManifest` in that file.
2. Register the route `{ path: "scorecard", Component: ScorecardPage }` (import `ScorecardPage from "./$locale.scorecard"`) wherever the file builds its child routes, mirroring how `Services` is registered.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/routes`
Expected: FAIL with `Failed to resolve import "./$locale.scorecard"`.

- [ ] **Step 3: Create `app/routes/$locale.scorecard.tsx`**

```tsx
import { Scorecard } from "../components/domain/scorecard/scorecard";
import { Container } from "../components/ui/container";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { scorecardTranslations } from "../i18n/translations/scorecard";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.scorecard";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...scorecardTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function ScorecardPage() {
  const { translate } = useI18n();

  return (
    <main className="overflow-x-clip py-12 sm:py-20">
      <Container>
        <h1 className="mb-10 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand sm:mb-14">
          {translate("scorecard.intro.eyebrow")}
        </h1>
        <Scorecard />
      </Container>
    </main>
  );
}
```

- [ ] **Step 4: Home integration**

In `app/i18n/translations/home.ts`:
1. Add `scorecardPrompt: string;` to `HomeTranslation.funnel`.
2. Set `en.hero.ctaSecondary: "Take the readiness scorecard"`.
3. Set `"pt-BR".hero.ctaSecondary: "Fazer o scorecard de readiness"`.
4. Add `scorecardPrompt: "Not ready to talk? Start with the 4-minute scorecard"` to `en.funnel`.
5. Add `scorecardPrompt: "Ainda não é hora de conversar? Comece pelo scorecard de 4 minutos"` to `"pt-BR".funnel`.

In `app/routes/$locale._index.tsx`, change the second hero `AtlasAction`:

```tsx
            <AtlasAction
              index="02"
              onClick={() => captureCta("hero-scorecard")}
              to={`/${locale}/scorecard`}
              variant="secondary"
            >
              {translate("home.hero.ctaSecondary")}
            </AtlasAction>
```

In the method section heading, after `<p>{translate("home.funnel.description")}</p>`, add a link that reuses the services-section link style:

```tsx
          <Link
            className="atlas-inline-link"
            to={`/${locale}/scorecard`}
            onClick={() => captureCta("funnel-scorecard")}
          >
            {translate("home.funnel.scorecardPrompt")}
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </Link>
```

- [ ] **Step 5: Case study closing band**

In `app/i18n/translations/case.ts`:
1. Add `scorecard: { title: string; description: string; cta: string };` to `CaseTranslation`.
2. Add this to `en`:

```ts
    scorecard: {
      title: "How does your product compare?",
      description:
        "Take the 20-question Product Readiness Scorecard and see where your product stands.",
      cta: "Take the scorecard",
    },
```

3. Add this to `"pt-BR"`:

```ts
    scorecard: {
      title: "Como seu produto se compara?",
      description:
        "Responda ao Product Readiness Scorecard de 20 perguntas e veja onde seu produto está.",
      cta: "Fazer o scorecard",
    },
```

In `app/routes/$locale.case.tsx`:
1. Import `TextLink` from `../components/ui/text-link` and `useAnalytics` from `../analytics/analytics`.
2. Change the hook line to `const { locale, translate } = useI18n();` and add `const { capture } = useAnalytics();`.
3. After `</article>` (still inside `Container`), add:

```tsx
        <aside className="mx-auto mt-16 flex max-w-3xl flex-col gap-4 border-l-2 border-brand pl-6">
          <Heading as="h2" level="card">
            {translate("case.scorecard.title")}
          </Heading>
          <Text tone="muted">{translate("case.scorecard.description")}</Text>
          <div>
            <TextLink
              onClick={() =>
                capture({ eventName: "cta_pressed", ctaId: "case-scorecard", context: "case" })
              }
              to={`/${locale}/scorecard`}
            >
              {translate("case.scorecard.cta")}
            </TextLink>
          </div>
        </aside>
```

Check `app/components/ui/text-link.tsx` accepts `onClick`. It is used with `onClick` in `$locale.services.tsx`, so it does.

- [ ] **Step 6: Contact page link**

In `app/i18n/translations/contact.ts`:
1. Add `scorecardPrompt: string;` to `ContactTranslation` after `deliverables`.
2. Add `scorecardPrompt: "Want a head start? Take the Product Readiness Scorecard"` to `en`.
3. Add `scorecardPrompt: "Quer adiantar? Faça o Product Readiness Scorecard"` to `"pt-BR"`.

In `app/routes/$locale.contact.tsx`:
1. Change the hook line to `const { locale, translate } = useI18n();`.
2. After the deliverables `</ul>`, add:

```tsx
              <div>
                <TextLink to={`/${locale}/scorecard`} variant="secondary">
                  {translate("contact.scorecardPrompt")}
                </TextLink>
              </div>
```

If `TextLink` has no `variant="secondary"`, drop the prop. `$locale.about.tsx` uses it, so it exists.

- [ ] **Step 7: Run the full unit suite and build**

Run: `npm run check`
Expected:
- PASS, including format, lint, typecheck, coverage thresholds, and the static build.
- The prerender log lists `/en/scorecard` and `/pt-BR/scorecard`.

- [ ] **Step 8: Commit**

```bash
git add app
git commit -m "feat(scorecard): publish scorecard route and link it across the site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Browser tests

**Files:**
- Create: `tests/e2e/scorecard.spec.ts`

**Interfaces:**
- Consumes: the built site from Task 8, `scorecardTranslations`, and `tests/e2e/fixtures.ts`, whose auto fixture fails the test on any console error.

- [ ] **Step 1: Write the tests**

```ts
import type { Page } from "@playwright/test";

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../../app/consent/consent";
import { scorecardTranslations } from "../../app/i18n/translations/scorecard";
import { expect, test as base } from "./fixtures";

const test = base.extend<{ consented: void }>({
  consented: [
    async ({ page }, use) => {
      await page.addInitScript(
        ({ key, version }) => {
          localStorage.setItem(
            key,
            JSON.stringify({
              version,
              analytics: false,
              marketing: false,
              updatedAt: "2026-01-01T00:00:00.000Z",
            }),
          );
        },
        { key: CONSENT_STORAGE_KEY, version: CONSENT_VERSION },
      );
      await use();
    },
    { auto: true },
  ],
});

const en = scorecardTranslations.en;
const pt = scorecardTranslations["pt-BR"];

async function startScorecard(page: Page, startLabel: string) {
  const start = page.getByRole("button", { name: startLabel });
  await expect(start).toBeEnabled();
  await start.click();
}

async function answerAll(page: Page, keys: string[], positionLabel: (n: number) => string) {
  for (const [index, key] of keys.entries()) {
    await expect(page.getByText(positionLabel(index + 1))).toBeVisible();
    await page.keyboard.press(key);
  }
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("completes the scorecard in English and offers a prefilled diagnostic email", async ({ page }) => {
  await page.goto("/en/scorecard");
  await expect(
    page.getByRole("heading", { level: 1, name: en.intro.eyebrow }),
  ).toBeVisible();
  await startScorecard(page, en.intro.start);

  const keys = Array<string>(20).fill("1");
  keys[7] = "3"; // q08 "No" → one critical risk
  await answerAll(page, keys, (n) => `Question ${n} of 20`);

  await expect(page.getByText(en.results.verdicts.needsAttention.label)).toBeVisible();
  await expect(page.getByText(en.results.criticalBanner)).toBeVisible();
  await expect(page).toHaveURL(/#r=1\.yyyyyyynyyyyyyyyyyyy$/);

  const cta = page.getByRole("link", { name: en.results.nextStep.cta });
  const href = decodeURIComponent((await cta.getAttribute("href")) ?? "");
  expect(href).toMatch(/^mailto:joao@jobe\.works\?subject=/);
  expect(href).toContain("Score: 94/100");
});

test("completes the scorecard in Portuguese", async ({ page }) => {
  await page.goto("/pt-BR/scorecard");
  await startScorecard(page, pt.intro.start);

  await answerAll(page, Array<string>(20).fill("1"), (n) => `Pergunta ${n} de 20`);

  await expect(page.getByText(pt.results.verdicts.strong.label)).toBeVisible();
});

test("opens a shared result link directly and can retake", async ({ page }) => {
  await page.goto("/pt-BR/scorecard#r=1.nnnnnnnnnnnnnnnnnnnn");

  await expect(page.getByText(pt.results.verdicts.highRisk.label)).toBeVisible();
  await page.getByRole("button", { name: pt.results.retake }).click();
  await expect(page.getByRole("button", { name: pt.intro.start })).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
});

test("navigates from the home hero to the scorecard", async ({ page }) => {
  await page.goto("/en/");
  await page.getByRole("link", { name: /Take the readiness scorecard/ }).first().click();

  await expect(page).toHaveURL(/\/en\/scorecard$/);
  await expect(page.getByRole("button", { name: en.intro.start })).toBeVisible();
});

test("renders results in their final state with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/scorecard#r=1.yyyyyyyyyyypyyyyyyyy");

  await expect(page.getByText(en.results.verdicts.strong.label)).toBeVisible();
  const animation = await page
    .locator(".rs-reveal")
    .first()
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
});

test("fits a narrow phone without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/pt-BR/scorecard");
  await startScorecard(page, pt.intro.start);
  await expect(page.getByText("Pergunta 1 de 20")).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto("/pt-BR/scorecard#r=1.nupnupnupnupnupnupnu");
  await expect(page.getByRole("heading", { name: pt.results.findingsTitle })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
```

The `nupnupnupnupnupnupnu` hash is valid: index 14 (q15) is `p`, index 15 (q16) is `n`, and there is no `x`. It produces several critical risks, gaps, and unknowns, so every results section renders with long pt-BR copy.

- [ ] **Step 2: Run the browser tests**

Run: `npm run test:e2e -- tests/e2e/scorecard.spec.ts`
Expected: PASS (6 tests). The fixture reports no browser console errors, including hydration mismatches.

If the home hero link is duplicated (mobile and desktop rail), `.first()` already handles it. If the click lands on a hidden duplicate, use `getByRole(...).filter({ visible: true })`.

- [ ] **Step 3: Run the whole browser suite**

Run: `npm run test:e2e`
Expected: PASS. If an existing test asserted the old "See the StockCast case" hero link, update it to the new label and keep its intent: it checks that the secondary hero CTA navigates correctly.

- [ ] **Step 4: Commit**

```bash
npx prettier --write tests/e2e/scorecard.spec.ts
git add tests/e2e
git commit -m "test(scorecard): cover completion, sharing, motion, and mobile layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Final validation and architecture review

**Files:**
- Possibly modify any file flagged by the review.

- [ ] **Step 1: Full deterministic validation**

```bash
nvm use && npm run check && npm run test:e2e
```

Expected: both pass. Fix root causes; never relax thresholds, tests, or hooks.

- [ ] **Step 2: Architecture review**

The repository's reviewer is defined in `.opencode/agents/architecture-review.md`. Dispatch a general-purpose subagent with these instructions:
1. Follow `.opencode/agents/architecture-review.md` exactly.
2. Review `git diff main...HEAD`.
3. Report findings by severity.

Fix every high and medium finding, re-run Step 1, and commit:

```bash
git commit -am "fix(scorecard): address architecture review findings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Visual check**

1. Run `npm run build && npm run preview`.
2. Open `/en/scorecard` and `/pt-BR/scorecard` in light and dark themes at desktop and 375 px widths.
3. Complete the flow and confirm:
   - The ring draws.
   - The bars fill in sequence.
   - The findings stagger in.
   - The severity colors read clearly in both themes.
4. Note any contrast issue and fix it in the `--risk`/`--gap`/`--unknown` tokens.
