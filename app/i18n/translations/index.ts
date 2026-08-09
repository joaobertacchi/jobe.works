import type { SupportedLocale } from "../config";
import type { Translation } from "../types";
import { aboutTranslations } from "./about";
import { commonTranslations } from "./common";
import { homeTranslations } from "./home";
import { notFoundTranslations } from "./not-found";
import { privacyTranslations } from "./privacy";
import { servicesTranslations } from "./services";

export const translations = {
  en: {
    common: commonTranslations.en,
    home: homeTranslations.en,
    about: aboutTranslations.en,
    services: servicesTranslations.en,
    notFound: notFoundTranslations.en,
    privacy: privacyTranslations.en,
  },
  "pt-BR": {
    common: commonTranslations["pt-BR"],
    home: homeTranslations["pt-BR"],
    about: aboutTranslations["pt-BR"],
    services: servicesTranslations["pt-BR"],
    notFound: notFoundTranslations["pt-BR"],
    privacy: privacyTranslations["pt-BR"],
  },
} satisfies Record<SupportedLocale, Translation>;
