// https://github.com/logto-io/node-oidc-provider/blob/d60ae9bd6d089e69f3a243119c6d87db25e837ce/lib/helpers/formatters.js
declare module 'oidc-provider/lib/helpers/formatters.js' {
  /** Returns the plural form (`` `${word}s` ``) unless `count` is 1. */
  export function pluralize(word: string, count: number): string;
}
