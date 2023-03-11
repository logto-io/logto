import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import path from 'node:path';

import { assert, conditional } from '@silverhand/essentials';
import type { HttpContext, NextFunction, RequestContext } from '@withtyped/server';
import accepts from 'accepts';
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

  return async (
    context: InputContext,
    next: NextFunction<InputContext>,
    { request }: HttpContext
  ) => {
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

    const [pathLike, stat, compression] = (await tryCompressedFile(request, result[0])) ?? result;

    return next({
      ...context,
      headers: {
        ...headers,
        ...(compression && { 'Content-Encoding': compression }),
        ...(!compression && { 'Content-Length': stat.size }),
        'Content-Type': mime.lookup(result[0]), // Use the original path to lookup
        'Last-Modified': stat.mtime.toUTCString(),
        'Cache-Control': `max-age=${maxAge}`,
        ETag: `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`,
      },
      stream: createReadStream(pathLike),
      status: 200,
    });
  };
}

type CompressionEncoding = keyof typeof compressionExtensions;

const compressionExtensions = {
  br: 'br',
  gzip: 'gz',
} as const;

const compressionEncodings = Object.freeze(Object.keys(compressionExtensions));

const isValidEncoding = (value?: string): value is CompressionEncoding =>
  Boolean(value && compressionEncodings.includes(value));

const tryCompressedFile = async (request: IncomingMessage, pathLike: string) => {
  // Honor the compression preference
  const compression = conditional(accepts(request).encodings([...compressionEncodings]));

  if (!isValidEncoding(compression)) {
    return;
  }

  const result = await tryStat(pathLike + '.' + compressionExtensions[compression]);

  if (result) {
    return [...result, compression] as const;
  }
};

const tryStat = async (pathLike: string) => {
  try {
    const stat = await fs.stat(pathLike);

    if (stat.isFile()) {
      return [pathLike, stat] as const;
    }
  } catch {}
};
