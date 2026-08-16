import type { SupportedLocale } from "../config";

export type CaseTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  introduction: string;
  methodTitle: string;
  methodDescription: string;
  pendingTitle: string;
  pendingDescription: string;
  steps: {
    situation: { title: string; description: string };
    diagnosis: { title: string; description: string };
    engagement: { title: string; description: string };
    outcome: { title: string; description: string };
  };
};

export const caseTranslations = {
  en: {
    seo: {
      title: "StockCast Case Study | JOBE — Engineering that Works",
      description:
        "The StockCast case: a product that gained traction, and the diagnostic-first engineering that makes it work in production.",
    },
    title: "StockCast",
    introduction:
      "JOBE's work with StockCast is a real engagement and a primary reference. This page will present the story end to end — the situation, the diagnosis, the directed engagement, and the outcome — using the same diagnostic-first method every JOBE client experiences.",
    methodTitle: "The method behind the case",
    methodDescription:
      "No service catalog, no guesswork: a structured call to understand the context, an evidence-based diagnosis of the dominant problem, then a directed engagement. That sequence is what this case study documents.",
    pendingTitle: "Case material pending",
    pendingDescription:
      "The owner is finalizing the case material: the product story, the diagnosis findings, the chosen engagement, and the results. Until then, the sections below keep their placeholders instead of inventing numbers or outcomes.",
    steps: {
      situation: {
        title: "The situation",
        description:
          "The product gained traction — and with it, the production risks that traction exposes. Details pending owner material.",
      },
      diagnosis: {
        title: "The diagnosis",
        description:
          "An evidence-based look at architecture, integrations, security, observability, and costs, ending in a prioritized roadmap. Findings pending owner material.",
      },
      engagement: {
        title: "The engagement",
        description:
          "The dominant problem directed the offer. Which engagement was chosen, and how it was delivered, pending owner material.",
      },
      outcome: {
        title: "The outcome",
        description:
          "What changed in production, for the team, and for the business. Metrics and results pending owner material.",
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "Estudo de Caso StockCast | JOBE — Engenharia que Funciona",
      description:
        "O caso StockCast: um produto que ganhou tração e a engenharia de diagnóstico primeiro que o faz funcionar em produção.",
    },
    title: "StockCast",
    introduction:
      "O trabalho da JOBE com a StockCast é um engajamento real e uma referência primária. Esta página vai apresentar a história de ponta a ponta — a situação, o diagnóstico, o engajamento direcionado e o resultado — usando o mesmo método de diagnóstico primeiro que todo cliente da JOBE vivencia.",
    methodTitle: "O método por trás do caso",
    methodDescription:
      "Sem catálogo de serviços, sem adivinhação: uma conversa estruturada para entender o contexto, um diagnóstico baseado em evidências do problema dominante e, então, um engajamento direcionado. É essa sequência que este estudo de caso documenta.",
    pendingTitle: "Material do caso pendente",
    pendingDescription:
      "O responsável está finalizando o material do caso: a história do produto, os achados do diagnóstico, o engajamento escolhido e os resultados. Até lá, as seções abaixo mantêm seus placeholders em vez de inventar números ou resultados.",
    steps: {
      situation: {
        title: "A situação",
        description:
          "O produto ganhou tração — e com ela, os riscos de produção que a tração expõe. Detalhes pendentes de material do responsável.",
      },
      diagnosis: {
        title: "O diagnóstico",
        description:
          "Um olhar baseado em evidências sobre arquitetura, integrações, segurança, observabilidade e custos, terminando em um roadmap priorizado. Achados pendentes de material do responsável.",
      },
      engagement: {
        title: "O engajamento",
        description:
          "O problema dominante direcionou a oferta. Qual engajamento foi escolhido e como foi entregue: pendente de material do responsável.",
      },
      outcome: {
        title: "O resultado",
        description:
          "O que mudou em produção, para o time e para o negócio. Métricas e resultados pendentes de material do responsável.",
      },
    },
  },
} satisfies Record<SupportedLocale, CaseTranslation>;
