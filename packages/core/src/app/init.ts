import fs from 'fs/promises';
import https from 'https';

import chalk from 'chalk';
import Koa from 'koa';
import koaLogger from 'koa-logger';
import mount from 'koa-mount';

import envSet, { MountedApps } from '@/env-set';
import koaConnectorErrorHandler from '@/middleware/koa-connector-error-handle';
import koaErrorHandler from '@/middleware/koa-error-handler';
import koaI18next from '@/middleware/koa-i18next';
import koaLog from '@/middleware/koa-log';
import koaOIDCErrorHandler from '@/middleware/koa-oidc-error-handler';
import koaProxyGuard from '@/middleware/koa-proxy-guard';
import koaSlonikErrorHandler from '@/middleware/koa-slonik-error-handler';
import koaSpaProxy from '@/middleware/koa-spa-proxy';
import initOidc from '@/oidc/init';
import initRouter from '@/routes/init';

const logListening = (port: number, protocol: 'https' | 'http') => {
  console.log(chalk.bold(chalk.green(`App is running at ${protocol}://localhost:${port}`)));
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

  app.use(
    mount('/' + MountedApps.Console, koaSpaProxy(MountedApps.Console, 5002, MountedApps.Console))
  );

  app.use(koaProxyGuard(provider));
  app.use(koaSpaProxy());

  const { httpsCert, httpsKey, port } = envSet.values;

  if (httpsCert && httpsKey) {
    https
      .createServer(
        { cert: await fs.readFile(httpsCert), key: await fs.readFile(httpsKey) },
        app.callback()
      )
      .listen(port, () => {
        logListening(port, 'https');
      });

    return;
  }

  app.listen(port, () => {
    logListening(port, 'http');
  });
}
