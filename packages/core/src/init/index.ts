import Koa from 'koa';
import koaLogger from 'koa-logger';

import koaErrorHandler from '@/middleware/koa-error-handler';
import initOidc from './oidc';
import initRouter from './router';

export default async function initApp(app: Koa, port: number): Promise<void> {
  app.use(koaErrorHandler());
  app.use(koaLogger());

  const provider = await initOidc(app, port);
  initRouter(app, provider);

  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}
