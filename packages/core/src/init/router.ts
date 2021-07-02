import got from 'got';
import Koa from 'koa';
import Router from 'koa-router';
import { promisify } from 'util';
import stream from 'stream';
import { signInRoute } from '../consts';
import { getEnv } from '../utils';

const pipeline = promisify(stream.pipeline);
const router = new Router();

router.get(new RegExp(`^${signInRoute}(?:/|$)`), async (ctx) => {
  // CAUTION: this is for dev purpose only, add a switch if needed
  await pipeline(got.stream.get(getEnv('PLAYGROUND_URL')), ctx.res);
});

export default function initRouter(app: Koa): void {
  app.use(router.routes()).use(router.allowedMethods());
}
