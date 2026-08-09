import type { SupportedLocale } from "../config";

export type CommonTranslation = {
  siteName: string;
  navigationLabel: string;
  languageSwitcherLabel: string;
  navigation: {
    home: string;
    about: string;
    services: string;
  };
  theme: {
    label: string;
    light: string;
    dark: string;
    system: string;
  };
};

export const commonTranslations = {
  en: {
    siteName: "Agent-ready sites",
    navigationLabel: "Primary navigation",
    languageSwitcherLabel: "Choose language",
    navigation: { home: "Home", about: "About", services: "Services" },
    theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
  },
  "pt-BR": {
    siteName: "Sites prontos para agentes",
    navigationLabel: "Navegação principal",
    languageSwitcherLabel: "Escolher idioma",
    navigation: { home: "Início", about: "Sobre", services: "Serviços" },
    theme: { label: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  },
} satisfies Record<SupportedLocale, CommonTranslation>;
