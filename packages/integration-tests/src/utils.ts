import type { Response } from 'got';

export const extractCookie = (response: Response) => {
  const { headers } = response;

  return headers['set-cookie']?.join('; ') ?? '';
};

export const generateName = () => crypto.randomUUID();
export const generateUsername = () => `usr_${crypto.randomUUID().replaceAll('-', '_')}`;
export const generatePassword = () => `pwd_${crypto.randomUUID()}`;

export const generateResourceName = () => `res_${crypto.randomUUID()}`;
export const generateResourceIndicator = () => `https://${crypto.randomUUID()}.logto.io`;
export const generateEmail = () => `${crypto.randomUUID().toLowerCase()}@logto.io`;

export const generatePhone = () => {
  const array = new Uint32Array(1);

  return crypto.getRandomValues(array).join('');
};
