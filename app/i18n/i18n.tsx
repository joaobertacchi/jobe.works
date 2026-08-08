import { createContext, useContext, type ReactNode } from "react";

import type { SupportedLocale } from "./config";
import { aboutTranslations } from "./translations/about";
import { commonTranslations } from "./translations/common";
import { homeTranslations } from "./translations/home";
import { notFoundTranslations } from "./translations/not-found";
import { servicesTranslations } from "./translations/services";
import type { Translation, TranslationScope } from "./types";

const translations = {
  en: {
    common: commonTranslations.en,
    home: homeTranslations.en,
    about: aboutTranslations.en,
    services: servicesTranslations.en,
    notFound: notFoundTranslations.en,
  },
  "pt-BR": {
    common: commonTranslations["pt-BR"],
    home: homeTranslations["pt-BR"],
    about: aboutTranslations["pt-BR"],
    services: servicesTranslations["pt-BR"],
    notFound: notFoundTranslations["pt-BR"],
  },
} satisfies Record<SupportedLocale, Translation>;

type I18nValue = {
  locale: SupportedLocale;
  translate: (scope: TranslationScope) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function resolveTranslation(
  dictionary: Translation,
  scope: TranslationScope,
): string {
  return scope
    .split(".")
    .reduce<unknown>(
      (value, segment) => (value as Record<string, unknown>)[segment],
      dictionary,
    ) as string;
}

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: SupportedLocale;
}) {
  const translate = (scope: TranslationScope) =>
    resolveTranslation(translations[locale], scope);

  return (
    <I18nContext.Provider value={{ locale, translate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
