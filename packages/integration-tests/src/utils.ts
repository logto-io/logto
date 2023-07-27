import crypto from 'node:crypto';
import path from 'node:path';

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
export const generateDomain = () => `${crypto.randomUUID().toLowerCase().slice(0, 5)}.example.com`;

export const generatePhone = (isE164?: boolean) => {
  const plus = isE164 ? '+' : '';
  const countryAndAreaCode = '1310'; // California, US
  const validCentralOfficeCodes = [
    '205',
    '208',
    '215',
    '216',
    '220',
    '228',
    '229',
    '230',
    '231',
    '232',
  ];
  const centralOfficeCode =
    validCentralOfficeCodes[Math.floor(Math.random() * validCentralOfficeCodes.length)] ?? '205';
  const phoneNumber = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0');

  return plus + countryAndAreaCode + centralOfficeCode + phoneNumber;
};

export const formatPhoneNumberToInternational = (phoneNumber: string) =>
  phoneNumber.slice(0, 2) +
  ' ' +
  phoneNumber.slice(2, 5) +
  ' ' +
  phoneNumber.slice(5, 8) +
  ' ' +
  phoneNumber.slice(8);

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

export const appendPathname = (pathname: string, baseUrl: URL) =>
  new URL(path.join(baseUrl.pathname, pathname), baseUrl);

/**
 * Run an action and simultaneously wait for navigation to complete. This is
 * useful for actions that trigger navigation, such as clicking a link or
 * submitting a form.
 */
export const expectNavigation = async <T>(action: Promise<T>): Promise<T> => {
  const [result] = await Promise.all([
    action,
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  return result;
};
