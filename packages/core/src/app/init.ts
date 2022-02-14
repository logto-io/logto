import fs from 'fs/promises';
import https from 'https';

import Koa from 'koa';
import koaLogger from 'koa-logger';

import { port } from '@/env/consts';
import koaErrorHandler from '@/middleware/koa-error-handler';
import koaI18next from '@/middleware/koa-i18next';
import koaUIProxy from '@/middleware/koa-ui-proxy';
import koaUserLog from '@/middleware/koa-user-log';
import initOidc from '@/oidc/init';
import initRouter from '@/routes/init';

export default async function initApp(app: Koa) {
  app.use(koaErrorHandler());
  // TODO move to specific router (LOG-454)
  app.use(koaUserLog());
  app.use(koaLogger());
  app.use(koaI18next());

  const provider = await initOidc(app);
  initRouter(app, provider);

  app.use(koaUIProxy());

  const { HTTPS_CERT, HTTPS_KEY } = process.env;

  if (HTTPS_CERT && HTTPS_KEY) {
    return https
      .createServer(
        { cert: await fs.readFile(HTTPS_CERT), key: await fs.readFile(HTTPS_KEY) },
        app.callback()
      )
      .listen(port, () => {
        console.log(`App is listening on port ${port} with HTTPS`);
      });
  }

  return app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}
