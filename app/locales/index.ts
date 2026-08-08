// import { I18n, TranslateOptions } from 'i18n-js';

import en from './en-US';
import ptBR from './pt-BR';
import { LocaleScope, Translation } from './types';

// export const i18n = new I18n({
//   ...ptBR,
//   ...en,
// });

const translations = {
  en,
  'pt-BR': ptBR,
} satisfies Record<LocaleScope, Translation>;

// export const translate = (
//   scope: LocaleScope,
//   options?: TranslateOptions,
// ): string => i18n.t(scope, options);
