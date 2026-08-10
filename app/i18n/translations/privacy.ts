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
      title: "Privacy Notice | Agent-ready Static Sites",
      description:
        "Read the generic privacy posture demonstrated by this static website template and learn what each fork must document for its own integrations.",
    },
    title: "Privacy notice",
    introduction:
      "This example explains the privacy posture of the base static template. Adapt it to the services and processing activities used by your site.",
    formNotice: {
      body: "We use the information provided to respond to your inquiry. See our Privacy Notice for more information.",
      marketingOptIn: "I would like to receive occasional updates and offers.",
    },
    sections: {
      data: {
        title: "Data handled by the template",
        body: "The base template does not send personal data to a project-owned backend. Browser and hosting infrastructure may still process technical request data according to their own configuration.",
      },
      purpose: {
        title: "Added integrations",
        body: "A fork that adds analytics, forms, marketing tools, or other providers must document what data is collected, why it is needed, and who receives it.",
      },
      storage: {
        title: "Local preferences",
        body: "The theme control may store an explicit light or dark preference in this browser. The language remains represented by the URL and is not persisted separately.",
      },
      consent: {
        title: "Consent choices",
        body: "The site stores your consent choice for analytics and marketing technologies in this browser, versioned so a change in practices can request a new choice. Replace this text with your fork-specific explanation.",
      },
      cookies: {
        title: "Cookies and similar technologies",
        body: "Non-essential analytics and marketing technologies are disabled until you accept them. You can change your choice at any time from the Cookie settings control in the footer.",
      },
      analytics: {
        title: "Analytics",
        body: "When analytics consent is given, the site may measure how pages are used. Document the analytics providers and what they receive in your fork.",
      },
      marketing: {
        title: "Advertising and marketing technologies",
        body: "Marketing consent is separate from analytics. Accepting analytics does not enable advertising technologies. Document marketing providers and purposes in your fork.",
      },
      attribution: {
        title: "Campaign attribution",
        body: "Only explicitly allowlisted campaign parameters (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) may be used, kept in memory for the current visit and never persisted. No arbitrary URL parameters are collected.",
      },
      contactForms: {
        title: "Contact forms",
        body: "Forms collect only what is needed to respond to your request. Consent to optional promotional communication is always separate from submitting the form and never preselected.",
      },
      rights: {
        title: "Your choices",
        body: "Site owners must replace this example with contact details and procedures that match their actual legal obligations and data practices.",
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "Aviso de Privacidade | Sites Estáticos para Agentes",
      description:
        "Conheça a postura genérica de privacidade demonstrada por este modelo de site estático e o que cada fork deve documentar sobre suas integrações.",
    },
    title: "Aviso de privacidade",
    introduction:
      "Este exemplo explica a postura de privacidade do modelo estático base. Adapte-o aos serviços e às atividades de tratamento usados pelo seu site.",
    formNotice: {
      body: "Usamos as informações fornecidas para responder à sua solicitação. Consulte o Aviso de Privacidade para mais informações.",
      marketingOptIn: "Gostaria de receber atualizações e ofertas ocasionais.",
    },
    sections: {
      data: {
        title: "Dados tratados pelo modelo",
        body: "O modelo base não envia dados pessoais para um backend próprio do projeto. O navegador e a infraestrutura de hospedagem ainda podem tratar dados técnicos de requisição conforme suas configurações.",
      },
      purpose: {
        title: "Integrações adicionadas",
        body: "Um fork que adicione analytics, formulários, ferramentas de marketing ou outros provedores deve informar quais dados são coletados, por que são necessários e quem os recebe.",
      },
      storage: {
        title: "Preferências locais",
        body: "O controle de tema pode armazenar neste navegador uma preferência explícita por tema claro ou escuro. O idioma permanece representado pela URL e não é persistido separadamente.",
      },
      consent: {
        title: "Escolhas de consentimento",
        body: "O site armazena neste navegador sua escolha de consentimento para tecnologias de analytics e marketing, com versão, para que uma mudança de práticas possa solicitar nova escolha. Substitua este texto pela explicação específica do seu fork.",
      },
      cookies: {
        title: "Cookies e tecnologias semelhantes",
        body: "Tecnologias não essenciais de analytics e marketing permanecem desabilitadas até que você as aceite. Você pode alterar sua escolha a qualquer momento pelo controle de Configurações de cookies no rodapé.",
      },
      analytics: {
        title: "Analytics",
        body: "Com o consentimento de analytics, o site pode medir como as páginas são usadas. Documente no seu fork os provedores de analytics e o que eles recebem.",
      },
      marketing: {
        title: "Tecnologias de publicidade e marketing",
        body: "O consentimento de marketing é separado do de analytics. Aceitar analytics não habilita tecnologias de publicidade. Documente no seu fork os provedores de marketing e suas finalidades.",
      },
      attribution: {
        title: "Atribuição de campanhas",
        body: "Apenas parâmetros de campanha explicitamente permitidos (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) podem ser usados, mantidos em memória na visita atual e nunca persistidos. Nenhum parâmetro arbitrário de URL é coletado.",
      },
      contactForms: {
        title: "Formulários de contato",
        body: "Formulários coletam apenas o necessário para responder à sua solicitação. O consentimento para comunicação promocional opcional é sempre separado do envio do formulário e nunca pré-selecionado.",
      },
      rights: {
        title: "Suas escolhas",
        body: "Os responsáveis pelo site devem substituir este exemplo por contatos e procedimentos compatíveis com suas obrigações legais e práticas reais de tratamento de dados.",
      },
    },
  },
} satisfies Record<SupportedLocale, PrivacyTranslation>;
