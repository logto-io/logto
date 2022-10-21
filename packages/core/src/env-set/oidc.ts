import crypto from 'crypto';

import type { LogtoOidcConfigType } from '@logto/schemas';
import { LogtoOidcConfigKey } from '@logto/schemas';
import { createLocalJWKSet } from 'jose';

import { exportJWK } from '@/utils/jwks';

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

  return Object.freeze({
    cookieKeys,
    privateJwks,
    localJWKSet,
    issuer,
    refreshTokenReuseInterval,
    defaultIdTokenTtl: 60 * 60,
    defaultRefreshTokenTtl: 14 * 24 * 60 * 60,
  });
};

export default loadOidcValues;
