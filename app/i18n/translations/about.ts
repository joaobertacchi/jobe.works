import type { SupportedLocale } from "../config";

export type AboutTranslation = {
  title: string;
  description: string;
};

export const aboutTranslations = {
  en: {
    title: "About",
    description: "Localized about placeholder.",
  },
  "pt-BR": {
    title: "Sobre",
    description: "Página sobre localizada de demonstração.",
  },
} satisfies Record<SupportedLocale, AboutTranslation>;
