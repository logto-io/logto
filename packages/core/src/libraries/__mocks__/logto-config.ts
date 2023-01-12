import { generateKeyPairSync } from 'crypto';

import type { LogtoOidcConfigType } from '@logto/schemas';
import { LogtoOidcConfigKey } from '@logto/schemas';

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

const getOidcConfigs = async (): Promise<LogtoOidcConfigType> => ({
  [LogtoOidcConfigKey.PrivateKeys]: [privateKey],
  [LogtoOidcConfigKey.CookieKeys]: ['LOGTOSEKRIT1'],
});

export const createLogtoConfigLibrary = () => ({ getOidcConfigs });
