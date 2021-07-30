import https from 'https';
import fs from 'fs/promises';
import Koa from 'koa';
import koaLogger from 'koa-logger';

import koaErrorHandler from '@/middleware/koa-error-handler';
import { port } from '@/consts';
import koaUIProxy from '@/middleware/koa-ui-proxy';
import initOidc from './oidc';
import initRouter from './apis';

export default async function initApp(app: Koa): Promise<void> {
  app.use(koaErrorHandler());
  app.use(koaLogger());

  const provider = await initOidc(app);
  initRouter(app, provider);

  app.use(koaUIProxy());

  const { HTTPS_CERT, HTTPS_KEY } = process.env;
  if (HTTPS_CERT && HTTPS_KEY) {
    https
      .createServer(
        { cert: await fs.readFile(HTTPS_CERT), key: await fs.readFile(HTTPS_KEY) },
        app.callback()
      )
      .listen(port, () => {
        console.log(`App is listening on port ${port} with HTTPS`);
      });
    return;
  }

  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}
