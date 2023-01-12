import { readFile } from 'fs/promises';

import type { LogtoOidcConfigType } from '@logto/schemas';
import { LogtoOidcConfigKey } from '@logto/schemas';
import { getEnvAsStringArray } from '@silverhand/essentials';

import { generateOidcCookieKey, generateOidcPrivateKey } from '../utilities.js';

const isBase64FormatPrivateKey = (key: string) => !key.includes('-');

/**
 * Each config reader will do the following things in order:
 * 1. Try to read value from env (mimic the behavior from the original core)
 * 2. Generate value if #1 doesn't work
 */
export const oidcConfigReaders: {
  [key in LogtoOidcConfigKey]: () => Promise<{
    value: LogtoOidcConfigType[key];
    fromEnv: boolean;
  }>;
} = {
  /**
   * Try to read private keys with the following order:
   *
   * 1. From `process.env.OIDC_PRIVATE_KEYS`.
   * 2. Fetch path from `process.env.OIDC_PRIVATE_KEY_PATHS` then read from that path.
   *
   *
   * @returns The private keys for OIDC provider.
   * @throws An error when failed to read a private key.
   */
  [LogtoOidcConfigKey.PrivateKeys]: async () => {
    // Direct keys in env
    const privateKeys = getEnvAsStringArray('OIDC_PRIVATE_KEYS');

    if (privateKeys.length > 0) {
      return {
        value: privateKeys.map((key) => {
          if (isBase64FormatPrivateKey(key)) {
            return Buffer.from(key, 'base64').toString('utf8');
          }

          return key;
        }),
        fromEnv: true,
      };
    }

    // Read keys from files
    const privateKeyPaths = getEnvAsStringArray('OIDC_PRIVATE_KEY_PATHS');

    if (privateKeyPaths.length > 0) {
      return {
        value: await Promise.all(privateKeyPaths.map(async (path) => readFile(path, 'utf8'))),
        fromEnv: true,
      };
    }

    return {
      value: [await generateOidcPrivateKey()],
      fromEnv: false,
    };
  },
  [LogtoOidcConfigKey.CookieKeys]: async () => {
    const envKey = 'OIDC_COOKIE_KEYS';
    const keys = getEnvAsStringArray(envKey);

    return { value: keys.length > 0 ? keys : [generateOidcCookieKey()], fromEnv: keys.length > 0 };
  },
};
