import Koa from 'koa';
import Router from 'koa-router';

const router = new Router();

router.get('/callback', (ctx) => {
  ctx.body = 'A callback';
});

export default function initRouter(app: Koa): void {
  app.use(router.routes()).use(router.allowedMethods());
}
