import type { SupportedLocale } from "../config";

export type ConsentTranslation = {
  banner: {
    label: string;
    message: string;
    acceptAll: string;
    rejectNonEssential: string;
    customize: string;
  };
  dialog: {
    title: string;
    description: string;
    necessary: string;
    necessaryDescription: string;
    analytics: string;
    analyticsDescription: string;
    marketing: string;
    marketingDescription: string;
    save: string;
    cancel: string;
  };
  cookieSettings: string;
};

export const consentTranslations = {
  en: {
    banner: {
      label: "Cookie preferences",
      message:
        "We use cookies and similar technologies to understand how the site is used and, with your consent, to measure campaigns. You can accept all, reject non-essential technologies, or customize your choices.",
      acceptAll: "Accept all",
      rejectNonEssential: "Reject non-essential",
      customize: "Customize",
    },
    dialog: {
      title: "Cookie settings",
      description:
        "Choose which categories of technologies you allow. Necessary technologies always stay enabled.",
      necessary: "Necessary",
      necessaryDescription: "Required for the website to work.",
      analytics: "Analytics",
      analyticsDescription: "Helps us understand how the site is used.",
      marketing: "Marketing",
      marketingDescription: "Used to measure and personalize advertising.",
      save: "Save preferences",
      cancel: "Cancel",
    },
    cookieSettings: "Cookie settings",
  },
  "pt-BR": {
    banner: {
      label: "Preferências de cookies",
      message:
        "Usamos cookies e tecnologias semelhantes para entender como o site é usado e, com seu consentimento, medir campanhas. Você pode aceitar tudo, recusar tecnologias não essenciais ou personalizar suas escolhas.",
      acceptAll: "Aceitar tudo",
      rejectNonEssential: "Recusar não essenciais",
      customize: "Personalizar",
    },
    dialog: {
      title: "Configurações de cookies",
      description:
        "Escolha quais categorias de tecnologias você permite. As tecnologias necessárias permanecem sempre habilitadas.",
      necessary: "Necessárias",
      necessaryDescription: "Exigidas para o funcionamento do site.",
      analytics: "Analytics",
      analyticsDescription: "Ajuda a entender como o site é usado.",
      marketing: "Marketing",
      marketingDescription: "Usada para medir e personalizar anúncios.",
      save: "Salvar preferências",
      cancel: "Cancelar",
    },
    cookieSettings: "Configurações de cookies",
  },
} satisfies Record<SupportedLocale, ConsentTranslation>;
