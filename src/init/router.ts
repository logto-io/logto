import Koa from 'koa';
import Router from 'koa-router';
import { signInRoute } from '../consts';

const router = new Router();

router.get(signInRoute, (ctx) => {
  ctx.body = 'Signing in';
});

export default function initRouter(app: Koa): void {
  app.use(router.routes()).use(router.allowedMethods());
}
