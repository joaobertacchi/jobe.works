import type { SupportedLocale } from "../config";

export type CommonTranslation = {
  navigation: {
    home: string;
    about: string;
    services: string;
  };
};

export const commonTranslations = {
  en: {
    navigation: { home: "Home", about: "About", services: "Services" },
  },
  "pt-BR": {
    navigation: { home: "Início", about: "Sobre", services: "Serviços" },
  },
} satisfies Record<SupportedLocale, CommonTranslation>;
