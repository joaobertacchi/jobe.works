import type { SupportedLocale } from "../config";

export type NotFoundTranslation = {
  title: string;
  description: string;
};

export const notFoundTranslations = {
  en: {
    title: "Page not found",
    description: "The requested page does not exist.",
  },
  "pt-BR": {
    title: "Página não encontrada",
    description: "A página solicitada não existe.",
  },
} satisfies Record<SupportedLocale, NotFoundTranslation>;
