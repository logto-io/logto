import type { Optional } from '@silverhand/essentials';
import { getEnv, getEnvAsStringArray } from '@silverhand/essentials';
import type { PostgreSql } from '@withtyped/postgres';
import type { QueryClient } from '@withtyped/server';
import type { DatabasePool } from 'slonik';

import { getOidcConfigs } from '#src/libraries/logto-config.js';
import { appendPath } from '#src/utils/url.js';

import { checkAlterationState } from './check-alteration-state.js';
import createPoolByEnv from './create-pool-by-env.js';
import createQueryClientByEnv from './create-query-client-by-env.js';
import loadOidcValues from './oidc.js';
import { isTrue } from './parameters.js';

export enum MountedApps {
  Api = 'api',
  Oidc = 'oidc',
  Console = 'console',
  DemoApp = 'demo-app',
  Welcome = 'welcome',
}

const loadEnvValues = async () => {
  const isProduction = getEnv('NODE_ENV') === 'production';
  const isTest = getEnv('NODE_ENV') === 'test';
  const isIntegrationTest = isTrue(getEnv('INTEGRATION_TEST'));
  const isHttpsEnabled = Boolean(process.env.HTTPS_CERT_PATH && process.env.HTTPS_KEY_PATH);
  const port = Number(getEnv('PORT', '3001'));
  const localhostUrl = `${isHttpsEnabled ? 'https' : 'http'}://localhost:${port}`;
  const endpoint = getEnv('ENDPOINT', localhostUrl);

  return Object.freeze({
    isTest,
    isIntegrationTest,
    isProduction,
    isHttpsEnabled,
    httpsCert: process.env.HTTPS_CERT_PATH,
    httpsKey: process.env.HTTPS_KEY_PATH,
    port,
    localhostUrl,
    endpoint,
    userDefaultRoleNames: getEnvAsStringArray('USER_DEFAULT_ROLE_NAMES'),
    developmentUserId: getEnv('DEVELOPMENT_USER_ID'),
    trustProxyHeader: isTrue(getEnv('TRUST_PROXY_HEADER')),
    adminConsoleUrl: appendPath(endpoint, '/console'),
  });
};

const throwNotLoadedError = () => {
  throw new Error(
    'The env set is not loaded. Make sure to call `await envSet.load()` before using it.'
  );
};

/* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation */
function createEnvSet() {
  let values: Optional<Awaited<ReturnType<typeof loadEnvValues>>>;
  let pool: Optional<DatabasePool>;
  // Use another pool for `withtyped` while adopting the new model,
  // as we cannot extract the original PgPool from slonik
  let queryClient: Optional<QueryClient<PostgreSql>>;
  let oidc: Optional<Awaited<ReturnType<typeof loadOidcValues>>>;

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
    get poolSafe() {
      return pool;
    },
    get queryClient() {
      if (!queryClient) {
        return throwNotLoadedError();
      }

      return queryClient;
    },
    get queryClientSafe() {
      return queryClient;
    },
    get oidc() {
      if (!oidc) {
        return throwNotLoadedError();
      }

      return oidc;
    },
    load: async () => {
      values = await loadEnvValues();
      pool = await createPoolByEnv(values.isTest);
      queryClient = createQueryClientByEnv(values.isTest);

      const [, oidcConfigs] = await Promise.all([checkAlterationState(pool), getOidcConfigs(pool)]);
      oidc = await loadOidcValues(appendPath(values.endpoint, '/oidc').toString(), oidcConfigs);
    },
  };
}
/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

const envSet = createEnvSet();

export default envSet;
