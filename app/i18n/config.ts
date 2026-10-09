export const locales = {
  en: {
    label: "English",
    htmlLang: "en",
    ogLocale: "en_US",
  },
  "pt-BR": {
    label: "Português",
    htmlLang: "pt-BR",
    ogLocale: "pt_BR",
  },
} as const;

export type SupportedLocale = keyof typeof locales;

export const supportedLocales = Object.keys(locales) as SupportedLocale[];
export const defaultLocale: SupportedLocale = "pt-BR";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return Object.hasOwn(locales, value);
}

export function getLocaleFromPathname(
  pathname: string,
): SupportedLocale | undefined {
  const locale = pathname.split("/")[1];
  return locale && isSupportedLocale(locale) ? locale : undefined;
}
