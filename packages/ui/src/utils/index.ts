import { fromUint8Array } from 'js-base64';

export const generateRandomString = (length = 16) =>
  fromUint8Array(crypto.getRandomValues(new Uint8Array(length)), true);
