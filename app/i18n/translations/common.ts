import type { SupportedLocale } from "../config";

export type CommonTranslation = {
  siteName: string;
  navigationLabel: string;
  languageSwitcherLabel: string;
  selectingLanguage: string;
  footer: {
    navigationLabel: string;
    description: string;
  };
  errors: {
    title: string;
    unexpectedTitle: string;
    unexpectedDescription: string;
  };
  navigation: {
    home: string;
    about: string;
    services: string;
    privacy: string;
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
    footer: {
      navigationLabel: "Footer navigation",
      description:
        "A static foundation designed to be understood and replaced.",
    },
    errors: {
      title: "Error",
      unexpectedTitle: "Something went wrong",
      unexpectedDescription: "An unexpected error occurred.",
    },
    navigation: {
      home: "Home",
      about: "About",
      services: "Services",
      privacy: "Privacy",
    },
    theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
  },
  "pt-BR": {
    siteName: "Sites prontos para agentes",
    navigationLabel: "Navegação principal",
    languageSwitcherLabel: "Escolher idioma",
    selectingLanguage: "Selecionando idioma",
    footer: {
      navigationLabel: "Navegação do rodapé",
      description:
        "Uma base estática criada para ser compreendida e substituída.",
    },
    errors: {
      title: "Erro",
      unexpectedTitle: "Algo deu errado",
      unexpectedDescription: "Ocorreu um erro inesperado.",
    },
    navigation: {
      home: "Início",
      about: "Sobre",
      services: "Serviços",
      privacy: "Privacidade",
    },
    theme: { label: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  },
} satisfies Record<SupportedLocale, CommonTranslation>;
