import got from 'got';
import Router from 'koa-router';
import { promisify } from 'util';
import stream from 'stream';
import { signInRoute } from '@/consts';
import { getEnv } from '@/utils/env';
import { Provider } from 'oidc-provider';

export default function createUIRoutes(provider: Provider) {
  const pipeline = promisify(stream.pipeline);
  const router = new Router();

  router.get(new RegExp(`^${signInRoute}(?:/|$)`), async (ctx) => {
    const details = await provider.interactionDetails(ctx.req, ctx.res);
    console.log('details', details);
    // CAUTION: this is for dev purpose only, add a switch if needed
    await pipeline(got.stream.get(getEnv('UI_PLAYGROUND_URL')), ctx.res);
  });
  return router.routes();
}
