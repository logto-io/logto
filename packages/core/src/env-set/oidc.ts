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

const defaultLogtoOidcPrivateKeyPath = './oidc-private-key.pem';

const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

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

  const privateKeyPaths = getEnvAsStringArray('OIDC_PRIVATE_KEY_PATHS');

  /**
   * If neither `OIDC_PRIVATE_KEYS` nor `OIDC_PRIVATE_KEY_PATHS` is provided:
   *
   * 1. Try to read the private key from `defaultLogtoOidcPrivateKeyPath`
   * 2. If the `defaultLogtoOidcPrivateKeyPath` doesn't exist, then ask user to generate a new key.
   */
  if (privateKeyPaths.length === 0) {
    try {
      return [readFileSync(defaultLogtoOidcPrivateKeyPath, 'utf8')];
    } catch (error: unknown) {
      if (noInquiry) {
        throw error;
      }

      if (!allYes) {
        const answer = await inquirer.prompt({
          type: 'confirm',
          name: 'confirm',
          message: `No private key found in env \`OIDC_PRIVATE_KEYS\` nor \`${defaultLogtoOidcPrivateKeyPath}\`, would you like to generate a new one?`,
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
      writeFileSync(defaultLogtoOidcPrivateKeyPath, privateKey);

      return [privateKey];
    }
  }

  const nonExistentPrivateKeys = privateKeyPaths.filter((path): boolean => !existsSync(path));

  if (nonExistentPrivateKeys.length > 0) {
    throw new Error(
      `Private keys ${listFormatter.format(
        nonExistentPrivateKeys
      )} configured in env \`OIDC_PRIVATE_KEY_PATHS\` not found.`
    );
  }

  return privateKeyPaths.map((path): string => readFileSync(path, 'utf8'));
};

/**
 * Try to read the [signing cookie keys](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys) from env.
 *
 * If failed, then inquire user to generate a new keys array if no `--no-inquiry` presents in argv.
 *
 * @returns The cookie keys in array.
 */
export const readCookieKeys = async (): Promise<string[]> => {
  const envKey = 'OIDC_COOKIE_KEYS';
  const keys = getEnvAsStringArray(envKey);

  if (keys.length > 0) {
    return keys;
  }

  const cookieKeysMissingError = new Error(
    `The OIDC cookie keys are not found. Please check the value of env \`${envKey}\`.`
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

  const generated = nanoid();
  appendDotEnv(envKey, generated);

  return [generated];
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
