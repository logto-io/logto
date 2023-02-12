import type { Optional } from '@silverhand/essentials';
import type { PostgreSql } from '@withtyped/postgres';
import type { QueryClient } from '@withtyped/server';
import type { DatabasePool } from 'slonik';

import { createLogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import { appendPath } from '#src/utils/url.js';

import GlobalValues from './GlobalValues.js';
import createPool from './create-pool.js';
import createQueryClient from './create-query-client.js';
import loadOidcValues from './oidc.js';
import { throwNotLoadedError } from './throw-errors.js';
import { getTenantEndpoint } from './utils.js';

/** Apps (also paths) for user tenants. */
export enum UserApps {
  Api = 'api',
  Oidc = 'oidc',
  Console = 'console',
  DemoApp = 'demo-app',
  Welcome = 'welcome',
}

/** Apps (also paths) ONLY for the admin tenant. */
export enum AdminApps {
  Me = 'me',
}

export class EnvSet {
  static values = new GlobalValues();

  static get isTest() {
    return this.values.isTest;
  }

  static get dbUrl() {
    return this.values.dbUrl;
  }

  static queryClient = createQueryClient(this.dbUrl, this.isTest);

  /** @deprecated Only for backward compatibility; Will be replaced soon. */
  static pool = createPool(this.dbUrl, this.isTest);

  #pool: Optional<DatabasePool>;
  // Use another pool for `withtyped` while adopting the new model,
  // as we cannot extract the original PgPool from slonik
  #queryClient: Optional<QueryClient<PostgreSql>>;
  #oidc: Optional<Awaited<ReturnType<typeof loadOidcValues>>>;

  constructor(public readonly tenantId: string, public readonly databaseUrl: string) {}

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

    const { getOidcConfigs } = createLogtoConfigLibrary(createLogtoConfigQueries(pool));

    const oidcConfigs = await getOidcConfigs();
    const endpoint = getTenantEndpoint(this.tenantId, EnvSet.values);
    this.#oidc = await loadOidcValues(appendPath(endpoint, '/oidc').toString(), oidcConfigs);
  }
}

export { getTenantEndpoint } from './utils.js';
