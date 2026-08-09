import { I18n } from "i18n-js";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { defaultLocale, type SupportedLocale } from "./config";
import { translations } from "./translations";
import type { Translate, TranslationOptions, TranslationScope } from "./types";

type I18nValue = {
  locale: SupportedLocale;
  translate: Translate;
};

const reservedInterpolationKeys: ReadonlySet<string> = new Set([
  "count",
  "defaultValue",
  "defaults",
  "locale",
  "missingBehavior",
  "scope",
]);

const I18nContext = createContext<I18nValue | null>(null);

function sanitizeTranslationOptions(
  options?: TranslationOptions,
): Record<string, string | number> | undefined {
  const sanitizedOptions = Object.fromEntries(
    Object.entries(options?.values ?? {}).filter(
      ([key, value]) =>
        !reservedInterpolationKeys.has(key) &&
        (typeof value === "string" || typeof value === "number"),
    ),
  ) as Record<string, string | number>;

  if (options?.count !== undefined) {
    sanitizedOptions.count = options.count;
  }

  return Object.keys(sanitizedOptions).length === 0
    ? undefined
    : sanitizedOptions;
}

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: SupportedLocale;
}) {
  const value = useMemo<I18nValue>(() => {
    const i18n = new I18n(translations, {
      locale,
      defaultLocale,
      enableFallback: false,
      missingBehavior: "error",
    });
    const translate = ((
      scope: TranslationScope,
      options?: TranslationOptions,
    ) =>
      i18n.t(
        scope,
        sanitizeTranslationOptions(options),
      ) as string) as Translate;

    return { locale, translate };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
