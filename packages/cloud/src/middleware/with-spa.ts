import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { assert } from '@silverhand/essentials';
import type { NextFunction, RequestContext } from '@withtyped/server';
import mime from 'mime-types';

import { matchPathname } from '#src/utils/url.js';

export type WithSpaConfig = {
  /**
   * Browser cache max-age in seconds.
   * @default 604_800 // 7 days
   */
  maxAge?: number;
  /** The root directory to serve files. */
  root: string;
  /**
   * The URL pathname to serve as root.
   * @default '/'
   */
  pathname?: string;
  /** An array of pathname prefixes to ignore. */
  ignorePathnames?: string[];
  /**
   * The path to file to serve when the given path cannot be found in the file system.
   * @default 'index.html'
   */
  indexPath?: string;
};

export default function withSpa<InputContext extends RequestContext>({
  maxAge = 604_800,
  root,
  pathname: rootPathname = '/',
  ignorePathnames,
  indexPath: index = 'index.html',
}: WithSpaConfig) {
  assert(root, new Error('Root directory is required to serve files.'));

  return async (context: InputContext, next: NextFunction<InputContext>) => {
    const {
      headers,
      request: { url },
    } = context;

    const pathname = matchPathname(rootPathname, url.pathname, ignorePathnames);

    if (!pathname) {
      return next(context);
    }

    const indexPath = path.resolve(root, index);
    const requestPath = path.resolve(path.join(root, pathname));
    const isHidden = pathname.split('/').some((segment) => segment.startsWith('.'));

    // Intended
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const result = (!isHidden && (await tryStat(requestPath))) || (await tryStat(indexPath));

    if (!result) {
      return next({ ...context, status: 404 });
    }

    const [pathLike, stat] = result;

    return next({
      ...context,
      headers: {
        ...headers,
        'Content-Length': stat.size,
        'Content-Type': mime.lookup(pathLike),
        'Last-Modified': stat.mtime.toUTCString(),
        'Cache-Control': `max-age=${maxAge}`,
      },
      stream: createReadStream(pathLike),
      status: 200,
    });
  };
}

const normalize = (pathLike: string) => {
  const value = path.normalize(pathLike);

  return value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
};

const tryStat = async (pathLike: string) => {
  try {
    const stat = await fs.stat(pathLike);

    if (stat.isFile()) {
      return [pathLike, stat] as const;
    }
  } catch {}
};
