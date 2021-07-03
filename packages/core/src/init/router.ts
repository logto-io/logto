import Koa from 'koa';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';
import createSignInRoutes from '@/routes/sign-in';
import createUIRoutes from '@/routes/ui';

const createRouter = (provider: Provider): Router => {
  const router = new Router();

  router.use('/api', createSignInRoutes());
  router.use(createUIRoutes(provider));

  return router;
};

export default function initRouter(app: Koa, provider: Provider): Router {
  const router = createRouter(provider);
  app.use(router.routes()).use(router.allowedMethods());
  return router;
}
