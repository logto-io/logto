import { generateKeyPair } from 'crypto';
import { promisify } from 'util';

import { generateStandardId } from '@logto/core-kit';

export const generateOidcPrivateKey = async (type: 'rsa' | 'ec' = 'ec') => {
  if (type === 'rsa') {
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
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === 'ec') {
    const { privateKey } = await promisify(generateKeyPair)('ec', {
      // https://security.stackexchange.com/questions/78621/which-elliptic-curve-should-i-use
      namedCurve: 'secp384r1',
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
  }

  throw new Error(`Unsupported private key ${String(type)}`);
};

export const generateOidcCookieKey = () => generateStandardId();
