/* Copied from i18next/index.d.ts */
export type Resource = Record<string, ResourceLanguage>;

export type ResourceLanguage = Record<string, ResourceKey>;

export type ResourceKey = string | Record<string, any>;

/* Copied from react-i18next/ts4.1/index.d.ts */
// Normalize single namespace
type AppendKeys<K1, K2> = `${K1 & string}.${K2 & string}`;
type AppendKeys2<K1, K2> = `${K1 & string}.${Exclude<K2, keyof any[]> & string}`;
type Normalize2<T, K = keyof T> = K extends keyof T
  ? T[K] extends Record<string, any>
    ? T[K] extends readonly any[]
      ? AppendKeys2<K, keyof T[K]> | AppendKeys2<K, Normalize2<T[K]>>
      : AppendKeys<K, keyof T[K]> | AppendKeys<K, Normalize2<T[K]>>
    : never
  : never;
export type Normalize<T> = keyof T | Normalize2<T>;
