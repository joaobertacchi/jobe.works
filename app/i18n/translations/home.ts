import type { SupportedLocale } from "../config";

export type HomeTranslation = {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    description: string;
    method: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  atlas: {
    founderName: string;
    founderStatement: string;
    topologyTitle: string;
    topologyDescription: string;
    diagnosis: string;
    evidenceStatus: string;
    labels: {
      context: string;
      product: string;
      architecture: string;
      integrations: string;
      security: string;
      observability: string;
      production: string;
    };
  };
  services: {
    title: string;
    description: string;
    items: {
      sprint: { title: string; description: string };
      fractional: { title: string; description: string };
      enablement: { title: string; description: string };
    };
    link: string;
  };
  case: {
    label: string;
    title: string;
    description: string;
    link: string;
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
};

export const homeTranslations = {
  en: {
    seo: {
      title: "JOBE — Engineering that Works",
      description:
        "Senior engineering for AI products that gained traction and need to become safe, scalable, and sustainable in production. Diagnostic-first: a Product Readiness Call, a paid diagnosis, a directed offer.",
    },
    hero: {
      title: "Engineering that Works",
      description:
        "JOBE is a senior engineering consultancy for AI products that gained traction and need to hold up in production. You start with a conversation, not a catalog: a structured evaluation that directs you to the right engagement.",
      method: "One route: evaluate, diagnose, direct.",
      ctaPrimary: "Book a Product Readiness Call",
      ctaSecondary: "See the StockCast case",
    },
    atlas: {
      founderName: "João Bertacchi",
      founderStatement: "Evaluate first. Direct the right engagement second.",
      topologyTitle: "A product system routed through diagnosis",
      topologyDescription:
        "A systems map connects product context, architecture, integrations, security, and observability to a diagnosis and a production outcome.",
      diagnosis: "Diagnosis",
      evidenceStatus: "Evidence preview pending real case material",
      labels: {
        context: "Context",
        product: "Product",
        architecture: "Architecture",
        integrations: "Integrations",
        security: "Security",
        observability: "Observability",
        production: "Production",
      },
    },
    services: {
      title: "Services",
      description: "Three offers, one method: evaluate first, then direct.",
      items: {
        sprint: {
          title: "AI Productization Sprint",
          description:
            "Turn a product that gained traction into something safe, scalable, and sustainable — with a security lens built in.",
        },
        fractional: {
          title: "Fractional CTO & Architecture",
          description:
            "Senior architecture and technology direction on a recurring basis, usually the origin of implementation projects.",
        },
        enablement: {
          title: "AI-Native SDLC & Engineering Enablement",
          description:
            "Consulting, training, and practice adoption for the safe, productive use of AI tools across the engineering lifecycle.",
        },
      },
      link: "Explore services",
    },
    case: {
      label: "Case study",
      title: "StockCast",
      description:
        "The diagnostic-first method in practice: a product that gained traction, and the engineering needed to make it work in production.",
      link: "Read the case study",
    },
    funnel: {
      title: "How it works",
      description:
        "You never choose among services — the evaluation directs the engagement.",
      steps: {
        call: {
          title: "Product Readiness Call",
          description:
            "A structured 30–45 minute conversation about your context and symptoms. You leave with a summary of perceived risks, a preliminary classification, and next steps.",
        },
        diagnosis: {
          title: "Diagnosis",
          description:
            "When there is a commercial next step, an evidence-based diagnosis maps architecture, integrations, security, observability, cloud and AI costs, and risks — with a prioritized roadmap.",
        },
        engagement: {
          title: "Directed engagement",
          description:
            "The dominant problem picks the offer: a sprint, fractional CTO, or team enablement — then implementation and recurring support.",
        },
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "JOBE — Engenharia que Funciona",
      description:
        "Engenharia sênior para produtos de IA que ganharam tração e precisam se tornar seguros, escaláveis e sustentáveis em produção. Diagnóstico primeiro: uma Product Readiness Call, um diagnóstico pago, uma oferta direcionada.",
    },
    hero: {
      title: "Engenharia que Funciona",
      description:
        "        A JOBE é uma consultoria de engenharia sênior para produtos de IA que ganharam tração e precisam se sustentar em produção. Você começa por uma conversa, não por um catálogo: uma avaliação estruturada que direciona o engajamento certo.",
      method: "Uma rota: avaliar, diagnosticar, direcionar.",
      ctaPrimary: "Agendar uma Product Readiness Call",
      ctaSecondary: "Conhecer o caso StockCast",
    },
    atlas: {
      founderName: "João Bertacchi",
      founderStatement:
        "Avaliar primeiro. Direcionar o engajamento certo depois.",
      topologyTitle: "Um sistema de produto direcionado pelo diagnóstico",
      topologyDescription:
        "Um mapa de sistemas conecta contexto, produto, arquitetura, integrações, segurança e observabilidade a um diagnóstico e a um resultado em produção.",
      diagnosis: "Diagnóstico",
      evidenceStatus: "Prévia de evidências pendente de material real do caso",
      labels: {
        context: "Contexto",
        product: "Produto",
        architecture: "Arquitetura",
        integrations: "Integrações",
        security: "Segurança",
        observability: "Observabilidade",
        production: "Produção",
      },
    },
    services: {
      title: "Serviços",
      description:
        "Três ofertas, um método: avaliar primeiro, direcionar depois.",
      items: {
        sprint: {
          title: "AI Productization Sprint",
          description:
            "Transformar um produto que ganhou tração em algo seguro, escalável e sustentável — com uma lente de segurança embutida.",
        },
        fractional: {
          title: "Fractional CTO & Arquitetura",
          description:
            "Direção sênior de arquitetura e tecnologia de forma recorrente, normalmente a origem de projetos de implementação.",
        },
        enablement: {
          title: "SDLC Nativo em IA & Enablement de Engenharia",
          description:
            "Consultoria, treinamento e adoção de práticas para o uso seguro e produtivo de ferramentas de IA em todo o ciclo de engenharia.",
        },
      },
      link: "Conhecer serviços",
    },
    case: {
      label: "Estudo de caso",
      title: "StockCast",
      description:
        "O método de diagnóstico primeiro na prática: um produto que ganhou tração e a engenharia necessária para fazê-lo funcionar em produção.",
      link: "Ler o estudo de caso",
    },
    funnel: {
      title: "Como funciona",
      description:
        "Você nunca escolhe entre serviços — a avaliação direciona o engajamento.",
      steps: {
        call: {
          title: "Product Readiness Call",
          description:
            "Uma conversa estruturada de 30–45 minutos sobre seu contexto e seus sintomas. Você sai com um resumo dos riscos percebidos, uma classificação preliminar e próximos passos.",
        },
        diagnosis: {
          title: "Diagnóstico",
          description:
            "Quando há um próximo passo comercial, um diagnóstico baseado em evidências mapeia arquitetura, integrações, segurança, observabilidade, custos de cloud e IA e riscos — com um roadmap priorizado.",
        },
        engagement: {
          title: "Engajamento direcionado",
          description:
            "O problema dominante escolhe a oferta: um sprint, fractional CTO ou enablement do time — depois, implementação e suporte recorrente.",
        },
      },
    },
  },
} satisfies Record<SupportedLocale, HomeTranslation>;
