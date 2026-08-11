import type { SupportedLocale } from "../config";

export type ServicesTranslation = {
  seo: {
    title: string;
    description: string;
  };
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
  closing: {
    title: string;
    description: string;
  };
  contact: {
    title: string;
    description: string;
    fields: {
      name: string;
      email: string;
      message: string;
    };
    submit: string;
    submitting: string;
    success: string;
    error: string;
    validation: {
      required: string;
      email: string;
      summary: string;
    };
  };
};

export const servicesTranslations = {
  en: {
    seo: {
      title: "Static Website Foundation Services",
      description:
        "Explore the reusable foundation, typed localization, and deterministic delivery patterns demonstrated by this static website template.",
    },
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
    closing: {
      title: "A foundation, not a platform",
      description:
        "These examples stay intentionally small so each fork can establish its own content and visual system.",
    },
    contact: {
      title: "Tell us about your project",
      description:
        "This example keeps form state, privacy, attribution, analytics, and the provider boundary visible in one small flow.",
      fields: {
        name: "Name",
        email: "Email",
        message: "Message",
      },
      submit: "Send inquiry",
      submitting: "Sending...",
      success: "Thanks. We will be in touch soon.",
      error: "We could not send your inquiry. Keep your details and try again.",
      validation: {
        required: "This field is required.",
        email: "Enter a valid email address.",
        summary: "Check the highlighted fields.",
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "Serviços de Base para Sites Estáticos",
      description:
        "Explore a base reutilizável, a localização tipada e os padrões de entrega determinística demonstrados por este modelo de site estático.",
    },
    title: "Serviços",
    description:
      "Tudo o que é necessário para transformar uma ideia clara em um site rápido e duradouro.",
    items: {
      foundation: {
        title: "Base",
        description:
          "Rotas pré-renderizadas, contratos tipados e validações objetivas mantêm cada página simples de evoluir.",
      },
      localization: {
        title: "Localização",
        description:
          "Dicionários completos e URLs explícitas mantêm o conteúdo consistente em todos os idiomas.",
      },
      delivery: {
        title: "Entrega",
        description:
          "Verificações de qualidade e pré-renderização tornam as entregas confiáveis e previsíveis.",
      },
    },
    closing: {
      title: "Uma base, não uma plataforma",
      description:
        "Estes exemplos permanecem intencionalmente pequenos para que cada fork estabeleça seu próprio conteúdo e sistema visual.",
    },
    contact: {
      title: "Fale sobre seu projeto",
      description:
        "Este exemplo mantém estado do formulário, privacidade, atribuição, analytics e o limite do provedor visíveis em um fluxo pequeno.",
      fields: {
        name: "Nome",
        email: "E-mail",
        message: "Mensagem",
      },
      submit: "Enviar solicitação",
      submitting: "Enviando...",
      success: "Obrigado. Entraremos em contato em breve.",
      error:
        "Não foi possível enviar sua solicitação. Mantenha seus dados e tente novamente.",
      validation: {
        required: "Este campo é obrigatório.",
        email: "Informe um endereço de e-mail válido.",
        summary: "Verifique os campos destacados.",
      },
    },
  },
} satisfies Record<SupportedLocale, ServicesTranslation>;
