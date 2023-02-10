import { adminTenantId } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import Koa from 'koa';
import compose from 'koa-compose';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';
import type Provider from 'oidc-provider';

import { AdminApps, EnvSet, UserApps } from '#src/env-set/index.js';
import koaCheckDemoApp from '#src/middleware/koa-check-demo-app.js';
import koaConnectorErrorHandler from '#src/middleware/koa-connector-error-handler.js';
import koaConsoleRedirectProxy from '#src/middleware/koa-console-redirect-proxy.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import koaOIDCErrorHandler from '#src/middleware/koa-oidc-error-handler.js';
import koaSlonikErrorHandler from '#src/middleware/koa-slonik-error-handler.js';
import koaSpaProxy from '#src/middleware/koa-spa-proxy.js';
import koaSpaSessionGuard from '#src/middleware/koa-spa-session-guard.js';
import type { ModelRouters } from '#src/model-routers/index.js';
import { createModelRouters } from '#src/model-routers/index.js';
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
  public readonly modelRouters: ModelRouters;

  public readonly app: Koa;

  get run(): MiddlewareType {
    return mount(this.app);
  }

  private constructor(public readonly envSet: EnvSet, public readonly id: string) {
    const modelRouters = createModelRouters(envSet.queryClient);
    const queries = new Queries(envSet.pool);
    const libraries = new Libraries(queries, modelRouters);
    const isAdminTenant = id === adminTenantId;
    const mountedApps = [
      ...Object.values(UserApps),
      ...(isAdminTenant ? Object.values(AdminApps) : []),
    ];

    this.envSet = envSet;
    this.modelRouters = modelRouters;
    this.queries = queries;
    this.libraries = libraries;

    // Init app
    const app = new Koa();

    const provider = initOidc(envSet, queries, libraries);
    app.use(mount('/oidc', provider.app));

    app.use(koaLogger());
    app.use(koaErrorHandler());
    app.use(koaOIDCErrorHandler());
    app.use(koaSlonikErrorHandler());
    app.use(koaConnectorErrorHandler());
    app.use(koaI18next());

    const tenantContext: TenantContext = { id, provider, queries, libraries, modelRouters, envSet };
    // Mount APIs
    app.use(mount('/api', initApis(tenantContext)));

    // Mount `/me` APIs for admin tenant
    if (id === adminTenantId) {
      console.log('111111111111122221');
      app.use(mount('/me', initMeApis(tenantContext)));
    }

    // Mount Admin Console
    app.use(koaConsoleRedirectProxy(queries));
    app.use(
      mount(
        '/' + UserApps.Console,
        koaSpaProxy(mountedApps, UserApps.Console, 5002, UserApps.Console)
      )
    );

    // Mount demo app
    app.use(
      mount(
        '/' + UserApps.DemoApp,
        compose([
          koaCheckDemoApp(this.queries),
          koaSpaProxy(mountedApps, UserApps.DemoApp, 5003, UserApps.DemoApp),
        ])
      )
    );

    // Mount UI
    app.use(compose([koaSpaSessionGuard(provider), koaSpaProxy(mountedApps)]));

    this.app = app;
    this.provider = provider;
  }
}
