import type { MiddlewareType } from 'koa';
import Koa from 'koa';
import compose from 'koa-compose';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';
import type Provider from 'oidc-provider';

import { EnvSet, MountedApps } from '#src/env-set/index.js';
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
import initRouter from '#src/routes/init.js';

import Libraries from './Libraries.js';
import Queries from './Queries.js';
import type TenantContext from './TenantContext.js';
import { getTenantDatabaseDsn } from './utils.js';

export default class Tenant implements TenantContext {
  static async create(id: string): Promise<Tenant> {
    // Treat the default database URL as the management URL
    const envSet = new EnvSet(await getTenantDatabaseDsn(id));
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

    // Mount APIs
    const apisApp = initRouter({ provider, queries, libraries, modelRouters, envSet });
    app.use(mount('/api', apisApp));

    // Mount Admin Console
    app.use(koaConsoleRedirectProxy(queries));
    app.use(
      mount('/' + MountedApps.Console, koaSpaProxy(MountedApps.Console, 5002, MountedApps.Console))
    );

    // Mount demo app
    app.use(
      mount(
        '/' + MountedApps.DemoApp,
        compose([
          koaCheckDemoApp(this.queries),
          koaSpaProxy(MountedApps.DemoApp, 5003, MountedApps.DemoApp),
        ])
      )
    );

    // Mount UI
    app.use(compose([koaSpaSessionGuard(provider), koaSpaProxy()]));

    this.app = app;
    this.provider = provider;
  }
}
