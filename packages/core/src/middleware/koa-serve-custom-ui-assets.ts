import { isFileAssetPath, parseRange } from '@logto/core-kit';
import { tryThat } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAzureStorage } from '#src/utils/storage/azure-storage.js';
import { getTenantId } from '#src/utils/tenant.js';

import RequestError from '../errors/RequestError/index.js';

const noCache = 'no-cache, no-store, must-revalidate';
const maxAgeSevenDays = 'max-age=604_800_000';

/**
 * Middleware that serves custom UI assets user uploaded previously through sign-in experience settings.
 * If the request path contains a dot, consider it as a file and will try to serve the file directly.
 * Otherwise, redirect the request to the `index.html` page.
 */
export default function koaServeCustomUiAssets(customUiAssetId: string) {
  const { experienceBlobsProviderConfig } = SystemContext.shared;
  assertThat(experienceBlobsProviderConfig?.provider === 'AzureStorage', 'storage.not_configured');

  const serve: MiddlewareType = async (ctx, next) => {
    const [tenantId] = await getTenantId(ctx.URL);
    assertThat(tenantId, 'session.not_found', 404);

    const { container, connectionString } = experienceBlobsProviderConfig;
    const { downloadFile, isFileExisted, getFileProperties } = buildAzureStorage(
      connectionString,
      container
    );

    const contextPath = `${tenantId}/${customUiAssetId}`;
    const requestPath = ctx.request.path;
    const isFileAssetRequest = isFileAssetPath(requestPath);

    const fileObjectKey = `${contextPath}${isFileAssetRequest ? requestPath : '/index.html'}`;
    const isExisted = await isFileExisted(fileObjectKey);
    assertThat(isExisted, 'entity.not_found', 404);

    const range = ctx.get('range');
    const { start, end, count } = tryThat(
      () => parseRange(range),
      new RequestError({ code: 'request.range_not_satisfiable', status: 416 })
    );

    const [
      { contentLength = 0, readableStreamBody, contentType },
      { contentLength: totalFileSize = 0 },
    ] = await Promise.all([
      downloadFile(fileObjectKey, start, count),
      getFileProperties(fileObjectKey),
    ]);

    ctx.body = readableStreamBody;
    ctx.type = contentType ?? 'application/octet-stream';
    ctx.status = range ? 206 : 200;

    ctx.set('Cache-Control', isFileAssetRequest ? maxAgeSevenDays : noCache);
    ctx.set('Content-Length', contentLength.toString());
    if (range) {
      ctx.set('Accept-Ranges', 'bytes');
      ctx.set(
        'Content-Range',
        `bytes ${start ?? 0}-${end ?? Math.max(totalFileSize - 1, 0)}/${totalFileSize}`
      );
    }

    return next();
  };

  return serve;
}
