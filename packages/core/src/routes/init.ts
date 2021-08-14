import Koa from 'koa';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';
import sessionRoutes from '@/routes/session';
import userRoutes from '@/routes/user';
import swaggerRoutes from '@/routes/swagger';
import mount from 'koa-mount';
import applicationRoutes from './application';

const createRouter = (provider: Provider): Router => {
  const router = new Router();

  sessionRoutes(router, provider);
  userRoutes(router);
  applicationRoutes(router);
  swaggerRoutes(router);

  return router;
};

export default function initRouter(app: Koa, provider: Provider) {
  const router = createRouter(provider);
  const apisApp = new Koa().use(router.routes()).use(router.allowedMethods());

  app.use(mount('/api', apisApp));
}
