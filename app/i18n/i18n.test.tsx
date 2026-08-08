import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { I18nProvider, useI18n } from "./i18n";

function TranslationProbe() {
  const { locale, translate } = useI18n();
  return (
    <p>
      {locale}: {translate("home.title")}
    </p>
  );
}

describe("i18n context", () => {
  it.each([
    ["en", "en: Static website template"],
    ["pt-BR", "pt-BR: Modelo de site estático"],
  ] as const)("binds translations to %s", (locale, expected) => {
    render(
      <I18nProvider locale={locale}>
        <TranslationProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(expected)).toBeVisible();
  });

  it("requires consumers to be inside the provider", () => {
    expect(() => renderHook(() => useI18n())).toThrow(
      "useI18n must be used within I18nProvider",
    );
  });
});
