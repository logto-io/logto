import { generateKeyPair } from 'crypto';
import { promisify } from 'util';

import { nanoid } from 'nanoid';

export const generateOidcPrivateKey = async () => {
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

  return privateKey;
};

export const generateOidcCookieKey = () => nanoid();
