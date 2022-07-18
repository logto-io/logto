import { fromUint8Array } from 'js-base64';

export const generateRandomString = (length = 8) =>
  fromUint8Array(crypto.getRandomValues(new Uint8Array(length)), true);

export const parseQueryParameters = (parameters: string | URLSearchParams) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return Object.fromEntries(
    [...searchParameters.entries()].map(([key, value]) => [key, decodeURIComponent(value)])
  );
};

export const queryStringify = (parameters: URLSearchParams | Record<string, string>) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return searchParameters.toString();
};

export const getSearchParameters = (parameters: string | URLSearchParams, key: string) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return searchParameters.get(key) ?? undefined;
};

export type Entries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

// eslint-disable-next-line no-restricted-syntax
export const entries = <T>(object: T): Entries<T> => Object.entries(object) as Entries<T>;

// @ts-expect-error Object.fromEntries does not return a indexable keyof T types, it always return string key type. Force to return the given generic object type.
// eslint-disable-next-line no-restricted-syntax
export const fromEntries = <T>(entries: Entries<T>) => Object.fromEntries(entries) as T;

export const isKeyOf = <T extends Record<string, unknown>>(
  key: string | number | symbol,
  object: T
): key is keyof T => key in object;
