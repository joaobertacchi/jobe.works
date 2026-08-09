import type { SupportedLocale } from "../config";

export type NotFoundTranslation = {
  title: string;
  description: string;
};

export const notFoundTranslations = {
  en: {
    title: "Page not found",
    description:
      "This page may have moved or never existed. Use the navigation to find your way back.",
  },
  "pt-BR": {
    title: "Página não encontrada",
    description:
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
  },
} satisfies Record<SupportedLocale, NotFoundTranslation>;
