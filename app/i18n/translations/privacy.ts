import type { SupportedLocale } from "../config";

export type PrivacyTranslation = {
  seo: { title: string; description: string };
  title: string;
  introduction: string;
  sections: {
    data: { title: string; body: string };
    purpose: { title: string; body: string };
    storage: { title: string; body: string };
    rights: { title: string; body: string };
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
      rights: {
        title: "Suas escolhas",
        body: "Os responsáveis pelo site devem substituir este exemplo por contatos e procedimentos compatíveis com suas obrigações legais e práticas reais de tratamento de dados.",
      },
    },
  },
} satisfies Record<SupportedLocale, PrivacyTranslation>;
