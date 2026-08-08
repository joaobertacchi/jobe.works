import { I18n } from "i18n-js";
import { createContext, useContext, type ReactNode } from "react";

import { defaultLocale, type SupportedLocale } from "./config";
import { translations } from "./translations";
import type { Translate, TranslationOptions, TranslationScope } from "./types";

type I18nValue = {
  locale: SupportedLocale;
  translate: Translate &
    ((scope: TranslationScope, options?: TranslationOptions) => string);
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: SupportedLocale;
}) {
  const i18n = new I18n(translations, {
    locale,
    defaultLocale,
    enableFallback: false,
    missingBehavior: "error",
  });
  const translate = ((scope: TranslationScope, options?: TranslationOptions) =>
    i18n.t(scope, options) as string) as I18nValue["translate"];

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
