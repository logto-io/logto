import { assert } from '@silverhand/essentials';

export const generateName = () => crypto.randomUUID();
export const generateUserId = () => crypto.randomUUID();
export const generateUsername = () => `usr_${crypto.randomUUID().replaceAll('-', '_')}`;
export const generatePassword = () => `pwd_${crypto.randomUUID()}`;

export const generateResourceName = () => `res_${crypto.randomUUID()}`;
export const generateResourceIndicator = () => `https://${crypto.randomUUID()}.logto.io`;
export const generateEmail = () => `${crypto.randomUUID().toLowerCase()}@logto.io`;
export const generateScopeName = () => `sc:${crypto.randomUUID()}`;
export const generateRoleName = () => `role_${crypto.randomUUID()}`;

export const generatePhone = () => {
  const array = new Uint32Array(1);

  return crypto.getRandomValues(array).join('');
};

export const waitFor = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getAccessTokenPayload = (accessToken: string): Record<string, unknown> => {
  const payloadPart = accessToken.split('.')[1];
  assert(typeof payloadPart === 'string', new Error('Invalid access token'));
  const payload = Buffer.from(payloadPart, 'base64').toString();

  // eslint-disable-next-line no-restricted-syntax
  return JSON.parse(payload) as Record<string, unknown>;
};
