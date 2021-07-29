import Koa from 'koa';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';
import signInRoutes from '@/routes/sign-in';
import registerRoutes from '@/routes/register';
import swaggerRoutes from '@/routes/swagger';
import mount from 'koa-mount';

const createRouter = (provider: Provider): Router => {
  const router = new Router();

  signInRoutes(router, provider);
  registerRoutes(router);
  swaggerRoutes(router);

  return router;
};

export default function initRouter(app: Koa, provider: Provider) {
  const router = createRouter(provider);
  const apisApp = new Koa().use(router.routes()).use(router.allowedMethods());

  app.use(mount('/api', apisApp));
}
