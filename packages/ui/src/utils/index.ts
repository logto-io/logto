import { fromUint8Array } from 'js-base64';

export const generateRandomString = (length = 8) =>
  fromUint8Array(crypto.getRandomValues(new Uint8Array(length)), true);

export const parseQueryParameters = (parameters: string | URLSearchParams) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return Object.fromEntries(searchParameters);
};

export const queryStringify = (
  parameters: string | URLSearchParams | Record<string, string | string>
) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return searchParameters.toString();
};

export const getSearchParameters = (parameters: string | URLSearchParams, key: string) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return searchParameters.get(key) ?? undefined;
};

type Entries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

export const entries = <T>(object: T): Entries<T> => Object.entries(object) as Entries<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
export const inOperator = <K extends string, T extends object>(
  key: K,
  object: T
): object is T & Record<K, unknown> => key in object;
