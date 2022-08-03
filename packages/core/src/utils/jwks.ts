/**
 * Theses codes comes from [node-oidc-provider](https://github.com/panva/node-oidc-provider):
 * - [initialize_keystore.js](https://github.com/panva/node-oidc-provider/blob/9da61e9c9dc6152cd1140d42ea06abe1d812c286/lib/helpers/initialize_keystore.js#L13-L36)
 * - [base64url.js](https://github.com/panva/node-oidc-provider/blob/9da61e9c9dc6152cd1140d42ea06abe1d812c286/lib/helpers/base64url.js)
 */

import { createHash } from 'crypto';

import { JWK, KeyLike, exportJWK as joseExportJWK } from 'jose';

const fromBase64 = (base64: string) =>
  base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const encodeBuffer = (buf: Buffer) => {
  const base64url = buf.toString('base64url');

  if (Buffer.isEncoding('base64url')) {
    return base64url;
  }

  return fromBase64(base64url);
};

const getCalculateKidComponents = (jwk: JWK) => {
  switch (jwk.kty) {
    case 'RSA':
      return {
        e: jwk.e,
        kty: 'RSA',
        n: jwk.n,
      };
    case 'EC':
      return {
        crv: jwk.crv,
        kty: 'EC',
        x: jwk.x,
        y: jwk.y,
      };
    case 'OKP':
      return {
        crv: jwk.crv,
        kty: 'OKP',
        x: jwk.x,
      };
    default:
  }
};

const calculateKid = (jwk: JWK) => {
  const components = getCalculateKidComponents(jwk);

  return encodeBuffer(createHash('sha256').update(JSON.stringify(components)).digest());
};

export const exportJWK = async (key: KeyLike | Uint8Array): Promise<JWK> => {
  const jwk = await joseExportJWK(key);

  return {
    ...jwk,
    kid: calculateKid(jwk),
  };
};
