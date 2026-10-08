import type { SupportedLocale } from "../config";
import type { Translation } from "../types";
import { aboutTranslations } from "./about";
import { caseTranslations } from "./case";
import { commonTranslations } from "./common";
import { consentTranslations } from "./consent";
import { contactTranslations } from "./contact";
import { homeTranslations } from "./home";
import { notFoundTranslations } from "./not-found";
import { privacyTranslations } from "./privacy";
import { scorecardTranslations } from "./scorecard";
import { servicesTranslations } from "./services";

export const translations = {
  en: {
    common: commonTranslations.en,
    consent: consentTranslations.en,
    home: homeTranslations.en,
    about: aboutTranslations.en,
    services: servicesTranslations.en,
    case: caseTranslations.en,
    scorecard: scorecardTranslations.en,
    contact: contactTranslations.en,
    notFound: notFoundTranslations.en,
    privacy: privacyTranslations.en,
  },
  "pt-BR": {
    common: commonTranslations["pt-BR"],
    consent: consentTranslations["pt-BR"],
    home: homeTranslations["pt-BR"],
    about: aboutTranslations["pt-BR"],
    services: servicesTranslations["pt-BR"],
    case: caseTranslations["pt-BR"],
    scorecard: scorecardTranslations["pt-BR"],
    contact: contactTranslations["pt-BR"],
    notFound: notFoundTranslations["pt-BR"],
    privacy: privacyTranslations["pt-BR"],
  },
} satisfies Record<SupportedLocale, Translation>;
