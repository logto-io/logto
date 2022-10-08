import { generateKeyPair } from 'crypto';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

import { LogtoOidcConfig, logtoOidcConfigGuard } from '@logto/schemas';
import { getEnv, getEnvAsStringArray } from '@silverhand/essentials';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const isBase64FormatPrivateKey = (key: string) => !key.includes('-');

export const OidcConfigKey = logtoOidcConfigGuard.keyof();

/**
 * Each config reader will do the following things in order:
 * 1. Try to read value from env (mimic the behavior from the original core)
 * 2. Generate value if #1 doesn't work
 */
export const oidcConfigReaders: {
  [key in z.infer<typeof OidcConfigKey>]: () => Promise<{
    value: NonNullable<LogtoOidcConfig[key]>;
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
  privateKeys: async () => {
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

    // Generate a new key
    const { privateKey } = await promisify(generateKeyPair)('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return {
      value: [privateKey],
      fromEnv: false,
    };
  },
  cookieKeys: async () => {
    const envKey = 'OIDC_COOKIE_KEYS';
    const keys = getEnvAsStringArray(envKey);

    return { value: keys.length > 0 ? keys : [nanoid()], fromEnv: keys.length > 0 };
  },
  refreshTokenReuseInterval: async () => {
    const envKey = 'OIDC_REFRESH_TOKEN_REUSE_INTERVAL';
    const raw = Number(getEnv(envKey));
    const value = Math.max(3, raw || 0);

    return { value, fromEnv: raw === value };
  },
};
