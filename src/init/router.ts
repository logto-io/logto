import Koa from 'koa';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';
import createSignInRoutes from '@/routes/sign-in';
import createUIProxy from '@/proxies/ui';

const createRouter = (provider: Provider): Router => {
  const router = new Router();

  router.use('/api', createSignInRoutes(provider));

  return router;
};

export default function initRouter(app: Koa, provider: Provider): Router {
  const router = createRouter(provider);
  app.use(router.routes()).use(createUIProxy()).use(router.allowedMethods());
  return router;
}
