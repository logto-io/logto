// Modified from https://github.com/koajs/static/blob/7f0ed88c8902e441da4e30b42f108617d8dff9ec/index.js

import path from 'path';

import buildDebug from 'debug';
import { MiddlewareType } from 'koa';
import send from 'koa-send';

import assertThat from '@/utils/assert-that';

const debug = buildDebug('koa-static');

export default function serve(root: string) {
  assertThat(root, new Error('Root directory is required to serve files.'));

  const options: send.SendOptions = {
    root: path.resolve(root),
    index: 'index.html',
  };

  debug('static "%s"', root);

  const serve: MiddlewareType = async (ctx, next) => {
    if (ctx.method === 'HEAD' || ctx.method === 'GET') {
      await send(ctx, ctx.path, {
        ...options,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ...(!['/', `/${options.index || ''}`].some((path) => ctx.path.endsWith(path)) && {
          maxage: 604_800_000 /* 7 days */,
        }),
      });
    }

    return next();
  };

  return serve;
}
