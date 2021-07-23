import Koa from 'koa';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';
import signInRoutes from '@/routes/sign-in';
import registerRoutes from '@/routes/register';
import uiProxy from '@/proxies/ui';
import swaggerRoutes from '@/routes/swagger';

const createRouter = (provider: Provider): Router => {
  const router = new Router({ prefix: '/api' });

  router.use(signInRoutes(provider));
  router.use(registerRoutes());
  router.use(swaggerRoutes());

  return router;
};

export default function initRouter(app: Koa, provider: Provider): Router {
  const router = createRouter(provider);
  app.use(router.routes()).use(uiProxy()).use(router.allowedMethods());
  return router;
}
