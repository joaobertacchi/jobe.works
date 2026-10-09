import type { SupportedLocale } from "../config";

export type PrivacySection = { title: string; body: string };

export type PrivacyTranslation = {
  seo: { title: string; description: string };
  title: string;
  introduction: string;
  formNotice: {
    body: string;
    marketingOptIn: string;
  };
  sections: {
    data: PrivacySection;
    purpose: PrivacySection;
    storage: PrivacySection;
    rights: PrivacySection;
    consent: PrivacySection;
    cookies: PrivacySection;
    analytics: PrivacySection;
    marketing: PrivacySection;
    attribution: PrivacySection;
    contactForms: PrivacySection;
  };
};

export const privacyTranslations = {
  en: {
    seo: {
      title: "Privacy Notice | JOBE — Engineering that Works",
      description:
        "How jobe.works handles personal data: local preferences, consent choices, campaign attribution, and the information you send by email.",
    },
    title: "Privacy notice",
    introduction:
      "This notice explains how jobe.works handles personal data. It is kept explicit and minimal: no project-owned backend, no arbitrary tracking, and consent before any non-essential technology.",
    formNotice: {
      body: "We use the information provided to respond to your inquiry. See the Privacy Notice for more information.",
      marketingOptIn: "I would like to receive occasional updates and offers.",
    },
    sections: {
      data: {
        title: "Data handled by this site",
        body: "This site does not send personal data to a project-owned backend. Browser and hosting infrastructure may still process technical request data according to their own configuration.",
      },
      purpose: {
        title: "Email contact",
        body: "The site invites inquiries by email at contato@jobe.works, used to respond to your inquiry and, when relevant, to schedule an Initial Assessment. No form on this site collects your name, email address, or message into a site-owned system.",
      },
      storage: {
        title: "Local preferences",
        body: "The theme control may store an explicit light or dark preference in this browser. The site also stores the language of the last page you visited, so returning to jobe.works opens in that language.",
      },
      consent: {
        title: "Consent choices",
        body: "The site stores your consent choice for analytics and marketing technologies in this browser, versioned so a change in practices can request a new choice.",
      },
      cookies: {
        title: "Cookies and similar technologies",
        body: "Non-essential analytics and marketing technologies are disabled until you accept them. You can change your choice at any time from the Cookie settings control in the footer.",
      },
      analytics: {
        title: "Analytics",
        body: "When analytics consent is given, the site may measure how pages are used. The analytics providers and what they receive are documented here when an integration is configured.",
      },
      marketing: {
        title: "Advertising and marketing technologies",
        body: "Marketing consent is separate from analytics. Accepting analytics does not enable advertising technologies.",
      },
      attribution: {
        title: "Campaign attribution",
        body: "Only explicitly allowlisted campaign parameters (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) may be used, kept in memory for the current visit and never persisted. No arbitrary URL parameters are collected.",
      },
      contactForms: {
        title: "Contact by email",
        body: "Emailing JOBE is voluntary; only the information you include is used, to respond to your inquiry. The site offers no promotional consent checkbox and maintains no marketing list.",
      },
      rights: {
        title: "Your choices",
        body: "You can change or withdraw your consent choices at any time using the Cookie settings control in the footer. To exercise your data rights, write to contato@jobe.works.",
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "Aviso de Privacidade | JOBE — Engenharia que Funciona",
      description:
        "Como o jobe.works trata dados pessoais: preferências locais, escolhas de consentimento, atribuição de campanhas e as informações que você envia por e-mail.",
    },
    title: "Aviso de privacidade",
    introduction:
      "Este aviso explica como o jobe.works trata dados pessoais. Ele é mantido explícito e mínimo: sem backend próprio, sem rastreamento arbitrário e com consentimento antes de qualquer tecnologia não essencial.",
    formNotice: {
      body: "Usamos as informações fornecidas para responder à sua solicitação. Consulte o Aviso de Privacidade para mais informações.",
      marketingOptIn: "Gostaria de receber atualizações e ofertas ocasionais.",
    },
    sections: {
      data: {
        title: "Dados tratados por este site",
        body: "Este site não envia dados pessoais a um backend próprio do projeto. O navegador e a infraestrutura de hospedagem ainda podem tratar dados técnicos de requisição conforme suas configurações.",
      },
      purpose: {
        title: "Contato por e-mail",
        body: "O site convida a contatos por e-mail em contato@jobe.works, usados para responder à sua solicitação e, quando relevante, agendar uma Avaliação Inicial. Nenhum formulário deste site coleta seu nome, e-mail ou mensagem em um sistema próprio.",
      },
      storage: {
        title: "Preferências locais",
        body: "O controle de tema pode armazenar neste navegador uma preferência explícita por tema claro ou escuro. O site também armazena o idioma da última página visitada, para que jobe.works volte a abrir nesse idioma.",
      },
      consent: {
        title: "Escolhas de consentimento",
        body: "O site armazena neste navegador sua escolha de consentimento para tecnologias de analytics e marketing, com versão, para que uma mudança de práticas possa solicitar nova escolha.",
      },
      cookies: {
        title: "Cookies e tecnologias semelhantes",
        body: "Tecnologias não essenciais de analytics e marketing permanecem desabilitadas até que você as aceite. Você pode alterar sua escolha a qualquer momento pelo controle de Configurações de cookies no rodapé.",
      },
      analytics: {
        title: "Analytics",
        body: "Com o consentimento de analytics, o site pode medir como as páginas são usadas. Os provedores de analytics e o que recebem serão documentados aqui quando uma integração for configurada.",
      },
      marketing: {
        title: "Tecnologias de publicidade e marketing",
        body: "O consentimento de marketing é separado do de analytics. Aceitar analytics não habilita tecnologias de publicidade.",
      },
      attribution: {
        title: "Atribuição de campanhas",
        body: "Apenas parâmetros de campanha explicitamente permitidos (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) podem ser usados, mantidos em memória na visita atual e nunca persistidos. Nenhum parâmetro arbitrário de URL é coletado.",
      },
      contactForms: {
        title: "Contato por e-mail",
        body: "Enviar e-mail à JOBE é voluntário; apenas as informações que você incluir são usadas, para responder à sua solicitação. O site não oferece caixa de consentimento promocional e não mantém lista de marketing.",
      },
      rights: {
        title: "Suas escolhas",
        body: "Você pode alterar ou retirar suas escolhas de consentimento a qualquer momento pelo controle de Configurações de cookies no rodapé. Para exercer seus direitos sobre dados, escreva para contato@jobe.works.",
      },
    },
  },
} satisfies Record<SupportedLocale, PrivacyTranslation>;
