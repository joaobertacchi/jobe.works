export const locales = {
  en: {
    label: "English",
    htmlLang: "en",
  },
  "pt-BR": {
    label: "Português",
    htmlLang: "pt-BR",
  },
} as const;

export type SupportedLocale = keyof typeof locales;

export const supportedLocales = Object.keys(locales) as SupportedLocale[];
export const defaultLocale: SupportedLocale = "pt-BR";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return Object.hasOwn(locales, value);
}

export function selectPreferredLocale(
  languages: readonly string[],
): SupportedLocale {
  for (const language of languages) {
    const normalizedLanguage = language.toLowerCase();
    const exactMatch = supportedLocales.find(
      (locale) => locale.toLowerCase() === normalizedLanguage,
    );
    if (exactMatch) return exactMatch;

    const baseLanguage = normalizedLanguage.split("-")[0];
    const baseMatch = supportedLocales.find(
      (locale) => locale.split("-")[0].toLowerCase() === baseLanguage,
    );
    if (baseMatch) return baseMatch;
  }

  return defaultLocale;
}

export function getLocaleFromPathname(
  pathname: string,
): SupportedLocale | undefined {
  const locale = pathname.split("/")[1];
  return locale && isSupportedLocale(locale) ? locale : undefined;
}
