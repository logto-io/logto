import { Response } from 'got/dist/source';

export const extractCookie = (response: Response) => {
  const { headers } = response;

  return headers['set-cookie']?.join('; ') ?? '';
};

export const generateUsername = () => `usr-${crypto.randomUUID()}`;
export const generatePassword = () => `pwd-${crypto.randomUUID()}`;
