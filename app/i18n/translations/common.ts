import type { SupportedLocale } from "../config";

export type CommonTranslation = {
  languageSwitcherLabel: string;
  navigation: {
    home: string;
    about: string;
    services: string;
  };
};

export const commonTranslations = {
  en: {
    languageSwitcherLabel: "Choose language",
    navigation: { home: "Home", about: "About", services: "Services" },
  },
  "pt-BR": {
    languageSwitcherLabel: "Escolher idioma",
    navigation: { home: "Início", about: "Sobre", services: "Serviços" },
  },
} satisfies Record<SupportedLocale, CommonTranslation>;
