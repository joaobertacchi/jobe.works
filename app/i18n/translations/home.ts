import type { SupportedLocale } from "../config";
import type { Plural } from "../types";

export type HomeTranslation = {
  title: string;
  description: string;
  greeting: string;
  exampleCount: Plural;
};

export const homeTranslations = {
  en: {
    title: "Static website template",
    description: "Localized home placeholder.",
    greeting: "Hello, %{name}",
    exampleCount: {
      zero: "No examples",
      one: "One example",
      other: "%{count} examples",
    },
  },
  "pt-BR": {
    title: "Modelo de site estático",
    description: "Página inicial localizada de demonstração.",
    greeting: "Olá, %{name}",
    exampleCount: {
      zero: "Nenhum exemplo",
      one: "Um exemplo",
      other: "%{count} exemplos",
    },
  },
} satisfies Record<SupportedLocale, HomeTranslation>;
