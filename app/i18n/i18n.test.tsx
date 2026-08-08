import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { I18nProvider, useI18n } from "./i18n";
import type { TranslationScope } from "./types";

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

  it.each([
    ["en", ["No examples", "One example", "2 examples"]],
    ["pt-BR", ["Nenhum exemplo", "Um exemplo", "2 exemplos"]],
  ] as const)(
    "pluralizes and interpolates translations in %s",
    (locale, expected) => {
      const { result } = renderHook(() => useI18n(), {
        wrapper: ({ children }) => (
          <I18nProvider locale={locale}>{children}</I18nProvider>
        ),
      });

      expect(
        [0, 1, 2].map((count) =>
          result.current.translate("home.exampleCount", { count }),
        ),
      ).toEqual(expected);
    },
  );

  it("keeps simultaneously rendered providers bound to their locales", () => {
    render(
      <>
        <I18nProvider locale="en">
          <TranslationProbe />
        </I18nProvider>
        <I18nProvider locale="pt-BR">
          <TranslationProbe />
        </I18nProvider>
      </>,
    );

    expect(screen.getByText("en: Static website template")).toBeVisible();
    expect(screen.getByText("pt-BR: Modelo de site estático")).toBeVisible();
  });

  it("throws for a runtime missing translation", () => {
    const missingScope = "home.missing" as TranslationScope;
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => (
        <I18nProvider locale="en">{children}</I18nProvider>
      ),
    });

    expect(() => result.current.translate(missingScope)).toThrow(
      "Missing translation: en.home.missing",
    );
  });

  it("requires consumers to be inside the provider", () => {
    expect(() => renderHook(() => useI18n())).toThrow(
      "useI18n must be used within I18nProvider",
    );
  });
});
