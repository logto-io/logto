import net from 'net';

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

type MultiTenancyMode = 'domain' | 'env';

const enableMultiTenancyKey = 'ENABLE_MULTI_TENANCY';
const developmentTenantIdKey = 'DEVELOPMENT_TENANT_ID';

const loadEnvValues = () => {
  const isProduction = getEnv('NODE_ENV') === 'production';
  const isTest = getEnv('NODE_ENV') === 'test';
  const isIntegrationTest = isTrue(getEnv('INTEGRATION_TEST'));
  const isHttpsEnabled = Boolean(process.env.HTTPS_CERT_PATH && process.env.HTTPS_KEY_PATH);
  const isMultiTenancy = isTrue(getEnv(enableMultiTenancyKey));
  const port = Number(getEnv('PORT', '3001'));
  const localhostUrl = `${isHttpsEnabled ? 'https' : 'http'}://localhost:${port}`;
  const endpoint = getEnv('ENDPOINT', localhostUrl);
  const databaseUrl = tryThat(() => assertEnv('DB_URL'), throwErrorWithDsnMessage);

  const { hostname } = new URL(endpoint);
  const multiTenancyMode: MultiTenancyMode =
    isMultiTenancy && !net.isIP(hostname) && hostname !== 'localhost' ? 'domain' : 'env';
  const developmentTenantId = getEnv(developmentTenantIdKey);

  if (!isMultiTenancy && developmentTenantId) {
    throw new Error(
      `Multi-tenancy is disabled but development tenant env \`${developmentTenantIdKey}\` found. Please enable multi-tenancy by setting \`${enableMultiTenancyKey}\` to true.`
    );
  }

  if (isMultiTenancy && multiTenancyMode === 'env') {
    if (isProduction) {
      throw new Error(
        `Multi-tenancy is enabled but the endpoint is an IP address: ${endpoint.toString()}.\n\n` +
          'An endpoint with a valid domain is required for multi-tenancy mode.'
      );
    }

    console.warn(
      '[warn]',
      `Multi-tenancy is enabled but the endpoint is an IP address: ${endpoint.toString()}.\n\n` +
        `Logto is using \`${developmentTenantIdKey}\` env (current value: ${developmentTenantId}) for tenant recognition which is not supported in production.`
    );
  }

  return Object.freeze({
    isTest,
    isIntegrationTest,
    isProduction,
    isHttpsEnabled,
    isMultiTenancy,
    httpsCert: process.env.HTTPS_CERT_PATH,
    httpsKey: process.env.HTTPS_KEY_PATH,
    port,
    localhostUrl,
    endpoint,
    multiTenancyMode,
    dbUrl: databaseUrl,
    userDefaultRoleNames: getEnvAsStringArray('USER_DEFAULT_ROLE_NAMES'),
    developmentUserId: getEnv('DEVELOPMENT_USER_ID'),
    developmentTenantId,
    trustProxyHeader: isTrue(getEnv('TRUST_PROXY_HEADER')),
    adminConsoleUrl: appendPath(endpoint, '/console'),
    ignoreConnectorVersionCheck: isTrue(getEnv('IGNORE_CONNECTOR_VERSION_CHECK')),
  });
};

export class EnvSet {
  static values: ReturnType<typeof loadEnvValues> = loadEnvValues();
  static default = new EnvSet(EnvSet.values.dbUrl);

  static get isTest() {
    return this.values.isTest;
  }

  #pool: Optional<DatabasePool>;
  // Use another pool for `withtyped` while adopting the new model,
  // as we cannot extract the original PgPool from slonik
  #queryClient: Optional<QueryClient<PostgreSql>>;
  #oidc: Optional<Awaited<ReturnType<typeof loadOidcValues>>>;

  constructor(public readonly databaseUrl: string) {}

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
    const pool = await createPool(this.databaseUrl, EnvSet.isTest);

    this.#pool = pool;
    this.#queryClient = createQueryClient(this.databaseUrl, EnvSet.isTest);

    const { getOidcConfigs } = createLogtoConfigLibrary(pool);
    const [, oidcConfigs] = await Promise.all([checkAlterationState(pool), getOidcConfigs()]);
    this.#oidc = await loadOidcValues(
      appendPath(EnvSet.values.endpoint, '/oidc').toString(),
      oidcConfigs
    );
  }
}

await EnvSet.default.load();
