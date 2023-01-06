import crypto from 'crypto';

import type { LogtoOidcConfigType } from '@logto/schemas';
import { LogtoOidcConfigKey } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { createLocalJWKSet } from 'jose';

import { exportJWK } from '#src/utils/jwks.js';

const loadOidcValues = async (issuer: string, configs: LogtoOidcConfigType) => {
  const cookieKeys = configs[LogtoOidcConfigKey.CookieKeys];
  const privateKeys = configs[LogtoOidcConfigKey.PrivateKeys].map((key) =>
    crypto.createPrivateKey(key)
  );
  const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));
  const privateJwks = await Promise.all(privateKeys.map(async (key) => exportJWK(key)));
  const publicJwks = await Promise.all(publicKeys.map(async (key) => exportJWK(key)));
  const localJWKSet = createLocalJWKSet({ keys: publicJwks });
  const refreshTokenReuseInterval = configs[LogtoOidcConfigKey.RefreshTokenReuseInterval];

  // Use ES384 if it's an Elliptic Curve key, otherwise fall back to default
  // It's for backwards compatibility since we were using RSA keys before v1.0.0-beta.20
  const jwkSigningAlg = conditional(privateJwks[0]?.kty === 'EC' && 'ES384');

  return Object.freeze({
    cookieKeys,
    privateJwks,
    jwkSigningAlg,
    localJWKSet,
    issuer,
    refreshTokenReuseInterval,
    defaultIdTokenTtl: 60 * 60,
    defaultRefreshTokenTtl: 14 * 24 * 60 * 60,
  });
};

export default loadOidcValues;
