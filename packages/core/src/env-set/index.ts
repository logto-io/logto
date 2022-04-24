import { getEnv, Optional } from '@silverhand/essentials';
import { DatabasePool } from 'slonik';

import createPoolByEnv from './create-pool-by-env';
import loadOidcValues from './oidc';
import loadPasswordValues from './password';

export enum MountedApps {
  Api = 'api',
  Oidc = 'oidc',
  Console = 'console',
}

const loadEnvValues = async () => {
  const isProduction = getEnv('NODE_ENV') === 'production';
  const isTest = getEnv('NODE_ENV') === 'test';
  const port = Number(getEnv('PORT', '3001'));

  return Object.freeze({
    isTest,
    isProduction,
    httpsCert: process.env.HTTPS_CERT,
    httpsKey: process.env.HTTPS_KEY,
    port,
    developmentUserId: getEnv('DEVELOPMENT_USER_ID'),
    trustingTlsOffloadingProxies: getEnv('TRUSTING_TLS_OFFLOADING_PROXIES') === 'true',
    password: await loadPasswordValues(isTest),
    oidc: await loadOidcValues(port),
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
  let pool: Optional<DatabasePool>;

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
      pool = await createPoolByEnv(values.isTest);
    },
  };
}
/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

const envSet = createEnvSet();

export default envSet;
