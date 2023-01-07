import fs from 'fs/promises';
import https from 'https';

import { deduplicate } from '@silverhand/essentials';
import chalk from 'chalk';
import type Koa from 'koa';
import compose from 'koa-compose';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';

import envSet, { MountedApps } from '#src/env-set/index.js';
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

const logListening = () => {
  const { localhostUrl, endpoint } = envSet.values;

  for (const url of deduplicate([localhostUrl, endpoint])) {
    console.log(chalk.bold(chalk.green(`App is running at ${url}`)));
  }
};

export default async function initApp(app: Koa): Promise<void> {
  app.use(koaLogger());
  app.use(koaErrorHandler());
  app.use(koaOIDCErrorHandler());
  app.use(koaSlonikErrorHandler());
  app.use(koaConnectorErrorHandler());
  app.use(koaI18next());

  const provider = initOidc(app);
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

  const { isHttpsEnabled, httpsCert, httpsKey, port } = envSet.values;

  if (isHttpsEnabled && httpsCert && httpsKey) {
    https
      .createServer(
        { cert: await fs.readFile(httpsCert), key: await fs.readFile(httpsKey) },
        app.callback()
      )
      .listen(port, () => {
        logListening();
      });

    return;
  }

  app.listen(port, () => {
    logListening();
  });
}
