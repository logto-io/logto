import { tryThat } from '@logto/shared';
import type { Optional } from '@silverhand/essentials';
import { assertEnv, getEnv, getEnvAsStringArray } from '@silverhand/essentials';
import type { PostgreSql } from '@withtyped/postgres';
import type { QueryClient } from '@withtyped/server';
import type { DatabasePool } from 'slonik';

import { createLogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { appendPath } from '#src/utils/url.js';

import { checkAlterationState } from './check-alteration-state.js';
import createPool from './create-pool.js';
import createQueryClient from './create-query-client.js';
import loadOidcValues from './oidc.js';
import { isTrue } from './parameters.js';
import { throwErrorWithDsnMessage, throwNotLoadedError } from './throw-errors.js';

export enum MountedApps {
  Api = 'api',
  Oidc = 'oidc',
  Console = 'console',
  DemoApp = 'demo-app',
  Welcome = 'welcome',
}

const loadEnvValues = () => {
  const isProduction = getEnv('NODE_ENV') === 'production';
  const isTest = getEnv('NODE_ENV') === 'test';
  const isIntegrationTest = isTrue(getEnv('INTEGRATION_TEST'));
  const isHttpsEnabled = Boolean(process.env.HTTPS_CERT_PATH && process.env.HTTPS_KEY_PATH);
  const port = Number(getEnv('PORT', '3001'));
  const localhostUrl = `${isHttpsEnabled ? 'https' : 'http'}://localhost:${port}`;
  const endpoint = getEnv('ENDPOINT', localhostUrl);
  const databaseUrl = tryThat(() => assertEnv('DB_URL'), throwErrorWithDsnMessage);

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
    dbUrl: databaseUrl,
    userDefaultRoleNames: getEnvAsStringArray('USER_DEFAULT_ROLE_NAMES'),
    developmentUserId: getEnv('DEVELOPMENT_USER_ID'),
    trustProxyHeader: isTrue(getEnv('TRUST_PROXY_HEADER')),
    adminConsoleUrl: appendPath(endpoint, '/console'),
  });
};

class EnvSet {
  static envValues: ReturnType<typeof loadEnvValues> = loadEnvValues();

  #pool: Optional<DatabasePool>;
  // Use another pool for `withtyped` while adopting the new model,
  // as we cannot extract the original PgPool from slonik
  #queryClient: Optional<QueryClient<PostgreSql>>;
  #oidc: Optional<Awaited<ReturnType<typeof loadOidcValues>>>;

  constructor(public readonly databaseUrl = EnvSet.envValues.dbUrl) {}

  get values() {
    return EnvSet.envValues;
  }

  get isTest() {
    return EnvSet.envValues.isTest;
  }

  get pool() {
    if (!this.#pool) {
      return throwNotLoadedError();
    }

    return this.#pool;
  }

  get poolSafe() {
    return this.#pool;
  }

  get queryClient() {
    if (!this.#queryClient) {
      return throwNotLoadedError();
    }

    return this.#queryClient;
  }

  get queryClientSafe() {
    return this.#queryClient;
  }

  get oidc() {
    if (!this.#oidc) {
      return throwNotLoadedError();
    }

    return this.#oidc;
  }

  async load() {
    const pool = await createPool(this.databaseUrl, this.isTest);

    this.#pool = pool;
    this.#queryClient = createQueryClient(this.databaseUrl, this.isTest);

    const { getOidcConfigs } = createLogtoConfigLibrary(pool);
    const [, oidcConfigs] = await Promise.all([checkAlterationState(pool), getOidcConfigs()]);
    this.#oidc = await loadOidcValues(
      appendPath(this.values.endpoint, '/oidc').toString(),
      oidcConfigs
    );
  }
}

const envSet = new EnvSet();

export default envSet;
