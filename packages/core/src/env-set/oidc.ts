import crypto, { generateKeyPairSync } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

import { getEnv } from '@silverhand/essentials';
import inquirer from 'inquirer';

import { noInquiry } from './parameters';

const readPrivateKey = async (): Promise<string> => {
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
      message: `No private key found in \`${privateKeyPath}\`, would you like to generate a new one?`,
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
