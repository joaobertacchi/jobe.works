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
