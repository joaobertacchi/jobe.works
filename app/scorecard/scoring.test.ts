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
    expect(
      getQuestionFlow(answers).map((question) => question.id),
    ).not.toContain("q16");
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
    const answers = applyAnswer(allAnswers("yes", { q05: "no" }), "q15", "na");

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
