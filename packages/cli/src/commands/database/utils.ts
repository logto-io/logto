import { generateKeyPair } from 'node:crypto';
import { promisify } from 'node:util';

import { type PrivateKey } from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';

export enum PrivateKeyType {
  RSA = 'rsa',
  EC = 'ec',
}

export const generateOidcPrivateKey = async (
  type: PrivateKeyType = PrivateKeyType.EC
): Promise<PrivateKey> => {
  if (type === PrivateKeyType.RSA) {
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

    return buildOidcKeyFromRawString(privateKey);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === PrivateKeyType.EC) {
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

    return buildOidcKeyFromRawString(privateKey);
  }

  throw new Error(`Unsupported private key ${String(type)}`);
};

export const generateOidcCookieKey = () => buildOidcKeyFromRawString(generateStandardSecret());

export const buildOidcKeyFromRawString = (raw: string) => ({
  id: generateStandardId(),
  value: raw,
  createdAt: Math.floor(Date.now() / 1000),
});
