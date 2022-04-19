import crypto from 'crypto';
import { readFileSync } from 'fs';

import { assertEnv, getEnv, Optional } from '@silverhand/essentials';
import { nanoid } from 'nanoid';
import { createPool, DatabasePoolType } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';
import { string, number } from 'zod';

export enum MountedApps {
  Api = 'api',
  Oidc = 'oidc',
  Console = 'console',
}

const readPrivateKey = (path: string): Optional<string> => {
  try {
    return readFileSync(path, 'utf-8');
  } catch {}
};

const loadOidcValues = (port: number) => {
  const privateKeyPath = getEnv('OIDC_PRIVATE_KEY_PATH', 'oidc-private-key.pem');
  const privateKey = crypto.createPrivateKey(readPrivateKey(privateKeyPath) ?? '');
  const publicKey = crypto.createPublicKey(privateKey);

  return {
    privateKeyPath,
    privateKey,
    publicKey,
    issuer: getEnv('OIDC_ISSUER', `http://localhost:${port}/oidc`),
    adminResource: getEnv('ADMIN_RESOURCE', 'https://api.logto.io'),
    defaultIdTokenTtl: 60 * 60,
    defaultRefreshTokenTtl: 14 * 24 * 60 * 60,
  };
};

const loadEnvValues = async () => {
  const isProduction = getEnv('NODE_ENV') === 'production';
  const isTest = getEnv('NODE_ENV') === 'test';
  const port = Number(getEnv('PORT', '3001'));
  const databaseUrl = isTest ? getEnv('DB_URL') : assertEnv('DB_URL');

  return Object.freeze({
    isTest,
    isProduction,
    databaseUrl,
    httpsCert: process.env.HTTPS_CERT,
    httpsKey: process.env.HTTPS_KEY,
    port,
    developmentUserId: getEnv('DEVELOPMENT_USER_ID'),
    trustingTlsOffloadingProxies: getEnv('TRUSTING_TLS_OFFLOADING_PROXIES') === 'true',
    passwordPeppers: string()
      .array()
      .parse(isTest ? [nanoid()] : JSON.parse(assertEnv('PASSWORD_PEPPERS'))),
    passwordIterationCount: number()
      .min(100)
      .parse(Number(getEnv('PASSWORD_ITERATION_COUNT', '1000'))),
    oidc: loadOidcValues(port),
  });
};

const throwNotLoadedError = () => {
  throw new Error(
    'Env set is not loaded. Make sure to call `await envSet.load()` before using it.'
  );
};

/* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation */
function createEnvSet() {
  let values: Optional<Awaited<ReturnType<typeof loadEnvValues>>>;
  let pool: Optional<DatabasePoolType>;

  return {
    get values() {
      if (!values) {
        return throwNotLoadedError();
      }

      return values;
    },
    get pool() {
      if (!pool) {
        return throwNotLoadedError();
      }

      return pool;
    },

    load: async () => {
      values = await loadEnvValues();

      if (!values.isTest) {
        const interceptors = [...createInterceptors()];
        pool = createPool(values.databaseUrl, { interceptors });
      }
    },
  };
}
/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

const envSet = createEnvSet();

export default envSet;
