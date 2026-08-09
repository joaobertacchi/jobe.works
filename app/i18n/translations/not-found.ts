import type { SupportedLocale } from "../config";

export type NotFoundTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  homeLink: string;
};

export const notFoundTranslations = {
  en: {
    seo: {
      title: "Page Not Found",
      description:
        "The requested page is not published. Return to a localized page using the site navigation.",
    },
    title: "Page not found",
    description:
      "This page may have moved or never existed. Use the navigation to find your way back.",
    homeLink: "Return home",
  },
  "pt-BR": {
    seo: {
      title: "Página Não Encontrada",
      description:
        "A página solicitada não está publicada. Retorne a uma página localizada usando a navegação do site.",
    },
    title: "Página não encontrada",
    description:
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    homeLink: "Voltar ao início",
  },
} satisfies Record<SupportedLocale, NotFoundTranslation>;
