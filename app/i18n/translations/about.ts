import type { SupportedLocale } from "../config";

export type AboutTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  sections: {
    name: { title: string; description: string };
    positioning: { title: string; description: string };
    principles: { title: string; description: string };
    principlesList: {
      diagnostic: string;
      evidence: string;
      production: string;
      recurring: string;
    };
  };
  emailLabel: string;
  emailAddress: string;
};

export const aboutTranslations = {
  en: {
    seo: {
      title: "About JOBE | Engineering that Works",
      description:
        "JOBE is the engineering practice of João Bertacchi: senior engineering for AI products that need to work in production and for the business.",
    },
    title: "About JOBE",
    description:
      "JOBE is the engineering practice of João Bertacchi — senior, pragmatic, execution-oriented. It exists for products that gained traction and now need engineering that works in production and for the business.",
    sections: {
      name: {
        title: "The name",
        description:
          "JOBE joins JOão and BErtacchi — with a secondary reading of the word job: the work itself. The tagline carries the same ambiguity: engineering that works, Jobe Works, jobe.works.",
      },
      positioning: {
        title: "Engineering that Works",
        description:
          "Not proofs of concept, technology choices, or code alone: engineering that functions in production and delivers for the business. Every engagement starts with evaluation and evidence, never with a catalog.",
      },
      principles: {
        title: "How JOBE works",
        description: "Four principles shape every engagement:",
      },
      principlesList: {
        diagnostic:
          "Diagnostic first — prospects enter through a conversation or diagnosis, and the solution is directed, never chosen from a menu.",
        evidence:
          "Evidence over claims — the paid diagnosis is grounded in evidence; the initial evaluation is grounded in your reports.",
        production:
          "Production and business outcomes — engineering must work in production and for the business, not stop at proofs of concept.",
        recurring:
          "Recurring relationships — diagnosis and implementation flow into fractional CTO, team enablement, and secure AI and governance.",
      },
    },
    emailLabel: "Work with JOBE",
    emailAddress: "joao@jobe.works",
  },
  "pt-BR": {
    seo: {
      title: "Sobre a JOBE | Engenharia que Funciona",
      description:
        "A JOBE é a prática de engenharia de João Bertacchi: engenharia sênior para produtos de IA que precisam funcionar em produção e para o negócio.",
    },
    title: "Sobre a JOBE",
    description:
      "A JOBE é a prática de engenharia de João Bertacchi — sênior, pragmática e orientada à execução. Existe para produtos que ganharam tração e agora precisam de engenharia que funcione em produção e para o negócio.",
    sections: {
      name: {
        title: "O nome",
        description:
          "JOBE une JOão e BErtacchi — com uma leitura secundária da palavra job: o trabalho em si. O slogan carrega a mesma ambiguidade: engenharia que funciona, Jobe Works, jobe.works.",
      },
      positioning: {
        title: "Engenharia que Funciona",
        description:
          "Não apenas provas de conceito, escolhas de tecnologia ou código: engenharia que funciona em produção e entrega para o negócio. Todo engajamento começa com avaliação e evidência, nunca com um catálogo.",
      },
      principles: {
        title: "Como a JOBE trabalha",
        description: "Quatro princípios moldam todo engajamento:",
      },
      principlesList: {
        diagnostic:
          "Diagnóstico primeiro — prospects entram por uma conversa ou diagnóstico, e a solução é direcionada, nunca escolhida de um menu.",
        evidence:
          "Evidência acima de promessas — o diagnóstico pago é baseado em evidências; a avaliação inicial é baseada nos seus relatos.",
        production:
          "Resultados de produção e de negócio — a engenharia precisa funcionar em produção e para o negócio, não parar em provas de conceito.",
        recurring:
          "Relacionamentos recorrentes — diagnóstico e implementação fluem para fractional CTO, enablement do time e Secure AI e governança.",
      },
    },
    emailLabel: "Trabalhe com a JOBE",
    emailAddress: "joao@jobe.works",
  },
} satisfies Record<SupportedLocale, AboutTranslation>;
