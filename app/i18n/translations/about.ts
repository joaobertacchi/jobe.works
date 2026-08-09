import type { SupportedLocale } from "../config";

export type AboutTranslation = {
  title: string;
  description: string;
};

export const aboutTranslations = {
  en: {
    title: "About",
    description:
      "A focused starting point that keeps structure, content, and quality checks clear so people and AI agents can build together.",
  },
  "pt-BR": {
    title: "Sobre",
    description:
      "Um ponto de partida objetivo que mantém estrutura, conteúdo e verificações de qualidade claros para pessoas e agentes de IA criarem juntos.",
  },
} satisfies Record<SupportedLocale, AboutTranslation>;
