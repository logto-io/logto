import { Response } from 'got/dist/source';

export const extractCookie = (response: Response) => {
  const { headers } = response;

  return headers['set-cookie']?.join('; ') ?? '';
};

const randomString = (length = 6) => crypto.randomUUID().slice(0, Math.max(0, length));

export const generateUsername = () => `usr_${randomString().replaceAll('-', '_')}`;
export const generatePassword = () => `pwd_${randomString()}`;

export const generateResourceName = () => `res_${randomString()}`;
export const generateResourceIndicator = () => `https://${randomString()}.logto.io`;
