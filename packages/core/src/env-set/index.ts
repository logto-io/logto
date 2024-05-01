import { ConsoleLog, GlobalValues } from '@logto/shared';
import type { Optional } from '@silverhand/essentials';
import { appendPath } from '@silverhand/essentials';
import type { DatabasePool } from '@silverhand/slonik';
import chalk from 'chalk';

import { createLogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';

import createPoolByEnv from './create-pool.js';
import loadOidcValues from './oidc.js';
import { throwNotLoadedError } from './throw-errors.js';
import { getTenantEndpoint } from './utils.js';

/** Apps (also paths) for user tenants. */
export enum UserApps {
  Api = 'api',
  Oidc = 'oidc',
  DemoApp = 'demo-app',
}

/** Apps (also paths) ONLY for the admin tenant. */
export enum AdminApps {
  Me = 'me',
  Console = 'console',
  Welcome = 'welcome',
}

export class EnvSet {
  /** The value set for global configurations.  */
  static values = new GlobalValues();

  static get dbUrl() {
    return this.values.dbUrl;
  }

  static sharedPool = createPoolByEnv(
    this.dbUrl,
    EnvSet.values.isUnitTest,
    this.values.databasePoolSize
  );

  #pool: Optional<DatabasePool>;
  #oidc: Optional<Awaited<ReturnType<typeof loadOidcValues>>>;

  constructor(
    public readonly tenantId: string,
    public readonly databaseUrl: string
  ) {}

  get pool() {
    if (!this.#pool) {
      return throwNotLoadedError();
    }

    return this.#pool;
  }

  get oidc() {
    if (!this.#oidc) {
      return throwNotLoadedError();
    }

    return this.#oidc;
  }

  async load(customDomain?: string) {
    const pool = await createPoolByEnv(
      this.databaseUrl,
      EnvSet.values.isUnitTest,
      EnvSet.values.databasePoolSize
    );

    this.#pool = pool;

    const consoleLog = new ConsoleLog(chalk.magenta('env-set'));
    const { getOidcConfigs } = createLogtoConfigLibrary({
      logtoConfigs: createLogtoConfigQueries(pool),
    });

    const oidcConfigs = await getOidcConfigs(consoleLog);
    const endpoint = customDomain
      ? new URL(customDomain)
      : getTenantEndpoint(this.tenantId, EnvSet.values);
    this.#oidc = await loadOidcValues(appendPath(endpoint, '/oidc').href, oidcConfigs);
  }

  async end() {
    await this.#pool?.end();
  }
}

export { getTenantEndpoint } from './utils.js';
