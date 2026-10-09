import type { SupportedLocale } from "../config";

export type CommonTranslation = {
  siteName: string;
  tagline: string;
  navigationLabel: string;
  languageSwitcherLabel: string;
  footer: {
    navigationLabel: string;
    description: string;
    email: string;
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
    case: string;
    contact: string;
    scorecard: string;
    book: string;
    privacy: string;
    skipToContent: string;
  };
  theme: {
    label: string;
    light: string;
    dark: string;
  };
};

export const commonTranslations = {
  en: {
    siteName: "JOBE",
    tagline: "Engineering that Works",
    navigationLabel: "Primary navigation",
    languageSwitcherLabel: "Choose language",
    footer: {
      navigationLabel: "Footer navigation",
      description:
        "Engineering that works — in production, and for the business.",
      email: "contato@jobe.works",
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
      case: "Case study",
      contact: "Contact",
      scorecard: "Readiness Check",
      book: "Book an assessment",
      privacy: "Privacy",
      skipToContent: "Skip to content",
    },
    theme: { label: "Theme", light: "Light", dark: "Dark" },
  },
  "pt-BR": {
    siteName: "JOBE",
    tagline: "Engenharia que Funciona",
    navigationLabel: "Navegação principal",
    languageSwitcherLabel: "Escolher idioma",
    footer: {
      navigationLabel: "Navegação do rodapé",
      description: "Engenharia que funciona — em produção, e para o negócio.",
      email: "contato@jobe.works",
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
      case: "Estudo de caso",
      contact: "Contato",
      scorecard: "Autoavaliação",
      book: "Agendar avaliação",
      privacy: "Privacidade",
      skipToContent: "Pular para o conteúdo",
    },
    theme: { label: "Tema", light: "Claro", dark: "Escuro" },
  },
} satisfies Record<SupportedLocale, CommonTranslation>;
