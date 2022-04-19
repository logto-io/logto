import { fromUint8Array } from 'js-base64';

export const generateRandomString = (length = 8) =>
  fromUint8Array(crypto.getRandomValues(new Uint8Array(length)), true);

export const parseQueryParameters = (parameters: string | URLSearchParams) => {
  const searchParameters =
    parameters instanceof URLSearchParams ? parameters : new URLSearchParams(parameters);

  return Object.fromEntries(searchParameters.entries());
};
