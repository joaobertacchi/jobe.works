import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

function I18nValueProbe({
  onRender,
}: {
  onRender: (value: ReturnType<typeof useI18n>) => void;
}) {
  const value = useI18n();
  onRender(value);
  return null;
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

  it.each([
    ["en", "Hello, Agent"],
    ["pt-BR", "Olá, Agent"],
  ] as const)("interpolates named values in %s", (locale, expected) => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => (
        <I18nProvider locale={locale}>{children}</I18nProvider>
      ),
    });

    expect(
      result.current.translate("home.greeting", {
        values: { name: "Agent" },
      }),
    ).toBe(expected);
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

    expect(screen.getByText("en: Static website template")).toBeVisible();
    expect(screen.getByText("pt-BR: Modelo de site estático")).toBeVisible();
  });

  it("memoizes the locale-bound translator", () => {
    const onRender = vi.fn();
    const { rerender } = render(
      <I18nProvider locale="en">
        <I18nValueProbe onRender={onRender} />
      </I18nProvider>,
    );
    const english = onRender.mock.calls.at(-1)?.[0] as ReturnType<
      typeof useI18n
    >;

    rerender(
      <I18nProvider locale="en">
        <I18nValueProbe onRender={onRender} />
      </I18nProvider>,
    );
    const rerenderedEnglish = onRender.mock.calls.at(-1)?.[0] as ReturnType<
      typeof useI18n
    >;

    expect(rerenderedEnglish.translate).toBe(english.translate);

    rerender(
      <I18nProvider locale="pt-BR">
        <I18nValueProbe onRender={onRender} />
      </I18nProvider>,
    );
    const portuguese = onRender.mock.calls.at(-1)?.[0] as ReturnType<
      typeof useI18n
    >;

    expect(portuguese.translate).not.toBe(english.translate);
    expect(portuguese.translate("home.title")).toBe("Modelo de site estático");
    expect(english.translate("home.title")).toBe("Static website template");
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

  it("sanitizes runtime translation options", () => {
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

    expect(() =>
      translate(missingScope, {
        count: 2,
        locale: "pt-BR",
        missingBehavior: "guess",
        defaultValue: "Fallback",
        defaults: [{ message: "Fallback" }],
        scope: "home",
      }),
    ).toThrow("Missing translation: en.home.missing");
  });

  it("sanitizes reserved nested interpolation values", () => {
    const greetingScope = "home.greeting" as TranslationScope;
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
    const options = {
      values: {
        name: "Agent",
        count: 99,
        locale: "pt-BR",
        missingBehavior: "guess",
        defaultValue: "Fallback",
        defaults: [{ message: "Fallback" }],
        scope: "home",
      },
    };

    expect(translate(greetingScope, options)).toBe("Hello, Agent");
    expect(() => translate(missingScope, options)).toThrow(
      "Missing translation: en.home.missing",
    );
  });

  it("requires consumers to be inside the provider", () => {
    expect(() => renderHook(() => useI18n())).toThrow(
      "useI18n must be used within I18nProvider",
    );
  });
});
