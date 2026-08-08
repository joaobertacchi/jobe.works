import type { SupportedLocale } from "../config";

export type ServicesTranslation = {
  title: string;
  description: string;
};

export const servicesTranslations = {
  en: {
    title: "Services",
    description: "Localized services placeholder.",
  },
  "pt-BR": {
    title: "Serviços",
    description: "Página de serviços localizada de demonstração.",
  },
} satisfies Record<SupportedLocale, ServicesTranslation>;
