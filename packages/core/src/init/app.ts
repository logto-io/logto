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

  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}
