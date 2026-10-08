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
