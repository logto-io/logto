import crypto, { randomInt } from 'node:crypto';
import path from 'node:path';

import { generateStandardId } from '@logto/shared';
import { assert } from '@silverhand/essentials';
import { type Page } from 'puppeteer';

import { isDevFeaturesEnabled } from './constants.js';

export const generateName = () => crypto.randomUUID();
export const generateUserId = () => crypto.randomUUID();
export const generateUsername = () => `usr_${crypto.randomUUID().replaceAll('-', '_')}`;
export const generatePassword = () => `pwd_${crypto.randomUUID().slice(0, 12)}`;

export const generateResourceName = () => `res_${crypto.randomUUID()}`;
export const generateResourceIndicator = () => `https://${crypto.randomUUID()}.logto.io`;
export const generateEmail = (domain = 'logto.io') =>
  `${crypto.randomUUID().toLowerCase()}@${domain}`;
export const generateScopeName = () => `sc:${crypto.randomUUID()}`;
export const generateRoleName = () => `role_${crypto.randomUUID()}`;
export const generateDomain = () => `${crypto.randomUUID().toLowerCase().slice(0, 5)}.example.com`;
export const generateSsoConnectorName = () => `sso_${crypto.randomUUID()}`;

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
    validCentralOfficeCodes[randomInt(0, validCentralOfficeCodes.length)] ?? '205';
  const phoneNumber = randomInt(0, 10_000).toString().padStart(4, '0');

  return plus + countryAndAreaCode + centralOfficeCode + phoneNumber;
};

/**
 * This method only generates a local phone number without a country code.
 */
export const generateNationalPhoneNumber = () => {
  const areaCode = randomInt(100, 999).toString();
  const centralOfficeCode = randomInt(100, 999).toString();
  const phoneNumber = randomInt(0, 10_000).toString().padStart(4, '0');

  return areaCode + centralOfficeCode + phoneNumber;
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
export const expectNavigation = async <T>(
  action: Promise<T>,
  page: Page = global.page
): Promise<T> => {
  const [_, result] = await Promise.all([
    /**
     * We should call `waitForNavigation` before the action or the `waitForNavigation` will encounter a timeout error randomly,
     * since sometimes the action is too fast and the `waitForNavigation` is not called before the navigation is completed.
     */
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    action,
  ]);
  return result;
};

/**
 * Build the string for a CSS selector that matches a class name.
 *
 * Since we use CSS modules, the class names are prefixed with a hash followed by a `_`.
 * For example, the class name `foo` will be transformed to `abc123_foo`. This function
 * returns a selector that matches any class name that contains `_foo`.
 *
 * It is accurate enough for our tests, as long as our class names are camelCased.
 */
export const cls = <C extends string>(className: C) => `[class*=_${className}]` as const;

/**
 * Build the string for a CSS selector that matches a class name for a `<div>` element.
 * This is a shorthand for `div${cls(className)}`.
 *
 * @example
 * ```ts
 * dcls('foo') // => 'div[class*=_foo]'
 * ```
 *
 * @see {@link cls}
 */
export const dcls = <C extends string>(className: C) => `div${cls(className)}` as const;

/** Build the string for a CSS selector that matches a `<div>` element with `aria-modal=true`. */
export const dmodal = () => `div[aria-modal=true]`;

/**
 * Generate a random test name that starts with `test_` and followed by 4 random characters.
 *
 * @example
 * ```ts
 * generateTestName() // => 'test_abc1'
 * ```
 */
export const generateTestName = () => `test_${generateStandardId(4)}`;

export const randomString = () => crypto.randomBytes(8).toString('hex');

export const devFeatureTest = Object.freeze({
  it: isDevFeaturesEnabled ? it : it.skip,
  describe: isDevFeaturesEnabled ? describe : describe.skip,
});

export const devFeatureDisabledTest = Object.freeze({
  it: isDevFeaturesEnabled ? it.skip : it,
  describe: isDevFeaturesEnabled ? describe.skip : describe,
});
