import type { SupportedLocale } from "../config";

export type AboutTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  sections: {
    boundaries: { title: string; description: string };
    examples: { title: string; description: string };
  };
};

export const aboutTranslations = {
  en: {
    seo: {
      title: "About the Static Website Template",
      description:
        "Learn how this agent-ready template keeps architecture, localization, components, and quality checks explicit and easy to evolve.",
    },
    title: "About",
    description:
      "A focused starting point that keeps structure, content, and quality checks clear so people and AI agents can build together.",
    sections: {
      boundaries: {
        title: "Clear boundaries",
        description:
          "Static output, locale-prefixed routes, typed content, and explicit integrations keep architectural choices visible instead of hiding them behind framework magic.",
      },
      examples: {
        title: "Working examples",
        description:
          "Representative routes and components serve as local training material, showing future agents where content belongs and how each layer composes.",
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "Sobre o Modelo de Site Estático",
      description:
        "Conheça como este modelo preparado para agentes mantém arquitetura, localização, componentes e qualidade explícitos e fáceis de evoluir.",
    },
    title: "Sobre",
    description:
      "Um ponto de partida objetivo que mantém estrutura, conteúdo e verificações de qualidade claros para pessoas e agentes de IA criarem juntos.",
    sections: {
      boundaries: {
        title: "Limites claros",
        description:
          "Saída estática, rotas com idioma, conteúdo tipado e integrações explícitas mantêm as decisões arquiteturais visíveis em vez de escondê-las na mágica do framework.",
      },
      examples: {
        title: "Exemplos funcionais",
        description:
          "Rotas e componentes representativos servem como material local de treinamento, mostrando a futuros agentes onde o conteúdo pertence e como cada camada se compõe.",
      },
    },
  },
} satisfies Record<SupportedLocale, AboutTranslation>;
