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
    scorecardPrompt: string;
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
        "JOBE takes AI products from proof of concept to production, rescues mobile apps, and helps companies adopt AI safely. Senior engineering for founders whose products need to hold up for real users and for the business.",
    },
    hero: {
      title: "Engineering that Works",
      description:
        "Your AI product gained traction — or your company is ready to put AI to work. JOBE brings the senior engineering to make it secure, scalable, and sustainable in production, for real users and for the business.",
      method: "Assess. Diagnose. Deliver.",
      ctaPrimary: "Book an Initial Assessment",
      ctaSecondary: "Take the Production Readiness Check",
    },
    atlas: {
      founderName: "João Bertacchi",
      founderStatement:
        "Founder. 20+ years taking products to production, leading teams of 50+ engineers and delivering critical applications for global brands.",
      topologyTitle: "From product context to production",
      topologyDescription:
        "A systems map connects product context, architecture, integrations, security, and observability to a diagnostic and a production outcome.",
      diagnosis: "Diagnostic",
      evidenceStatus: "What the Technical Diagnostic covers",
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
      description: "Three ways to make engineering work for your business.",
      items: {
        sprint: {
          title: "AI to Production",
          description:
            "Your AI product gained traction. JOBE makes it secure, scalable, and sustainable — with AI Security Review and Mobile App Rescue when you need them.",
        },
        fractional: {
          title: "Fractional CTO",
          description:
            "Senior technology leadership without a full-time hire: architecture decisions, technical roadmap, and direction for your team.",
        },
        enablement: {
          title: "AI Adoption",
          description:
            "Bring AI into your engineering team — and beyond — with practices, training, and governance that keep it safe and productive.",
        },
      },
      link: "See all services",
    },
    case: {
      label: "Case study",
      title: "StockCast",
      description:
        "A platform for Brazilian stock market investors with 9,000+ downloads: mobile app, backend, and an AI financial-analysis pipeline running in production.",
      link: "Read the case study",
    },
    funnel: {
      title: "How it works",
      description:
        "You don't need to know upfront which service you need. The assessment points the way.",
      scorecardPrompt:
        "Not ready to talk? Take the 4-minute Production Readiness Check",
      steps: {
        call: {
          title: "Initial Assessment",
          description:
            "A structured 30–45 minute conversation about your product and what worries you. Free for a limited time. You leave with the main risks, a first read of the problem, and recommended next steps.",
        },
        diagnosis: {
          title: "Technical Diagnostic",
          description:
            "An in-depth, evidence-based review of code, architecture, integrations, security, operations, and cloud and AI costs — delivered as prioritized risks, quick wins, and a 30/60/90-day plan.",
        },
        engagement: {
          title: "Execution",
          description:
            "JOBE executes the plan — AI to Production, Fractional CTO, or AI Adoption — and stays alongside as your product grows.",
        },
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "JOBE — Engenharia que Funciona",
      description:
        "A JOBE leva produtos de IA da prova de conceito à produção, resgata apps mobile e ajuda empresas a adotar IA com segurança. Engenharia sênior para founders cujos produtos precisam se sustentar para usuários reais e para o negócio.",
    },
    hero: {
      title: "Engenharia que Funciona",
      description:
        "Seu produto de IA ganhou tração — ou sua empresa está pronta para colocar a IA para trabalhar. A JOBE traz a engenharia sênior para torná-lo seguro, escalável e sustentável em produção, para usuários reais e para o negócio.",
      method: "Avaliar. Diagnosticar. Entregar.",
      ctaPrimary: "Agendar Avaliação Inicial",
      ctaSecondary: "Fazer a Autoavaliação de Produção",
    },
    atlas: {
      founderName: "João Bertacchi",
      founderStatement:
        "Fundador. Mais de 20 anos levando produtos à produção, liderando times de mais de 50 engenheiros e entregando aplicações críticas para marcas globais.",
      topologyTitle: "Do contexto do produto à produção",
      topologyDescription:
        "Um mapa de sistemas conecta contexto, produto, arquitetura, integrações, segurança e observabilidade a um diagnóstico e a um resultado em produção.",
      diagnosis: "Diagnóstico",
      evidenceStatus: "O que o Diagnóstico Técnico avalia",
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
        "Três frentes para a engenharia trabalhar a favor do seu negócio.",
      items: {
        sprint: {
          title: "IA em Produção",
          description:
            "Seu produto de IA ganhou tração. A JOBE o torna seguro, escalável e sustentável — com Segurança para IA e Resgate de Apps Mobile quando você precisar.",
        },
        fractional: {
          title: "CTO sob Demanda",
          description:
            "Liderança técnica sênior sem uma contratação em tempo integral: decisões de arquitetura, roadmap técnico e direção para o seu time.",
        },
        enablement: {
          title: "Adoção de IA",
          description:
            "Leve a IA para o time de engenharia — e para outras áreas da empresa — com práticas, treinamento e governança que mantêm o uso seguro e produtivo.",
        },
      },
      link: "Ver serviços",
    },
    case: {
      label: "Estudo de caso",
      title: "StockCast",
      description:
        "Plataforma para investidores da B3 com mais de 9 mil downloads: app mobile, backend e um pipeline de análise financeira com IA rodando em produção.",
      link: "Ler o estudo de caso",
    },
    funnel: {
      title: "Como funciona",
      description:
        "Você não precisa saber de antemão qual serviço contratar. A avaliação aponta o caminho.",
      scorecardPrompt:
        "Ainda não é hora de conversar? Faça a Autoavaliação de Produção em 4 minutos",
      steps: {
        call: {
          title: "Avaliação Inicial",
          description:
            "Uma conversa estruturada de 30–45 minutos sobre seu produto e o que preocupa você. Sem custo por tempo limitado. Você sai com os principais riscos, uma primeira leitura do problema e os próximos passos recomendados.",
        },
        diagnosis: {
          title: "Diagnóstico Técnico",
          description:
            "Uma análise aprofundada e baseada em evidências de código, arquitetura, integrações, segurança, operação e custos de cloud e IA — entregue como riscos priorizados, ganhos rápidos e um plano de 30/60/90 dias.",
        },
        engagement: {
          title: "Execução",
          description:
            "A JOBE executa o plano — IA em Produção, CTO sob Demanda ou Adoção de IA — e segue junto enquanto seu produto cresce.",
        },
      },
    },
  },
} satisfies Record<SupportedLocale, HomeTranslation>;
