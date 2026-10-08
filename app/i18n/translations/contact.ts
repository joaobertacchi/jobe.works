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
      title: "Book an Initial Assessment | JOBE — Engineering that Works",
      description:
        "Start with a structured 30–45 minute conversation about your product and your context, free for a limited time. Leave with the main risks, a first classification of the problem, next steps, and a short scorecard.",
    },
    title: "Book an Initial Assessment",
    description:
      "A structured 30–45 minute conversation about your product, what worries you, and your context. It is the first step of every JOBE engagement — and it is free for a limited time.",
    deliverablesTitle: "You leave with",
    deliverables: {
      risks: "A summary of the risks identified",
      classification: "A first classification of the problem",
      nextSteps: "Recommended next steps",
      scorecard: "A short scorecard of your product",
    },
    scorecardPrompt: "Want a head start? Take the Production Readiness Check",
    bookByEmailTitle: "Book by email",
    bookByEmailDescription:
      "Write a short note about your product and your context. JOBE replies by email to schedule your assessment.",
    emailAddress: "contato@jobe.works",
    emailSubject: "Initial Assessment",
    fields: {
      name: "Name",
      email: "Email",
      message: "Message",
    },
    messagePlaceholder:
      "Briefly describe your product, its stage, and what concerns you.",
    submit: "Book the assessment",
    submitting: "Sending...",
    success: "Thanks. JOBE will reply by email to schedule your assessment.",
    error: "We could not send your message. Keep your details and try again.",
    validation: {
      required: "This field is required.",
      email: "Enter a valid email address.",
      summary: "Check the highlighted fields.",
    },
  },
  "pt-BR": {
    seo: {
      title: "Agendar Avaliação Inicial | JOBE — Engenharia que Funciona",
      description:
        "Comece com uma conversa estruturada de 30–45 minutos sobre seu produto e seu contexto, sem custo por tempo limitado. Saia com os principais riscos, uma primeira classificação do problema, próximos passos e uma avaliação resumida.",
    },
    title: "Agendar Avaliação Inicial",
    description:
      "Uma conversa estruturada de 30–45 minutos sobre seu produto, o que preocupa você e seu contexto. É o primeiro passo de todo trabalho da JOBE — e não tem custo por tempo limitado.",
    deliverablesTitle: "Você sai com",
    deliverables: {
      risks: "Um resumo dos riscos identificados",
      classification: "Uma primeira classificação do problema",
      nextSteps: "Próximos passos recomendados",
      scorecard: "Uma avaliação resumida do seu produto",
    },
    scorecardPrompt: "Quer adiantar? Faça a Autoavaliação de Produção",
    bookByEmailTitle: "Agende por e-mail",
    bookByEmailDescription:
      "Escreva uma nota curta sobre seu produto e seu contexto. A JOBE responde por e-mail para agendar sua avaliação.",
    emailAddress: "contato@jobe.works",
    emailSubject: "Avaliação Inicial",
    fields: {
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
    },
    messagePlaceholder:
      "Descreva brevemente seu produto, sua fase e o que o preocupa.",
    submit: "Agendar a avaliação",
    submitting: "Enviando...",
    success:
      "Obrigado. A JOBE responderá por e-mail para agendar sua avaliação.",
    error:
      "Não foi possível enviar sua mensagem. Mantenha seus dados e tente novamente.",
    validation: {
      required: "Este campo é obrigatório.",
      email: "Informe um endereço de e-mail válido.",
      summary: "Verifique os campos destacados.",
    },
  },
} satisfies Record<SupportedLocale, ContactTranslation>;
