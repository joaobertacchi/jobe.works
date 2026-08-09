import type { SupportedLocale } from "../config";

export type ServicesTranslation = {
  title: string;
  description: string;
  items: {
    foundation: {
      title: string;
      description: string;
    };
    localization: {
      title: string;
      description: string;
    };
    delivery: {
      title: string;
      description: string;
    };
  };
};

export const servicesTranslations = {
  en: {
    title: "Services",
    description:
      "Everything needed to turn a clear idea into a fast, durable website.",
    items: {
      foundation: {
        title: "Foundation",
        description:
          "Composable React patterns and a static-first architecture keep each page easy to understand and evolve.",
      },
      localization: {
        title: "Localization",
        description:
          "Typed dictionaries keep every supported language complete, consistent, and ready to publish.",
      },
      delivery: {
        title: "Delivery",
        description:
          "Built-in quality checks and prerendering make confident releases routine.",
      },
    },
  },
  "pt-BR": {
    title: "Serviços",
    description:
      "Tudo o que é necessário para transformar uma ideia clara em um site rápido e duradouro.",
    items: {
      foundation: {
        title: "Base",
        description:
          "Padrões React combináveis e uma arquitetura estática mantêm cada página fácil de entender e evoluir.",
      },
      localization: {
        title: "Localização",
        description:
          "Dicionários tipados mantêm cada idioma completo, consistente e pronto para publicação.",
      },
      delivery: {
        title: "Entrega",
        description:
          "Verificações de qualidade e pré-renderização tornam lançamentos seguros parte da rotina.",
      },
    },
  },
} satisfies Record<SupportedLocale, ServicesTranslation>;
