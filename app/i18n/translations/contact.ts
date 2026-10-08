import type { SupportedLocale } from "../config";

export type ContactTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  deliverablesTitle: string;
  deliverables: {
    risks: string;
    classification: string;
    nextSteps: string;
    scorecard: string;
  };
  scorecardPrompt: string;
  bookByEmailTitle: string;
  bookByEmailDescription: string;
  emailAddress: string;
  emailSubject: string;
  fields: {
    name: string;
    email: string;
    message: string;
  };
  messagePlaceholder: string;
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

export const contactTranslations = {
  en: {
    seo: {
      title: "Book a Product Readiness Call | JOBE — Engineering that Works",
      description:
        "Start with a structured 30–45 minute conversation about your product and your context. Leave with a summary of perceived risks, a preliminary classification, next steps, and a mini-scorecard.",
    },
    title: "Book a Product Readiness Call",
    description:
      "A structured 30–45 minute conversation about your product, your symptoms, and your context — based on what you tell us. It is the first step of every engagement.",
    deliverablesTitle: "You leave with",
    deliverables: {
      risks: "A summary of perceived risks",
      classification: "A preliminary problem classification",
      nextSteps: "Recommended next steps",
      scorecard: "A mini-scorecard for your product",
    },
    scorecardPrompt: "Want a head start? Take the Product Readiness Scorecard",
    bookByEmailTitle: "Book by email",
    bookByEmailDescription:
      "Write a short note about your product and your context, and JOBE will reply by email to schedule your call.",
    emailAddress: "joao@jobe.works",
    emailSubject: "Product Readiness Call",
    fields: {
      name: "Name",
      email: "Email",
      message: "Message",
    },
    messagePlaceholder:
      "Briefly describe your product, its stage, and what concerns you.",
    submit: "Book the call",
    submitting: "Sending...",
    success: "Thanks. We will reply by email to schedule your call.",
    error: "We could not send your message. Keep your details and try again.",
    validation: {
      required: "This field is required.",
      email: "Enter a valid email address.",
      summary: "Check the highlighted fields.",
    },
  },
  "pt-BR": {
    seo: {
      title:
        "Agendar uma Product Readiness Call | JOBE — Engenharia que Funciona",
      description:
        "Comece com uma conversa estruturada de 30–45 minutos sobre seu produto e seu contexto. Saia com um resumo dos riscos percebidos, uma classificação preliminar, próximos passos e um mini-scorecard.",
    },
    title: "Agendar uma Product Readiness Call",
    description:
      "Uma conversa estruturada de 30–45 minutos sobre seu produto, seus sintomas e seu contexto — baseada no que você nos conta. É o primeiro passo de todo engajamento.",
    deliverablesTitle: "Você sai com",
    deliverables: {
      risks: "Um resumo dos riscos percebidos",
      classification: "Uma classificação preliminar do problema",
      nextSteps: "Próximos passos recomendados",
      scorecard: "Um mini-scorecard do seu produto",
    },
    scorecardPrompt: "Quer adiantar? Faça o Product Readiness Scorecard",
    bookByEmailTitle: "Agende por e-mail",
    bookByEmailDescription:
      "Escreva uma nota curta sobre seu produto e seu contexto, e a JOBE responderá por e-mail para agendar sua conversa.",
    emailAddress: "joao@jobe.works",
    emailSubject: "Product Readiness Call",
    fields: {
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
    },
    messagePlaceholder:
      "Descreva brevemente seu produto, sua fase e o que o preocupa.",
    submit: "Agendar a conversa",
    submitting: "Enviando...",
    success: "Obrigado. Responderemos por e-mail para agendar sua conversa.",
    error:
      "Não foi possível enviar sua mensagem. Mantenha seus dados e tente novamente.",
    validation: {
      required: "Este campo é obrigatório.",
      email: "Informe um endereço de e-mail válido.",
      summary: "Verifique os campos destacados.",
    },
  },
} satisfies Record<SupportedLocale, ContactTranslation>;
