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
  {
    id: "q01",
    category: "delivery",
    classification: "required",
    critical: false,
    weight: 2,
  },
  {
    id: "q02",
    category: "delivery",
    classification: "required",
    critical: false,
    weight: 3,
  },
  {
    id: "q03",
    category: "delivery",
    classification: "required",
    critical: false,
    weight: 2,
  },
  {
    id: "q04",
    category: "delivery",
    classification: "required",
    critical: true,
    weight: 3,
  },
  {
    id: "q05",
    category: "testing",
    classification: "required",
    critical: false,
    weight: 3,
  },
  {
    id: "q06",
    category: "testing",
    classification: "required",
    critical: false,
    weight: 2,
  },
  {
    id: "q07",
    category: "security",
    classification: "required",
    critical: true,
    weight: 3,
  },
  {
    id: "q08",
    category: "security",
    classification: "required",
    critical: true,
    weight: 3,
  },
  {
    id: "q09",
    category: "security",
    classification: "required",
    critical: false,
    weight: 3,
  },
  {
    id: "q10",
    category: "security",
    classification: "required",
    critical: true,
    weight: 3,
  },
  {
    id: "q11",
    category: "security",
    classification: "required",
    critical: true,
    weight: 3,
  },
  {
    id: "q12",
    category: "security",
    classification: "recommended",
    critical: false,
    weight: 2,
  },
  {
    id: "q13",
    category: "observability",
    classification: "required",
    critical: true,
    weight: 3,
  },
  {
    id: "q14",
    category: "observability",
    classification: "required",
    critical: true,
    weight: 3,
  },
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
  {
    id: "q17",
    category: "reliability",
    classification: "required",
    critical: false,
    weight: 2,
  },
  {
    id: "q18",
    category: "performance",
    classification: "required",
    critical: false,
    weight: 2,
  },
  {
    id: "q19",
    category: "performance",
    classification: "recommended",
    critical: false,
    weight: 1,
  },
  {
    id: "q20",
    category: "privacy",
    classification: "required",
    critical: true,
    weight: 3,
  },
];

const questionsById = new Map(
  questions.map((question) => [question.id, question]),
);

export function getQuestion(id: QuestionId): Question {
  const question = questionsById.get(id);
  if (!question) throw new Error(`Unknown scorecard question: ${id}`);
  return question;
}
