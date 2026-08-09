import type { SupportedLocale } from "../config";
import type { Plural } from "../types";

export type HomeTranslation = {
  seo: {
    title: string;
    description: string;
  };
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  principles: {
    title: string;
    static: { title: string; description: string };
    localization: { title: string; description: string };
    quality: { title: string; description: string };
  };
  greeting: string;
  exampleCount: Plural;
};

export const homeTranslations = {
  en: {
    seo: {
      title: "Static Website Template for AI-Assisted Teams",
      description:
        "Build fast, localized, production-ready static websites with typed content, reusable React components, and deterministic validation.",
    },
    eyebrow: "Built for agents, ready for people",
    title: "Static website template",
    description:
      "A thoughtful static foundation for AI-assisted teams to shape, localize, and ship with confidence.",
    cta: "Explore the examples",
    principles: {
      title: "Built-in clarity",
      static: {
        title: "Static delivery",
        description:
          "Every published route becomes portable HTML, CSS, and JavaScript with no application server required.",
      },
      localization: {
        title: "Typed localization",
        description:
          "Page-scoped dictionaries keep English and Brazilian Portuguese content complete and explicit.",
      },
      quality: {
        title: "Deterministic quality",
        description:
          "One validation command checks types, tests, coverage, builds, routes, links, and SEO artifacts.",
      },
    },
    greeting: "Hello, %{name}",
    exampleCount: {
      zero: "No examples",
      one: "One example",
      other: "%{count} examples",
    },
  },
  "pt-BR": {
    seo: {
      title: "Modelo de Site Estático para Equipes com IA",
      description:
        "Crie sites estáticos rápidos, localizados e prontos para produção com conteúdo tipado, componentes React reutilizáveis e validação determinística.",
    },
    eyebrow: "Feito para agentes, pronto para pessoas",
    title: "Modelo de site estático",
    description:
      "Uma base estática bem estruturada para equipes que desenvolvem com apoio de IA, com decisões explícitas e validação confiável.",
    cta: "Explore os exemplos",
    principles: {
      title: "Clareza integrada",
      static: {
        title: "Entrega estática",
        description:
          "Cada rota publicada se torna HTML, CSS e JavaScript portáveis, sem exigir um servidor de aplicação.",
      },
      localization: {
        title: "Localização tipada",
        description:
          "Dicionários por página mantêm o conteúdo em inglês e português do Brasil completo e explícito.",
      },
      quality: {
        title: "Qualidade determinística",
        description:
          "Um comando de validação verifica tipos, testes, cobertura, build, rotas, links e artefatos de SEO.",
      },
    },
    greeting: "Olá, %{name}",
    exampleCount: {
      zero: "Nenhum exemplo",
      one: "Um exemplo",
      other: "%{count} exemplos",
    },
  },
} satisfies Record<SupportedLocale, HomeTranslation>;
