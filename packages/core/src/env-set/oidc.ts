import crypto from 'node:crypto';

import type { LogtoOidcConfigType } from '@logto/schemas';
import {
  LogtoOidcConfigKey,
  getCurrentOidcPrivateKey,
  getOidcProviderPrivateKeys,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { createLocalJWKSet } from 'jose';

import { getOidcProviderPublicJwks } from '#src/libraries/oidc-private-key.js';
import { exportJWK } from '#src/utils/jwks.js';

const getEcSigningAlg = (crv: string | undefined) => {
  switch (crv) {
    case 'P-256': {
      return 'ES256';
    }
    case 'P-384': {
      return 'ES384';
    }
    case 'P-521': {
      return 'ES512';
    }
    default:
  }
};

const loadOidcValues = async (issuer: string, configs: LogtoOidcConfigType) => {
  const cookieKeys = configs[LogtoOidcConfigKey.CookieKeys].map(({ value }) => value);
  const currentPrivateKey = crypto.createPrivateKey(
    getCurrentOidcPrivateKey(configs[LogtoOidcConfigKey.PrivateKeys]).value
  );
  const privateKeys = getOidcProviderPrivateKeys(configs[LogtoOidcConfigKey.PrivateKeys]).map(
    ({ value }) => crypto.createPrivateKey(value)
  );
  const session = configs[LogtoOidcConfigKey.Session];
  const privateJwks = await Promise.all(privateKeys.map(async (key) => exportJWK(key)));
  const publicJwks = await getOidcProviderPublicJwks(configs[LogtoOidcConfigKey.PrivateKeys]);
  const localJWKSet = createLocalJWKSet({ keys: publicJwks });
  const currentPrivateJwk = await exportJWK(currentPrivateKey);

  /**
   * The declared algorithm must match the current key's actual curve — Logto generates P-384
   * keys, but seeded keys (`OIDC_PRIVATE_KEYS`) may be on any supported curve, and a mismatched
   * declaration falls outside the algorithms the tenant can sign with.
   * RSA keys stay `undefined` to fall back to the oidc-provider `RS256` defaults, for backwards
   * compatibility since we were using RSA keys before v1.0.0-beta.20.
   */
  const jwkSigningAlg = conditional(
    currentPrivateJwk.kty === 'EC' && getEcSigningAlg(currentPrivateJwk.crv)
  );

  return Object.freeze({
    cookieKeys,
    privateJwks,
    publicJwks,
    jwkSigningAlg,
    localJWKSet,
    sessionTtl: session.ttl,
    issuer,
  });
};

export default loadOidcValues;
