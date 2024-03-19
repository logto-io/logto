import { readFile } from 'node:fs/promises';

import type { LogtoOidcConfigType } from '@logto/schemas';
import { LogtoOidcConfigKey, logtoConfigGuards } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { getEnvAsStringArray } from '@silverhand/essentials';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import chalk from 'chalk';
import { z } from 'zod';

import { getRowsByKeys, updateValueByKey } from '../../../queries/logto-config.js';
import { consoleLog } from '../../../utils.js';
import {
  buildOidcKeyFromRawString,
  generateOidcCookieKey,
  generateOidcPrivateKey,
} from '../utils.js';

const isBase64FormatPrivateKey = (key: string) => !key.includes('-');

export const seedOidcConfigs = async (pool: DatabaseTransactionConnection, tenantId: string) => {
  const tenantPrefix = `[${tenantId}]`;
  const configGuard = z.object({
    key: z.nativeEnum(LogtoOidcConfigKey),
    value: z.unknown(),
  });
  const { rows } = await getRowsByKeys(pool, tenantId, Object.values(LogtoOidcConfigKey));
  // Filter out valid keys that hold a valid value
  const result = await Promise.all(
    rows.map<Promise<LogtoOidcConfigKey | undefined>>(async (row) => {
      try {
        const { key, value } = await configGuard.parseAsync(row);
        await logtoConfigGuards[key].parseAsync(value);

        return key;
      } catch {}
    })
  );
  const existingKeys = new Set(result.filter(Boolean));

  const validOptions = Object.values(LogtoOidcConfigKey).filter((key) => {
    const included = existingKeys.has(key);

    if (included) {
      consoleLog.info(tenantPrefix, `Key ${chalk.green(key)} exists, skipping`);
    }

    return !included;
  });

  // The awaits in loop is intended since we'd like to log info in sequence
  /* eslint-disable no-await-in-loop */
  for (const key of validOptions) {
    const { value, fromEnv } = await oidcConfigReaders[key]();

    if (fromEnv) {
      consoleLog.succeed(tenantPrefix, `Read config ${chalk.green(key)} from env`);
    } else {
      consoleLog.succeed(tenantPrefix, `Generated config ${chalk.green(key)}`);
    }

    await updateValueByKey(pool, tenantId, key, value);
  }
  /* eslint-enable no-await-in-loop */

  consoleLog.succeed(tenantPrefix, 'Seed OIDC config');
};

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
        value: privateKeys.map((key) =>
          buildOidcKeyFromRawString(
            isBase64FormatPrivateKey(key) ? Buffer.from(key, 'base64').toString('utf8') : key
          )
        ),
        fromEnv: true,
      };
    }

    // Read keys from files
    const privateKeyPaths = getEnvAsStringArray('OIDC_PRIVATE_KEY_PATHS');

    if (privateKeyPaths.length > 0) {
      const privateKeys = await Promise.all(
        privateKeyPaths.map(async (path) => readFile(path, 'utf8'))
      );
      return {
        value: privateKeys.map((key) => buildOidcKeyFromRawString(key)),
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
    const keys = getEnvAsStringArray(envKey).map((key) => ({
      id: generateStandardId(),
      value: key,
      createdAt: Math.floor(Date.now() / 1000),
    }));

    return { value: keys.length > 0 ? keys : [generateOidcCookieKey()], fromEnv: keys.length > 0 };
  },
};
