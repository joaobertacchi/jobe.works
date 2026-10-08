import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

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
    optionRefs.current[
      (index + delta + options.length) % options.length
    ]?.focus();
  }

  return (
    <section
      aria-labelledby={headingId}
      className="rs-step-enter flex flex-col gap-8"
    >
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

      <div
        aria-labelledby={headingId}
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
      >
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
