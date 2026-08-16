import type { SupportedLocale } from "./config";
import type { Translate, Translation } from "./types";

declare const translate: Translate;

translate("about.title");
translate("home.hero.title");

// @ts-expect-error Callers cannot override the provider locale.
translate("about.title", { locale: "pt-BR" });

// @ts-expect-error Invalid translation path.
translate("about.missing");

// @ts-expect-error The registry must include every supported locale.
const incompleteRegistry: Record<SupportedLocale, Translation> = {
  en: {} as Translation,
};

void incompleteRegistry;
