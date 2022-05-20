import crypto, { generateKeyPairSync } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

import { getEnv } from '@silverhand/essentials';
import inquirer from 'inquirer';
import { nanoid } from 'nanoid';

import { appendDotEnv } from './dot-env';
import { allYes, noInquiry } from './parameters';

/**
 * Try to read private key with the following order:
 *
 * 1. From `process.env.OIDC_PRIVATE_KEY`.
 * 2. Fetch path from `process.env.OIDC_PRIVATE_KEY_PATH` then read from that path.
 *
 * If none of above succeed, then inquire user to generate a new key if no `--no-inquiry` presents in argv.
 *
 * @returns The private key for OIDC provider.
 * @throws An error when failed to read a private key.
 */
const readPrivateKey = async (): Promise<string> => {
  const privateKey = getEnv('OIDC_PRIVATE_KEY');

  if (privateKey) {
    return privateKey;
  }

  const privateKeyPath = getEnv('OIDC_PRIVATE_KEY_PATH', './oidc-private-key.pem');

  try {
    return readFileSync(privateKeyPath, 'utf-8');
  } catch (error: unknown) {
    if (noInquiry) {
      throw error;
    }

    if (!allYes) {
      const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `No private key found in env \`OIDC_PRIVATE_KEY\` nor \`${privateKeyPath}\`, would you like to generate a new one?`,
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
    writeFileSync(privateKeyPath, privateKey);

    return privateKey;
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

  try {
    const keys: unknown = JSON.parse(getEnv(envKey));

    if (Array.isArray(keys) && keys.every((key): key is string => typeof key === 'string')) {
      return keys;
    }
  } catch (error: unknown) {
    if (noInquiry) {
      throw error;
    }

    if (!allYes) {
      const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `No cookie keys array found in env \`${envKey}\`, would you like to generate a new one?`,
      });

      if (!answer.confirm) {
        throw error;
      }
    }

    const generated = [nanoid()];
    appendDotEnv(envKey, JSON.stringify(generated));

    return generated;
  }

  throw new Error(
    `The OIDC cookie keys array is missing or in a wrong format. Please check the value of env \`${envKey}\`.`
  );
};

const loadOidcValues = async (defaultIssuer: string) => {
  const cookieKeys = await readCookieKeys();
  const privateKey = crypto.createPrivateKey(await readPrivateKey());
  const publicKey = crypto.createPublicKey(privateKey);

  return Object.freeze({
    cookieKeys,
    privateKey,
    publicKey,
    issuer: getEnv('OIDC_ISSUER', defaultIssuer),
    adminResource: getEnv('ADMIN_RESOURCE', 'https://api.logto.io'),
    defaultIdTokenTtl: 60 * 60,
    defaultRefreshTokenTtl: 14 * 24 * 60 * 60,
  });
};

export default loadOidcValues;
