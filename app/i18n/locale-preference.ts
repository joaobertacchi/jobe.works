import {
  defaultLocale,
  isSupportedLocale,
  supportedLocales,
  type SupportedLocale,
} from "./config";

export const LOCALE_STORAGE_KEY = "locale";

export type LocaleStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): LocaleStorage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

export function readPreferredLocale(storage?: LocaleStorage): SupportedLocale {
  try {
    const value = (storage ?? browserStorage())?.getItem(LOCALE_STORAGE_KEY);
    return value && isSupportedLocale(value) ? value : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export function persistLocale(
  locale: SupportedLocale,
  storage?: LocaleStorage,
): void {
  try {
    (storage ?? browserStorage())?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage may be blocked by browser privacy settings.
  }
}

// Runs in the prerendered root document head, before styles, the app bundle,
// or hydration, so `/` never paints while the preferred locale is chosen.
export const rootLocaleRedirectScript = `(()=>{let l=null;try{l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)})}catch{}location.replace("/"+(${JSON.stringify(supportedLocales)}.includes(l)?l:${JSON.stringify(defaultLocale)})+"/")})()`;
