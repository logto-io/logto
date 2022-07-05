import fs from 'fs/promises';
import https from 'https';

import chalk from 'chalk';
import Koa from 'koa';
import compose from 'koa-compose';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';

import envSet, { MountedApps } from '@/env-set';
import koaCheckDemoApp from '@/middleware/koa-check-demo-app';
import koaConnectorErrorHandler from '@/middleware/koa-connector-error-handler';
import koaErrorHandler from '@/middleware/koa-error-handler';
import koaI18next from '@/middleware/koa-i18next';
import koaLog from '@/middleware/koa-log';
import koaOIDCErrorHandler from '@/middleware/koa-oidc-error-handler';
import koaRootProxy from '@/middleware/koa-root-proxy';
import koaSlonikErrorHandler from '@/middleware/koa-slonik-error-handler';
import koaSpaProxy from '@/middleware/koa-spa-proxy';
import koaSpaSessionGuard from '@/middleware/koa-spa-session-guard';
import koaWelcomeProxy from '@/middleware/koa-welcome-proxy';
import initOidc from '@/oidc/init';
import initRouter from '@/routes/init';

const logListening = () => {
  const { localhostUrl, endpoint } = envSet.values;

  for (const url of new Set([localhostUrl, endpoint])) {
    console.log(chalk.bold(chalk.green(`App is running at ${url}`)));
  }
};

export default async function initApp(app: Koa): Promise<void> {
  app.use(koaErrorHandler());
  app.use(koaOIDCErrorHandler());
  app.use(koaSlonikErrorHandler());
  app.use(koaConnectorErrorHandler());

  app.use(koaLog());
  app.use(koaLogger());
  app.use(koaI18next());

  const provider = await initOidc(app);
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
