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
        "AI to Production, Fractional CTO, and AI Adoption: senior engineering to take AI products to production, lead technology, and bring AI into your company safely.",
    },
    title: "Services",
    description:
      "Every engagement starts with an assessment of your product and your context. From there, JOBE recommends the path with the most impact — you don't have to pick from a catalog.",
    items: {
      sprint: {
        title: "AI to Production",
        description:
          "For AI products that gained traction and now need to hold up. JOBE takes the product from proof of concept to production — architecture, integrations, tests, CI/CD, observability, and security — so it can grow without breaking. Includes AI Security Review, to find and fix the risks specific to AI applications, and Mobile App Rescue, to recover and modernize React Native apps that have become fragile or hard to evolve.",
      },
      fractional: {
        title: "Fractional CTO",
        description:
          "Senior technology leadership on a recurring basis, without a full-time hire. JOBE makes architecture decisions with you, shapes the technical roadmap, and structures your team and architecture to grow safely.",
      },
      enablement: {
        title: "AI Adoption",
        description:
          "For companies ready to put AI to work. In engineering, JOBE brings AI agents into the development lifecycle — including spec-driven development — with training, practices, and quality controls. Beyond engineering, it helps other areas of the company adopt AI with security and governance from the start.",
      },
    },
    crossSell: {
      label: "Add-on",
      title: "AI Cost Control",
      description:
        "When LLM spend becomes significant, JOBE helps bring it under control: visibility into where the money goes, model and architecture choices that fit each use, and engineering practices that cut costs without compromising quality. Available alongside any of the services above.",
    },
    funnel: {
      title: "How every engagement starts",
      description:
        "The same path, whatever the problem: a conversation first, evidence next, then execution.",
      steps: {
        call: {
          title: "Initial Assessment",
          description:
            "A structured 30–45 minute conversation based on what you share about your product and context. Free for a limited time. You receive a summary of the risks identified, a first classification of the problem, recommended next steps, and a short scorecard of your product.",
        },
        diagnosis: {
          title: "Technical Diagnostic",
          description:
            "An in-depth, evidence-based review: interviews with founders and team, repository and architecture review, integrations, CI/CD, tests and environments, security, observability, and cloud and AI costs. You receive a detailed scorecard, a diagram of the current architecture, risks ranked by impact and urgency, quick wins, a prioritized backlog, a 30/60/90-day plan, preliminary estimates, and an executive presentation.",
        },
        engagement: {
          title: "Execution",
          description:
            "The main problem defines the path: AI to Production, Fractional CTO, or AI Adoption. After implementation, JOBE can stay on as your fractional CTO, keep enabling your team, and support AI security and governance.",
        },
      },
    },
    closing: {
      title: "Start with a conversation",
      description:
        "Book an Initial Assessment and leave with a clear, honest read of your risks and next steps — free for a limited time, with no commitment.",
      cta: "Book an Initial Assessment",
    },
  },
  "pt-BR": {
    seo: {
      title: "Serviços | JOBE — Engenharia que Funciona",
      description:
        "IA em Produção, CTO sob Demanda e Adoção de IA: engenharia sênior para levar produtos de IA à produção, liderar a tecnologia e trazer a IA para dentro da sua empresa com segurança.",
    },
    title: "Serviços",
    description:
      "Todo trabalho começa com uma avaliação do seu produto e do seu contexto. A partir dela, a JOBE recomenda o caminho de maior impacto — você não precisa escolher em um catálogo.",
    items: {
      sprint: {
        title: "IA em Produção",
        description:
          "Para produtos de IA que ganharam tração e agora precisam se sustentar. A JOBE leva o produto da prova de conceito à produção — arquitetura, integrações, testes, CI/CD, observabilidade e segurança — para que ele cresça sem quebrar. Inclui Segurança para IA, para encontrar e corrigir os riscos específicos de aplicações com IA, e Resgate de Apps Mobile, para recuperar e modernizar apps React Native que ficaram frágeis ou difíceis de evoluir.",
      },
      fractional: {
        title: "CTO sob Demanda",
        description:
          "Liderança técnica sênior de forma recorrente, sem uma contratação em tempo integral. A JOBE toma decisões de arquitetura com você, define o roadmap técnico e estrutura o time e a arquitetura para crescer com segurança.",
      },
      enablement: {
        title: "Adoção de IA",
        description:
          "Para empresas prontas para colocar a IA para trabalhar. Na engenharia, a JOBE leva agentes de IA para o ciclo de desenvolvimento — incluindo desenvolvimento orientado por especificações — com treinamento, práticas e controles de qualidade. Além da engenharia, ajuda outras áreas da empresa a adotar IA com segurança e governança desde o início.",
      },
    },
    crossSell: {
      label: "Complemento",
      title: "Custos de IA sob Controle",
      description:
        "Quando o gasto com LLMs se torna relevante, a JOBE ajuda a colocá-lo sob controle: visibilidade de para onde vai o dinheiro, escolhas de modelo e arquitetura adequadas a cada uso e práticas de engenharia que reduzem custos sem comprometer a qualidade. Disponível junto com qualquer um dos serviços acima.",
    },
    funnel: {
      title: "Como todo trabalho começa",
      description:
        "O mesmo caminho, seja qual for o problema: primeiro uma conversa, depois evidências, então execução.",
      steps: {
        call: {
          title: "Avaliação Inicial",
          description:
            "Uma conversa estruturada de 30–45 minutos, baseada no que você compartilha sobre seu produto e seu contexto. Sem custo por tempo limitado. Você recebe um resumo dos riscos identificados, uma primeira classificação do problema, os próximos passos recomendados e uma avaliação resumida do seu produto.",
        },
        diagnosis: {
          title: "Diagnóstico Técnico",
          description:
            "Uma análise aprofundada e baseada em evidências: entrevistas com founders e time, revisão do repositório e da arquitetura, integrações, CI/CD, testes e ambientes, segurança, observabilidade e custos de cloud e IA. Você recebe uma avaliação detalhada, um diagrama da arquitetura atual, riscos classificados por impacto e urgência, ganhos rápidos, um backlog priorizado, um plano de 30/60/90 dias, estimativas preliminares e uma apresentação executiva.",
        },
        engagement: {
          title: "Execução",
          description:
            "O problema principal define o caminho: IA em Produção, CTO sob Demanda ou Adoção de IA. Depois da implementação, a JOBE pode seguir como seu CTO sob demanda, continuar capacitando seu time e apoiar a segurança e a governança de IA.",
        },
      },
    },
    closing: {
      title: "Comece por uma conversa",
      description:
        "Agende uma Avaliação Inicial e saia com uma leitura clara e honesta dos seus riscos e próximos passos — sem custo por tempo limitado e sem compromisso.",
      cta: "Agendar Avaliação Inicial",
    },
  },
} satisfies Record<SupportedLocale, ServicesTranslation>;
