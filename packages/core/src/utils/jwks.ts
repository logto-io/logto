/**
 * Theses codes comes from [node-oidc-provider](https://github.com/panva/node-oidc-provider):
 * - [initialize_keystore.js](https://github.com/panva/node-oidc-provider/blob/9da61e9c9dc6152cd1140d42ea06abe1d812c286/lib/helpers/initialize_keystore.js#L13-L36)
 */

import { createHash } from 'node:crypto';

import type { JWK, KeyLike } from 'jose';
import { exportJWK as joseExportJWK } from 'jose';

const getCalculateKidComponents = (jwk: JWK) => {
  switch (jwk.kty) {
    case 'RSA': {
      return {
        e: jwk.e,
        kty: 'RSA',
        n: jwk.n,
      };
    }

    case 'EC': {
      return {
        crv: jwk.crv,
        kty: 'EC',
        x: jwk.x,
        y: jwk.y,
      };
    }

    case 'OKP': {
      return {
        crv: jwk.crv,
        kty: 'OKP',
        x: jwk.x,
      };
    }
    default:
  }
};

const calculateKid = (jwk: JWK) => {
  const components = getCalculateKidComponents(jwk);

  return createHash('sha256').update(JSON.stringify(components)).digest().toString('base64url');
};

export const exportJWK = async (key: KeyLike | Uint8Array): Promise<JWK> => {
  const jwk = await joseExportJWK(key);

  return {
    ...jwk,
    kid: calculateKid(jwk),
  };
};
