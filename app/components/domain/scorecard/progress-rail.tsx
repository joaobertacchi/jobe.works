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
    <ol
      aria-label={translate("scorecard.navigation.progress")}
      className="flex gap-1.5"
    >
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
              className={`relative block h-1.5 overflow-hidden ${active ? "rs-pulse bg-brand/25" : "bg-hairline"}`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-brand transition-[width] duration-500 ease-out"
                style={{ width: `${(answered / total) * 100}%` }}
              />
            </span>
            <span
              className={`hidden truncate font-display text-xs font-semibold uppercase tracking-wider md:block ${active ? "text-brand" : "text-muted-foreground"}`}
            >
              {translate(`scorecard.categoryShort.${category}`)}
            </span>
            <span className="sr-only">
              {translate(`scorecard.categories.${category}`)}: {answered}/
              {total}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
