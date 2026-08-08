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

type Paths<T> = {
  [Key in keyof T & string]: T[Key] extends string
    ? Key
    : T[Key] extends Record<string, unknown>
      ? `${Key}.${Paths<T[Key]>}`
      : never;
}[keyof T & string];

export type TranslationScope = Paths<Translation>;
