type Plural = {
  zero: string;
  one: string;
  other: string;
};

export type Translation = {
};

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Plural
    ? `${Prefix}${K & string}`
    : T[K] extends Record<string, any>
      ? Paths<T[K], `${Prefix}${K & string}.`>
      : `${Prefix}${K & string}`;
}[keyof T];

export type LocaleScope = Paths<Translation>;
