import crypto, { generateKeyPairSync } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

import { getEnv } from '@silverhand/essentials';
import inquirer from 'inquirer';

import { noInquiry } from './parameters';

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

  const privateKeyPath = getEnv('OIDC_PRIVATE_KEY_PATH', 'oidc-private-key.pem');

  try {
    return readFileSync(privateKeyPath, 'utf-8');
  } catch (error: unknown) {
    if (noInquiry) {
      throw error;
    }

    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `No private key found in env \`OIDC_PRIVATE_KEY\` nor \`${privateKeyPath}\`, would you like to generate a new one?`,
    });

    if (!answer.confirm) {
      throw error;
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

const loadOidcValues = async (port: number) => {
  const privateKey = crypto.createPrivateKey(await readPrivateKey());
  const publicKey = crypto.createPublicKey(privateKey);

  return Object.freeze({
    privateKey,
    publicKey,
    issuer: getEnv('OIDC_ISSUER', `http://localhost:${port}/oidc`),
    adminResource: getEnv('ADMIN_RESOURCE', 'https://api.logto.io'),
    defaultIdTokenTtl: 60 * 60,
    defaultRefreshTokenTtl: 14 * 24 * 60 * 60,
  });
};

export default loadOidcValues;
