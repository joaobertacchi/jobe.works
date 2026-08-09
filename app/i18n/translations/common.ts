import type { SupportedLocale } from "../config";

export type CommonTranslation = {
  siteName: string;
  navigationLabel: string;
  languageSwitcherLabel: string;
  selectingLanguage: string;
  errors: {
    title: string;
    unexpectedTitle: string;
    unexpectedDescription: string;
  };
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
    selectingLanguage: "Selecting language",
    errors: {
      title: "Error",
      unexpectedTitle: "Something went wrong",
      unexpectedDescription: "An unexpected error occurred.",
    },
    navigation: { home: "Home", about: "About", services: "Services" },
    theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
  },
  "pt-BR": {
    siteName: "Sites prontos para agentes",
    navigationLabel: "Navegação principal",
    languageSwitcherLabel: "Escolher idioma",
    selectingLanguage: "Selecionando idioma",
    errors: {
      title: "Erro",
      unexpectedTitle: "Algo deu errado",
      unexpectedDescription: "Ocorreu um erro inesperado.",
    },
    navigation: { home: "Início", about: "Sobre", services: "Serviços" },
    theme: { label: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  },
} satisfies Record<SupportedLocale, CommonTranslation>;
