import type { AboutTranslation } from "./translations/about";
import type { CommonTranslation } from "./translations/common";
import type { HomeTranslation } from "./translations/home";
import type { NotFoundTranslation } from "./translations/not-found";
import type { ServicesTranslation } from "./translations/services";

export type Translation = {
  common: CommonTranslation;
  home: HomeTranslation;
  about: AboutTranslation;
  services: ServicesTranslation;
  notFound: NotFoundTranslation;
};

export type Plural = {
  zero: string;
  one: string;
  other: string;
};

type PlainPaths<T> = {
  [Key in keyof T & string]: T[Key] extends Plural
    ? never
    : T[Key] extends string
      ? Key
      : T[Key] extends Record<string, unknown>
        ? `${Key}.${PlainPaths<T[Key]>}`
        : never;
}[keyof T & string];

type PluralPaths<T> = {
  [Key in keyof T & string]: T[Key] extends Plural
    ? Key
    : T[Key] extends Record<string, unknown>
      ? `${Key}.${PluralPaths<T[Key]>}`
      : never;
}[keyof T & string];

export type PlainTranslationScope = PlainPaths<Translation>;
export type PluralTranslationScope = PluralPaths<Translation>;
export type TranslationScope = PlainTranslationScope | PluralTranslationScope;
export type TranslationOptions = {
  count?: number;
  defaultValue?: never;
  defaults?: never;
  locale?: never;
  missingBehavior?: never;
  scope?: never;
};

export type Translate = {
  (scope: PlainTranslationScope, options?: TranslationOptions): string;
  (
    scope: PluralTranslationScope,
    options: TranslationOptions & { count: number },
  ): string;
};
