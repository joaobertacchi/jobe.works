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
        body: "When you accept analytics, the site loads PostHog (PostHog Inc., cloud hosted in the United States, which involves an international data transfer) and sends it page views and specific interactions: call-to-action and email-link clicks, language changes, scorecard progress and aggregate result, and contact-form submission outcomes. PostHog stores a random visitor identifier in a cookie and in this browser's local storage, and receives technical request data such as IP address, browser, and device. Page URLs are sent without query parameters other than the allowlisted campaign parameters. No session recordings, automatic click capture, scorecard answers, or form contents are sent. Withdrawing consent stops collection immediately.",
      },
      marketing: {
        title: "Advertising and marketing technologies",
        body: "Marketing consent is separate from analytics. Accepting analytics does not enable advertising technologies.",
      },
      attribution: {
        title: "Campaign attribution",
        body: "Only explicitly allowlisted campaign parameters (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) may be used. The site keeps them in memory for the current visit; with analytics consent, they are also sent to PostHog with your events. No arbitrary URL parameters are collected.",
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
        body: "Quando você aceita analytics, o site carrega o PostHog (PostHog Inc., nuvem hospedada nos Estados Unidos, o que envolve transferência internacional de dados) e envia a ele visualizações de página e interações específicas: cliques em chamadas para ação e em links de e-mail, troca de idioma, progresso e resultado agregado do scorecard e o resultado de envios do formulário de contato. O PostHog armazena um identificador aleatório de visitante em um cookie e no armazenamento local deste navegador, e recebe dados técnicos de requisição como endereço IP, navegador e dispositivo. As URLs das páginas são enviadas sem parâmetros de consulta além dos parâmetros de campanha permitidos. Não são enviadas gravações de sessão, captura automática de cliques, respostas do scorecard nem conteúdo de formulários. Retirar o consentimento interrompe a coleta imediatamente.",
      },
      marketing: {
        title: "Tecnologias de publicidade e marketing",
        body: "O consentimento de marketing é separado do de analytics. Aceitar analytics não habilita tecnologias de publicidade.",
      },
      attribution: {
        title: "Atribuição de campanhas",
        body: "Apenas parâmetros de campanha explicitamente permitidos (utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content) podem ser usados. O site os mantém em memória na visita atual; com o consentimento de analytics, eles também são enviados ao PostHog junto com seus eventos. Nenhum parâmetro arbitrário de URL é coletado.",
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
