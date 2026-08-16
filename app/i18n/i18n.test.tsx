import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { I18nProvider, useI18n } from "./i18n";
import type { TranslationScope } from "./types";

function TranslationProbe() {
  const { locale, translate } = useI18n();
  return (
    <p>
      {locale}: {translate("home.hero.title")}
    </p>
  );
}

describe("i18n context", () => {
  it.each([
    ["en", "en: Engineering that Works"],
    ["pt-BR", "pt-BR: Engenharia que Funciona"],
  ] as const)("binds translations to %s", (locale, expected) => {
    render(
      <I18nProvider locale={locale}>
        <TranslationProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(expected)).toBeVisible();
  });

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

    expect(screen.getByText("en: Engineering that Works")).toBeVisible();
    expect(screen.getByText("pt-BR: Engenharia que Funciona")).toBeVisible();
  });

  it("throws for a runtime missing translation", () => {
    const missingScope = "home.missing" as TranslationScope;
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => (
        <I18nProvider locale="en">{children}</I18nProvider>
      ),
    });
    const translate = result.current.translate as (
      scope: TranslationScope,
    ) => string;

    expect(() => translate(missingScope)).toThrow(
      "Missing translation: en.home.missing",
    );
  });

  it("keeps provider policy authoritative over runtime options", () => {
    const titleScope = "home.hero.title" as TranslationScope;
    const missingScope = "home.missing" as TranslationScope;
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => (
        <I18nProvider locale="en">{children}</I18nProvider>
      ),
    });
    const translate = result.current.translate as (
      scope: TranslationScope,
      options: Record<string, unknown>,
    ) => string;

    expect(
      translate(titleScope, {
        locale: "pt-BR",
        missingBehavior: "guess",
        values: {
          name: "Agent",
          count: 99,
          locale: "pt-BR",
          missingBehavior: "guess",
          defaultValue: "Fallback",
          defaults: [{ message: "Fallback" }],
          scope: "home",
        },
      }),
    ).toBe("Engineering that Works");
    expect(() =>
      translate(missingScope, {
        locale: "pt-BR",
        missingBehavior: "guess",
        defaultValue: "Fallback",
      }),
    ).toThrow("Missing translation: en.home.missing");
  });

  it("requires consumers to be inside the provider", () => {
    expect(() => renderHook(() => useI18n())).toThrow(
      "useI18n must be used within I18nProvider",
    );
  });
});
