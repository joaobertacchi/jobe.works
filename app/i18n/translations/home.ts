import type { SupportedLocale } from "../config";

export type HomeTranslation = {
  title: string;
  description: string;
};

export const homeTranslations = {
  en: {
    title: "Static website template",
    description: "Localized home placeholder.",
  },
  "pt-BR": {
    title: "Modelo de site estático",
    description: "Página inicial localizada de demonstração.",
  },
} satisfies Record<SupportedLocale, HomeTranslation>;
