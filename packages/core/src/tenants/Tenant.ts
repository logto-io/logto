import type { MiddlewareType } from 'koa';
import Koa from 'koa';
import compose from 'koa-compose';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';
import type { Provider } from 'oidc-provider';

import { MountedApps } from '#src/env-set/index.js';
import koaCheckDemoApp from '#src/middleware/koa-check-demo-app.js';
import koaConnectorErrorHandler from '#src/middleware/koa-connector-error-handler.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import koaOIDCErrorHandler from '#src/middleware/koa-oidc-error-handler.js';
import koaRootProxy from '#src/middleware/koa-root-proxy.js';
import koaSlonikErrorHandler from '#src/middleware/koa-slonik-error-handler.js';
import koaSpaProxy from '#src/middleware/koa-spa-proxy.js';
import koaSpaSessionGuard from '#src/middleware/koa-spa-session-guard.js';
import koaWelcomeProxy from '#src/middleware/koa-welcome-proxy.js';
import initOidc from '#src/oidc/init.js';
import initRouter from '#src/routes/init.js';

export default class Tenant {
  public readonly provider: Provider;

  protected readonly app: Koa;

  get run(): MiddlewareType {
    return mount(this.app);
  }

  constructor(public id: string) {
    const app = new Koa();
    const provider = initOidc(app);

    app.use(koaLogger());
    app.use(koaErrorHandler());
    app.use(koaOIDCErrorHandler());
    app.use(koaSlonikErrorHandler());
    app.use(koaConnectorErrorHandler());
    app.use(koaI18next());

    initRouter(app, provider);

    app.use(mount('/', koaRootProxy()));

    app.use(mount('/' + MountedApps.Welcome, koaWelcomeProxy()));

    app.use(
      mount('/' + MountedApps.Console, koaSpaProxy(MountedApps.Console, 5002, MountedApps.Console))
    );

    app.use(
      mount(
        '/' + MountedApps.DemoApp,
        compose([koaCheckDemoApp(), koaSpaProxy(MountedApps.DemoApp, 5003, MountedApps.DemoApp)])
      )
    );

    app.use(compose([koaSpaSessionGuard(provider), koaSpaProxy()]));

    this.app = app;
    this.provider = provider;
  }
}
