import type { MiddlewareType } from 'koa';

import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAzureStorage } from '#src/utils/storage/azure-storage.js';
import { getTenantId } from '#src/utils/tenant.js';

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
    const { downloadFile, isFileExisted } = buildAzureStorage(connectionString, container);

    const contextPath = `${tenantId}/${customUiAssetId}`;
    const requestPath = ctx.request.path;
    const isFileRequest = requestPath.includes('.');

    const fileObjectKey = `${contextPath}${isFileRequest ? requestPath : '/index.html'}`;
    const isExisted = await isFileExisted(fileObjectKey);
    assertThat(isExisted, 'entity.not_found', 404);

    const downloadResponse = await downloadFile(fileObjectKey);
    ctx.type = downloadResponse.contentType ?? 'application/octet-stream';
    ctx.body = downloadResponse.readableStreamBody;

    return next();
  };

  return serve;
}
