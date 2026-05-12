import { Readable } from 'node:stream';

import { adminTenantId, StorageProvider } from '@logto/schemas';

import SystemContext from '#src/tenants/SystemContext.js';
import { buildUploadFile } from '#src/utils/storage/index.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

const SAFE_ID = /^[\w.-]+$/;

export default function assetsServeRoutes<T extends AnonymousRouter>(
  ...[router]: RouterInitArgs<T>
) {
  router.get('/assets/:userId/:filename', async (ctx, next) => {
    const { userId, filename } = ctx.params;

    // Validate params — no path traversal
    if (!userId || !SAFE_ID.test(userId)) {
      ctx.status = 400;
      return next();
    }
    if (!filename || filename.startsWith('.') || filename.includes('/') || filename.includes('\\') || !SAFE_ID.test(filename)) {
      ctx.status = 400;
      return next();
    }

    const { storageProviderConfig } = SystemContext.shared;
    if (
      !storageProviderConfig ||
      storageProviderConfig.provider !== StorageProvider.S3Storage
    ) {
      ctx.status = 404;
      return next();
    }

    const storage = buildUploadFile(storageProviderConfig);
    const objectKey = `${adminTenantId}/${userId}/${filename}`;

    if (!storage.downloadFile) {
      ctx.status = 500;
      return next();
    }

    try {
      const result = await storage.downloadFile(objectKey);

      ctx.set('Content-Type', result.contentType ?? 'application/octet-stream');
      if (result.contentLength) {
        ctx.set('Content-Length', String(result.contentLength));
      }
      ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
      ctx.set('Cross-Origin-Resource-Policy', 'cross-origin');
      ctx.set('X-Content-Type-Options', 'nosniff');
      ctx.status = 200;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      ctx.body = Readable.fromWeb(result.body as any);
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err.name === 'NotFound' || err.name === 'NoSuchKey') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
    }

    return next();
  });
}
