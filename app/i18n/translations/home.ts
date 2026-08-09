import type { SupportedLocale } from "../config";
import type { Plural } from "../types";

export type HomeTranslation = {
  eyebrow: string;
  title: string;
  description: string;
  greeting: string;
  exampleCount: Plural;
};

export const homeTranslations = {
  en: {
    eyebrow: "Built for agents, ready for people",
    title: "Static website template",
    description:
      "A thoughtful static foundation for AI-assisted teams to shape, localize, and ship with confidence.",
    greeting: "Hello, %{name}",
    exampleCount: {
      zero: "No examples",
      one: "One example",
      other: "%{count} examples",
    },
  },
  "pt-BR": {
    eyebrow: "Feito para agentes, pronto para pessoas",
    title: "Modelo de site estático",
    description:
      "Uma base estática bem estruturada para equipes que desenvolvem com apoio de IA, com decisões explícitas e validação confiável.",
    greeting: "Olá, %{name}",
    exampleCount: {
      zero: "Nenhum exemplo",
      one: "Um exemplo",
      other: "%{count} exemplos",
    },
  },
} satisfies Record<SupportedLocale, HomeTranslation>;
