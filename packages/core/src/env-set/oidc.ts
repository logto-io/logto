import crypto, { generateKeyPairSync } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { getEnv } from '@silverhand/essentials';
import inquirer from 'inquirer';
import { createLocalJWKSet } from 'jose';
import { nanoid } from 'nanoid';

import { exportJWK } from '@/utils/jwks';

import { appendDotEnv } from './dot-env';
import { allYes, noInquiry } from './parameters';
import { getEnvAsStringArray } from './utils';

const defaultLogtoOidcPrivateKey = './oidc-private-key.pem';

/**
 * Try to read private keys with the following order:
 *
 * 1. From `process.env.OIDC_PRIVATE_KEYS`.
 * 2. Fetch path from `process.env.OIDC_PRIVATE_KEY_PATHS` then read from that path.
 *
 * If none of above succeed, then inquire user to generate a new key if no `--no-inquiry` presents in argv.
 *
 * @returns The private keys for OIDC provider.
 * @throws An error when failed to read a private key.
 */
export const readPrivateKeys = async (): Promise<string[]> => {
  const privateKeys = getEnvAsStringArray('OIDC_PRIVATE_KEYS');

  if (privateKeys.length > 0) {
    return privateKeys;
  }

  // Downward compatibility for `OIDC_PRIVATE_KEY`
  const compatPrivateKey = getEnv('OIDC_PRIVATE_KEY');

  if (compatPrivateKey) {
    return [compatPrivateKey];
  }

  // Downward compatibility for `OIDC_PRIVATE_KEY_PATH`
  const originPrivateKeyPath = getEnv('OIDC_PRIVATE_KEY_PATH');
  const privateKeyPaths = getEnvAsStringArray(
    'OIDC_PRIVATE_KEY_PATHS',
    originPrivateKeyPath ? [originPrivateKeyPath] : []
  );

  // If no private key path is found, ask the user to generate a new one.
  if (privateKeyPaths.length === 0) {
    try {
      return [readFileSync(defaultLogtoOidcPrivateKey, 'utf8')];
    } catch (error: unknown) {
      if (noInquiry) {
        throw error;
      }

      if (!allYes) {
        const answer = await inquirer.prompt({
          type: 'confirm',
          name: 'confirm',
          message: `No private key found in env \`OIDC_PRIVATE_KEYS\` nor \`${defaultLogtoOidcPrivateKey}\`, would you like to generate a new one?`,
        });

        if (!answer.confirm) {
          throw error;
        }
      }

      const { privateKey } = generateKeyPairSync('rsa', {
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
      writeFileSync(defaultLogtoOidcPrivateKey, privateKey);

      return [privateKey];
    }
  }

  const notExistPrivateKeys = privateKeyPaths.filter((path): boolean => !existsSync(path));

  if (notExistPrivateKeys.length > 0) {
    const notExistPrivateKeysRawValue = JSON.stringify(notExistPrivateKeys);
    throw new Error(
      `Private keys ${notExistPrivateKeysRawValue} configured in env \`OIDC_PRIVATE_KEY_PATHS\` not found.`
    );
  }

  try {
    return privateKeyPaths.map((path): string => readFileSync(path, 'utf8'));
  } catch {
    const privateKeyPathsRawValue = JSON.stringify(privateKeyPaths);
    throw new Error(
      `Failed to read private keys from ${privateKeyPathsRawValue} in env \`OIDC_PRIVATE_KEY_PATHS\`.`
    );
  }
};

/**
 * Try to read the [signing cookie keys](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys) from env.
 *
 * If failed, then inquire user to generate a new keys array if no `--no-inquiry` presents in argv.
 *
 * @returns The cookie keys in array.
 */
const readCookieKeys = async (): Promise<string[]> => {
  const envKey = 'OIDC_COOKIE_KEYS';
  const keys = getEnvAsStringArray(envKey);

  if (keys.length > 0) {
    return keys;
  }

  const cookieKeysMissingError = new Error(
    `The OIDC cookie keys array is missing, Please check the value of env \`${envKey}\`.`
  );

  if (noInquiry) {
    throw cookieKeysMissingError;
  }

  if (!allYes) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `No cookie keys array found in env \`${envKey}\`, would you like to generate a new one?`,
    });

    if (!answer.confirm) {
      throw cookieKeysMissingError;
    }
  }

  const generated = [nanoid()];
  appendDotEnv(envKey, JSON.stringify(generated));

  return generated;
};

const loadOidcValues = async (issuer: string) => {
  const cookieKeys = await readCookieKeys();

  const configPrivateKeys = await readPrivateKeys();
  const privateKeys = configPrivateKeys.map((key) => crypto.createPrivateKey(key));
  const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));
  const privateJwks = await Promise.all(privateKeys.map(async (key) => exportJWK(key)));
  const publicJwks = await Promise.all(publicKeys.map(async (key) => exportJWK(key)));
  const localJWKSet = createLocalJWKSet({ keys: publicJwks });

  /**
   * This interval helps to avoid concurrency issues when exchanging the rotating refresh token multiple times within a given timeframe.
   * During the leeway window (in seconds), the consumed refresh token will be considered as valid.
   * This is useful for distributed apps and serverless apps like Next.js, in which there is no shared memory.
   */
  const refreshTokenReuseInterval = getEnv('OIDC_REFRESH_TOKEN_REUSE_INTERVAL', '3');

  return Object.freeze({
    cookieKeys,
    privateJwks,
    localJWKSet,
    issuer,
    refreshTokenReuseInterval: Number(refreshTokenReuseInterval),
    defaultIdTokenTtl: 60 * 60,
    defaultRefreshTokenTtl: 14 * 24 * 60 * 60,
  });
};

export default loadOidcValues;
