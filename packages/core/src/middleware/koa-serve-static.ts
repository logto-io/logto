// Modified from https://github.com/koajs/static/blob/7f0ed88c8902e441da4e30b42f108617d8dff9ec/index.js

import path from 'node:path';

import type { MiddlewareType } from 'koa';
import send from 'koa-send';

import assertThat from '#src/utils/assert-that.js';

const index = 'index.html';

export default function serve(root: string) {
  assertThat(root, new Error('Root directory is required to serve files.'));

  const options: send.SendOptions = {
    root: path.resolve(root),
    index,
  };

  const serve: MiddlewareType = async (ctx, next) => {
    if (ctx.method === 'HEAD' || ctx.method === 'GET') {
      const filePath = await send(ctx, ctx.path, {
        ...options,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ...(!['/', `/${options.index || ''}`].some((path) => ctx.path.endsWith(path)) && {
          maxage: 604_800_000 /* 7 days */,
        }),
      });

      const filename = path.basename(filePath);

      // No cache for the index file
      if (filename === index || filename.startsWith(index + '.')) {
        ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }

    return next();
  };

  return serve;
}
