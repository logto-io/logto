import Koa from 'koa';
import logger from 'koa-logger';

import initOidc from './oidc';
import initRouter from './router';

export default async function initApp(app: Koa, port: number): Promise<void> {
  app.use(logger());

  const provider = await initOidc(app, port);
  initRouter(app, provider);

  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}
