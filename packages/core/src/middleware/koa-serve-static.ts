// Modified from https://github.com/koajs/static/blob/7f0ed88c8902e441da4e30b42f108617d8dff9ec/index.js

import fs from 'node:fs/promises';
import path from 'node:path';

import type { MiddlewareType } from 'koa';
import send from 'koa-send';

import assertThat from '#src/utils/assert-that.js';

const index = 'index.html';
const indexContentType = 'text/html; charset=utf-8';
export const isIndexPath = (path: string) =>
  ['/', `/${index}`].some((value) => path.endsWith(value));

export default function koaServeStatic(root: string) {
  assertThat(root, new Error('Root directory is required to serve files.'));

  const options: send.SendOptions = {
    root: path.resolve(root),
    index,
  };

  const serve: MiddlewareType = async (ctx, next) => {
    if (ctx.method === 'HEAD' || ctx.method === 'GET') {
      // Directly read and set the content of the index file since we need to replace the
      // placeholders in the file with the actual values. It should be OK as the index file is
      // small.
      if (isIndexPath(ctx.path)) {
        let content = await fs.readFile(path.join(root, index), 'utf8');

        // If a per-request CSP nonce is provided by previous middleware (see koa-security-headers),
        // inject it into inline <script> tags so the browser will accept them under the CSP.
        // We only add nonce to inline scripts (no src attribute) and skip if a nonce already exists.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nonce = (ctx as any).state?.cspNonce;
        if (typeof nonce === 'string' && nonce.length > 0) {
          // Add nonce attribute to opening <script> tags that do not have a src or nonce attribute.
          content = content.replace(/<script\b([^>]*)>/gi, (match, attrs) => {
            const lower = attrs.toLowerCase();
            if (lower.includes('src=') || lower.includes('nonce=')) {
              return match;
            }
            return `<script${attrs} nonce="${nonce}">`;
          });
        }

        ctx.type = indexContentType;
        ctx.body = content;
        ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        await send(ctx, ctx.path, {
          ...options,
          maxage: 604_800_000 /* 7 days */,
        });
      }
    }

    return next();
  };

  return serve;
}
