import Koa from 'koa';
import logger from 'koa-logger';

import initOidc from './oidc';
import initRouter from './router';

export default async function initApp(app: Koa, port: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.use(logger());
  await initOidc(app, port);
  initRouter(app);

  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}
