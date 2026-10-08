import { useCallback, useEffect, useRef, useState } from "react";

import { useAnalytics } from "../../../analytics/analytics";
import { fromResultHash, toResultHash } from "../../../scorecard/encoding";
import { questions, type QuestionId } from "../../../scorecard/questions";
import {
  applyAnswer,
  computeResult,
  getQuestionFlow,
  isComplete,
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
  window.history.replaceState(
    window.history.state,
    "",
    `${pathname}${search}${hash}`,
  );
}

function nextQuestionId(answers: Answers, current: QuestionId) {
  const flow = getQuestionFlow(answers);
  return flow[flow.findIndex((question) => question.id === current) + 1]?.id;
}

function previousQuestionId(answers: Answers, current: QuestionId) {
  const flow = getQuestionFlow(answers);
  return flow[flow.findIndex((question) => question.id === current) - 1]?.id;
}

export function Scorecard({
  advanceDelayMs = 220,
}: {
  advanceDelayMs?: number;
}) {
  const { capture } = useAnalytics();
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const advanceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function syncFromHash() {
      const shared = fromResultHash(window.location.hash);
      if (shared) {
        setAnswers(shared);
        setPhase({ name: "results", shared: true });
        return;
      }
      setPhase((current) =>
        current.name === "results" ? { name: "intro" } : current,
      );
    }
    // Deferred first read keeps the prerendered and hydrated trees identical;
    // later hash changes (a result link pasted into this tab) re-sync.
    queueMicrotask(syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.clearTimeout(advanceTimer.current);
    };
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
    if (isComplete(answers)) setAnswers({});
    setPhase({ name: "question", questionId: questions[0].id });
  }

  function back(questionId: QuestionId) {
    window.clearTimeout(advanceTimer.current);
    const previous = previousQuestionId(answers, questionId);
    setPhase(
      previous ? { name: "question", questionId: previous } : { name: "intro" },
    );
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
    const position = flow.findIndex(
      (question) => question.id === phase.questionId,
    );
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
