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
  return (
    prefix + questionIds.map((id) => codes[answers[id] ?? "unknown"]).join("")
  );
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
