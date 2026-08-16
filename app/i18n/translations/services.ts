import type { SupportedLocale } from "../config";

export type ServicesTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  items: {
    sprint: {
      title: string;
      description: string;
    };
    fractional: {
      title: string;
      description: string;
    };
    enablement: {
      title: string;
      description: string;
    };
  };
  crossSell: {
    label: string;
    title: string;
    description: string;
  };
  funnel: {
    title: string;
    description: string;
    steps: {
      call: { title: string; description: string };
      diagnosis: { title: string; description: string };
      engagement: { title: string; description: string };
    };
  };
  closing: {
    title: string;
    description: string;
    cta: string;
  };
};

export const servicesTranslations = {
  en: {
    seo: {
      title: "Services | JOBE — Engineering that Works",
      description:
        "AI Productization Sprint, Fractional CTO & Architecture, and AI-Native SDLC & Engineering Enablement — entered through a Product Readiness Call and a paid diagnosis.",
    },
    title: "Services",
    description:
      "JOBE's work is a progression: content or referral, an initial technical evaluation, a paid diagnosis, then a directed offer. The dominant problem decides the engagement — you never choose among eight services.",
    items: {
      sprint: {
        title: "AI Productization Sprint",
        description:
          "Resolves the most urgent, highest-perceived-value problem: turning a product that gained traction into something safe, scalable, and sustainable. A security lens is embedded, with a mobile-specific variant when applicable — including React Native rescue and modernization.",
      },
      fractional: {
        title: "Fractional CTO & Architecture",
        description:
          "Recurring senior technology direction: architecture decisions, roadmaps, and engineering judgment without a full-time hire. Typically generates the implementation projects that follow.",
      },
      enablement: {
        title: "AI-Native SDLC & Engineering Enablement",
        description:
          "Consulting, training, and practice adoption so teams use AI tools across the development lifecycle safely and productively — with Secure AI and governance as part of the practice.",
      },
    },
    crossSell: {
      label: "Cross-sell",
      title: "AI Engineering Economics",
      description:
        "For clients with relevant LLM spend: engineering and economic control of AI costs. Offered as a natural cross-sell, never a fourth entry door — the message stays focused.",
    },
    funnel: {
      title: "How the engagement starts",
      description:
        "Every engagement follows the same sequence. The diagnosis is paid and evidence-based; the structured call is the first step.",
      steps: {
        call: {
          title: "Product Readiness Call",
          description:
            "A structured 30–45 minute conversation based on your reports. You receive a summary of perceived risks, a preliminary problem classification, next steps, and a mini-scorecard.",
        },
        diagnosis: {
          title: "Paid diagnosis",
          description:
            "Interviews, repository access, architecture review, integration analysis, CI/CD and environment inspection, security analysis, observability evaluation, cloud and AI cost analysis, and risk identification. You receive a detailed scorecard, an architecture diagram, prioritized risks, quick wins, a backlog, a 30/60/90-day plan, preliminary estimates, and an executive presentation.",
        },
        engagement: {
          title: "Directed offer",
          description:
            "The dominant problem picks the offer, and implementation follows — with fractional CTO, team enablement, and secure AI and governance as the recurring layer.",
        },
      },
    },
    closing: {
      title: "Start with a conversation",
      description:
        "Book a Product Readiness Call and leave with a clear, honest read on your risks and next steps — no catalog, no pressure.",
      cta: "Book a Product Readiness Call",
    },
  },
  "pt-BR": {
    seo: {
      title: "Serviços | JOBE — Engenharia que Funciona",
      description:
        "AI Productization Sprint, Fractional CTO & Arquitetura e SDLC Nativo em IA & Enablement de Engenharia — acessados por uma Product Readiness Call e um diagnóstico pago.",
    },
    title: "Serviços",
    description:
      "O trabalho da JOBE é uma progressão: conteúdo ou indicação, avaliação técnica inicial, diagnóstico pago e, então, uma oferta direcionada. O problema dominante decide o engajamento — você nunca escolhe entre oito serviços.",
    items: {
      sprint: {
        title: "AI Productization Sprint",
        description:
          "Resolve o problema mais urgente e de maior valor percebido: transformar um produto que ganhou tração em algo seguro, escalável e sustentável. Uma lente de segurança vem embutida, com variante mobile quando aplicável — incluindo resgate e modernização de React Native.",
      },
      fractional: {
        title: "Fractional CTO & Arquitetura",
        description:
          "Direção sênior recorrente de tecnologia: decisões de arquitetura, roadmaps e julgamento de engenharia sem uma contratação integral. Normalmente origina os projetos de implementação que vêm depois.",
      },
      enablement: {
        title: "SDLC Nativo em IA & Enablement de Engenharia",
        description:
          "Consultoria, treinamento e adoção de práticas para que times usem ferramentas de IA em todo o ciclo de desenvolvimento com segurança e produtividade — com Secure AI e governança como parte da prática.",
      },
    },
    crossSell: {
      label: "Venda cruzada",
      title: "AI Engineering Economics",
      description:
        "Para clientes com gasto relevante de LLM: controle de engenharia e econômico dos custos de IA. Oferecida como venda cruzada natural, nunca como quarta porta de entrada — a mensagem permanece focada.",
    },
    funnel: {
      title: "Como o engajamento começa",
      description:
        "Todo engajamento segue a mesma sequência. O diagnóstico é pago e baseado em evidências; a conversa estruturada é o primeiro passo.",
      steps: {
        call: {
          title: "Product Readiness Call",
          description:
            "Uma conversa estruturada de 30–45 minutos baseada nos seus relatos. Você recebe um resumo dos riscos percebidos, uma classificação preliminar do problema, próximos passos e um mini-scorecard.",
        },
        diagnosis: {
          title: "Diagnóstico pago",
          description:
            "Entrevistas, acesso ao repositório, revisão de arquitetura, análise de integrações, inspeção de CI/CD e ambientes, análise de segurança, avaliação de observabilidade, análise de custos de cloud e IA e identificação de riscos. Você recebe um scorecard detalhado, um diagrama da arquitetura, riscos priorizados, quick wins, um backlog, um plano de 30/60/90 dias, estimativas preliminares e uma apresentação executiva.",
        },
        engagement: {
          title: "Oferta direcionada",
          description:
            "O problema dominante escolhe a oferta, e a implementação vem em seguida — com fractional CTO, enablement do time e Secure AI e governança como a camada recorrente.",
        },
      },
    },
    closing: {
      title: "Comece por uma conversa",
      description:
        "Agende uma Product Readiness Call e saia com uma leitura clara e honesta dos seus riscos e próximos passos — sem catálogo, sem pressão.",
      cta: "Agendar uma Product Readiness Call",
    },
  },
} satisfies Record<SupportedLocale, ServicesTranslation>;
