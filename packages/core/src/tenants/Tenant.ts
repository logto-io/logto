import { adminTenantId } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import Koa from 'koa';
import compose from 'koa-compose';
import koaCompress from 'koa-compress';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';
import type Provider from 'oidc-provider';

import { AdminApps, EnvSet, UserApps } from '#src/env-set/index.js';
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

  public readonly provider: Provider;
  public readonly queries: Queries;
  public readonly libraries: Libraries;

  public readonly app: Koa;

  get run(): MiddlewareType {
    if (
      EnvSet.values.isPathBasedMultiTenancy &&
      // If admin URL Set is specified, consider that URL first
      !(EnvSet.values.adminUrlSet.deduplicated().length > 0 && this.id === adminTenantId)
    ) {
      return mount('/' + this.id, this.app);
    }

    return mount(this.app);
  }

  private constructor(public readonly envSet: EnvSet, public readonly id: string) {
    const queries = new Queries(envSet.pool);
    const libraries = new Libraries(queries);
    const isAdminTenant = id === adminTenantId;
    const mountedApps = [
      ...Object.values(UserApps),
      ...(isAdminTenant ? Object.values(AdminApps) : []),
    ];

    this.envSet = envSet;
    this.queries = queries;
    this.libraries = libraries;

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
    const provider = initOidc(envSet, queries, libraries);
    app.use(mount('/oidc', provider.app));

    const tenantContext: TenantContext = {
      id,
      provider,
      queries,
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
  }
}
