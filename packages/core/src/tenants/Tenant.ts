import { adminTenantId } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import Koa from 'koa';
import compose from 'koa-compose';
import koaCompress from 'koa-compress';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';
import type Provider from 'oidc-provider';

import { AdminApps, EnvSet, UserApps } from '#src/env-set/index.js';
import { createConnectorLibrary } from '#src/libraries/connector.js';
import koaConnectorErrorHandler from '#src/middleware/koa-connector-error-handler.js';
import koaConsoleRedirectProxy from '#src/middleware/koa-console-redirect-proxy.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import koaOIDCErrorHandler from '#src/middleware/koa-oidc-error-handler.js';
import koaSlonikErrorHandler from '#src/middleware/koa-slonik-error-handler.js';
import koaSpaProxy from '#src/middleware/koa-spa-proxy.js';
import koaSpaSessionGuard from '#src/middleware/koa-spa-session-guard.js';
import initOidc from '#src/oidc/init.js';
import initMeApis from '#src/routes-me/init.js';
import initApis from '#src/routes/init.js';

import Libraries from './Libraries.js';
import Queries from './Queries.js';
import type TenantContext from './TenantContext.js';
import { getTenantDatabaseDsn } from './utils.js';

export default class Tenant implements TenantContext {
  static async create(id: string): Promise<Tenant> {
    // Treat the default database URL as the management URL
    const envSet = new EnvSet(id, await getTenantDatabaseDsn(id));
    await envSet.load();

    return new Tenant(envSet, id);
  }

  #requestCount = 0;
  #onRequestEmpty?: () => Promise<void>;

  public readonly provider: Provider;
  public readonly run: MiddlewareType;

  private readonly app: Koa;

  // eslint-disable-next-line max-params
  private constructor(
    public readonly envSet: EnvSet,
    public readonly id: string,
    public readonly queries = new Queries(envSet.pool),
    public readonly connectors = createConnectorLibrary(queries),
    public readonly libraries = new Libraries(id, queries, connectors)
  ) {
    const isAdminTenant = id === adminTenantId;
    const mountedApps = [
      ...Object.values(UserApps),
      ...(isAdminTenant ? Object.values(AdminApps) : []),
    ];

    this.envSet = envSet;

    // Init app
    const app = new Koa();

    app.use(koaLogger());
    app.use(koaErrorHandler());
    app.use(koaOIDCErrorHandler());
    app.use(koaSlonikErrorHandler());
    app.use(koaConnectorErrorHandler());
    app.use(koaI18next());
    app.use(koaCompress());

    // Mount OIDC
    const provider = initOidc(id, envSet, queries, libraries);
    app.use(mount('/oidc', provider.app));

    const tenantContext: TenantContext = {
      id,
      provider,
      queries,
      connectors,
      libraries,
      envSet,
    };
    // Mount APIs
    app.use(mount('/api', initApis(tenantContext)));

    const { isMultiTenancy } = EnvSet.values;

    // Mount admin tenant APIs and app
    if (id === adminTenantId) {
      // Mount `/me` APIs for admin tenant
      app.use(mount('/me', initMeApis(tenantContext)));

      // Mount Admin Console when needed
      // Skip in multi-tenancy mode since Logto Cloud serves Admin Console in this case
      if (!isMultiTenancy) {
        app.use(koaConsoleRedirectProxy(queries));
        app.use(
          mount(
            '/' + AdminApps.Console,
            koaSpaProxy(mountedApps, AdminApps.Console, 5002, AdminApps.Console)
          )
        );
      }
    }

    // In OSS, no need for mounting demo app in the admin tenant since it may cause confusion
    // while distinguishing "demo app from admin tenant" and "demo app from user tenant";
    // on the cloud, we need to configure admin tenant sign-in experience, so a preview is needed for
    // testing without signing out of the admin console.
    if (id !== adminTenantId || isMultiTenancy) {
      // Mount demo app
      app.use(
        mount(
          '/' + UserApps.DemoApp,
          koaSpaProxy(mountedApps, UserApps.DemoApp, 5003, UserApps.DemoApp)
        )
      );
    }

    // Mount UI
    app.use(compose([koaSpaSessionGuard(provider, queries), koaSpaProxy(mountedApps)]));

    this.app = app;
    this.provider = provider;

    const { isPathBasedMultiTenancy, adminUrlSet } = EnvSet.values;
    this.run =
      isPathBasedMultiTenancy &&
      // If admin URL Set is specified, consider that URL first
      !(adminUrlSet.deduplicated().length > 0 && this.id === adminTenantId)
        ? mount('/' + this.id, this.app)
        : mount(this.app);
  }

  public requestStart() {
    this.#requestCount += 1;
  }

  public requestEnd() {
    if (this.#requestCount > 0) {
      this.#requestCount -= 1;

      if (this.#requestCount === 0) {
        void this.#onRequestEmpty?.();
      }
    }
  }

  /**
   * Try to dispose the tenant resources. If there are any pending requests, this function will wait for them to end with 5s timeout.
   *
   * Currently this function only ends the database pool.
   *
   * @returns Resolves `true` for a normal disposal and `'timeout'` for a timeout.
   */
  public async dispose() {
    if (this.#requestCount <= 0) {
      await this.envSet.end();

      return true;
    }

    return new Promise<true | 'timeout'>((resolve) => {
      const timeout = setTimeout(async () => {
        this.#onRequestEmpty = undefined;
        await this.envSet.end();
        resolve('timeout');
      }, 5000);

      this.#onRequestEmpty = async () => {
        clearTimeout(timeout);
        await this.envSet.end();
        resolve(true);
      };
    });
  }
}
