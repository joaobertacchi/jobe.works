import en from "./en-US";
import ptBR from "./pt-BR";
import type { Translation } from "./types";

export const translations = {
  en,
  "pt-BR": ptBR,
} satisfies Record<string, Translation>;
