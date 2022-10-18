import { generateKeyPairSync } from 'crypto';

import { LogtoOidcConfigKey, LogtoOidcConfigType } from '@logto/schemas';

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

export const getOidcConfigs = async (): Promise<LogtoOidcConfigType> => ({
  [LogtoOidcConfigKey.PrivateKeys]: [privateKey],
  [LogtoOidcConfigKey.CookieKeys]: ['LOGTOSEKRIT1'],
  [LogtoOidcConfigKey.RefreshTokenReuseInterval]: 3,
});
