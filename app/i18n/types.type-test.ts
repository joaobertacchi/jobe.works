import type { SupportedLocale } from "./config";
import type { useI18n } from "./i18n";
import type { Translate, Translation, TranslationScope } from "./types";
import type { HomeTranslation } from "./translations/home";

declare const translate: Translate;
declare const contextTranslate: ReturnType<typeof useI18n>["translate"];

translate("about.title");
translate("home.exampleCount", { count: 3 });

// @ts-expect-error Callers cannot override the provider locale.
translate("about.title", { locale: "pt-BR" });

// @ts-expect-error Callers cannot override strict missing behavior.
translate("about.title", { missingBehavior: "guess" });

// @ts-expect-error Callers cannot provide fallback translation values.
translate("about.title", { defaultValue: "Fallback" });

// @ts-expect-error Invalid translation path.
translate("about.missing");

// @ts-expect-error Plural internals are not public translation paths.
translate("home.exampleCount.zero");

// @ts-expect-error Plural translations require a numeric count.
translate("home.exampleCount");

// @ts-expect-error Context plural translations also require a numeric count.
contextTranslate("home.exampleCount");

const servicesTitle: TranslationScope = "services.title";

// @ts-expect-error Home translations must include every field.
const incompleteHome: HomeTranslation = {
  title: "Home",
  description: "Description",
};

// @ts-expect-error The registry must include every supported locale.
const incompleteRegistry: Record<SupportedLocale, Translation> = {
  en: {} as Translation,
};

void servicesTitle;
void incompleteHome;
void incompleteRegistry;
