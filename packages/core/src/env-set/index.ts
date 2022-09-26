import path from 'path';

import { getEnv, getEnvAsStringArray, Optional } from '@silverhand/essentials';
import { DatabasePool } from 'slonik';

import { appendPath } from '@/utils/url';

import { addConnectors } from './add-connectors';
import { checkMigrationState } from './check-migration-state';
import createPoolByEnv from './create-pool-by-env';
import loadOidcValues from './oidc';
import { isTrue } from './parameters';

export enum MountedApps {
  Api = 'api',
  Oidc = 'oidc',
  Console = 'console',
  DemoApp = 'demo-app',
  Welcome = 'welcome',
}

// eslint-disable-next-line unicorn/prefer-module
export const defaultConnectorDirectory = path.join(__dirname, '../../connectors');

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
    oidc: await loadOidcValues(appendPath(endpoint, '/oidc').toString()),
    adminConsoleUrl: appendPath(endpoint, '/console'),
    connectorDirectory: getEnv('CONNECTOR_DIRECTORY', defaultConnectorDirectory),
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
      await addConnectors(values.connectorDirectory);

      if (pool) {
        await checkMigrationState(pool);
      }
    },
  };
}
/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

const envSet = createEnvSet();

export default envSet;
