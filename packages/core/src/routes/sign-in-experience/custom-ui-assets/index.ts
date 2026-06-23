import { readFile } from 'node:fs/promises';

import { uploadFileGuard, maxUploadFileSize, adminTenantId } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import pRetry, { AbortError } from 'p-retry';
import { object, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { streamToString } from '#src/utils/file.js';
import { buildAzureStorage } from '#src/utils/storage/azure-storage.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../../types.js';

const maxRetryCount = 5;

const getBlobEndpointHost = (connectionString: string) => {
  const blobEndpoint = /(?:^|;)BlobEndpoint=([^;]+)/u.exec(connectionString)?.[1];

  if (blobEndpoint) {
    try {
      return new URL(blobEndpoint).host;
    } catch {
      return 'invalid-blob-endpoint';
    }
  }

  return /(?:^|;)AccountName=([^;]+)/u.exec(connectionString)?.[1];
};

const getErrorProperty = (error: unknown, property: string) => {
  if (typeof error !== 'object' || error === null || !(property in error)) {
    return;
  }

  const value: unknown = Reflect.get(error, property);

  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
};

const getStorageErrorDiagnostics = (error: unknown) => ({
  name: error instanceof Error ? error.name : undefined,
  message: error instanceof Error ? error.message : String(error),
  code: getErrorProperty(error, 'code'),
  errno: getErrorProperty(error, 'errno'),
  type: getErrorProperty(error, 'type'),
});

export default function customUiAssetsRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  router.post(
    '/sign-in-exp/default/custom-ui-assets',
    koaQuotaGuard({ key: 'bringYourUiEnabled', quota }),
    koaGuard({
      files: object({
        file: uploadFileGuard.array().min(1).max(1),
      }),
      response: z.object({
        customUiAssetId: z.string(),
      }),
      status: [200, 400, 500],
    }),
    async (ctx, next) => {
      const { file: bodyFiles } = ctx.guard.files;
      const file = bodyFiles[0];

      assertThat(file, 'guard.invalid_input');
      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');
      assertThat(file.mimetype === 'application/zip', 'guard.mime_type_not_allowed');

      const [tenantId] = await getTenantId(ctx.URL);
      assertThat(tenantId, 'guard.can_not_get_tenant_id');
      assertThat(tenantId !== adminTenantId, 'guard.not_allowed_for_admin_tenant');

      const { experienceZipsProviderConfig } = SystemContext.shared;
      assertThat(
        experienceZipsProviderConfig?.provider === 'AzureStorage',
        'storage.not_configured'
      );
      const { connectionString, container } = experienceZipsProviderConfig;
      const blobEndpointHost = getBlobEndpointHost(connectionString);

      const { uploadFile, downloadFile, isFileExisted } = buildAzureStorage(
        connectionString,
        container
      );

      const customUiAssetId = generateStandardId(8);
      const objectKey = `${tenantId}/${customUiAssetId}/assets.zip`;
      const errorLogObjectKey = `${tenantId}/${customUiAssetId}/error.log`;
      const consoleLog = getConsoleLogFromContext(ctx);

      try {
        // Upload the zip file to `experience-zips` container, in which a blob trigger is configured,
        // and an azure function will be executed automatically to unzip the file on blob received.
        // If the unzipping process succeeds, the zip file will be removed and assets will be stored in
        // `experience-blobs` container. If it fails, the error message will be written to `error.log` file.
        await uploadFile(await readFile(file.filepath), objectKey, {
          contentType: file.mimetype,
        });
        consoleLog.info('[custom-ui-assets] uploaded zip for unzip polling', {
          tenantId,
          customUiAssetId,
          container,
          blobEndpointHost,
          objectKey,
          errorLogObjectKey,
        });

        const hasUnzipCompleted = async (retryTimes: number) => {
          const startedAt = Date.now();
          const logContext = {
            retryTimes,
            maxRetryCount,
            tenantId,
            customUiAssetId,
            container,
            blobEndpointHost,
          };
          const checkFileExisted = async (objectKeyToCheck: string, target: 'zip' | 'errorLog') => {
            const checkStartedAt = Date.now();
            consoleLog.info('[custom-ui-assets] unzip polling exists check started', {
              ...logContext,
              target,
              objectKey: objectKeyToCheck,
            });

            try {
              const exists = await isFileExisted(objectKeyToCheck);
              consoleLog.info('[custom-ui-assets] unzip polling exists check succeeded', {
                ...logContext,
                target,
                objectKey: objectKeyToCheck,
                exists,
                durationMs: Date.now() - checkStartedAt,
              });
              return exists;
            } catch (error: unknown) {
              consoleLog.error('[custom-ui-assets] unzip polling exists check failed', {
                ...logContext,
                target,
                objectKey: objectKeyToCheck,
                durationMs: Date.now() - checkStartedAt,
                error: getStorageErrorDiagnostics(error),
              });
              throw error;
            }
          };
          const [hasZip, hasError] = await Promise.all([
            checkFileExisted(objectKey, 'zip'),
            checkFileExisted(errorLogObjectKey, 'errorLog'),
          ]);
          consoleLog.info('[custom-ui-assets] unzip polling status', {
            ...logContext,
            objectKey,
            errorLogObjectKey,
            hasZip,
            hasError,
            durationMs: Date.now() - startedAt,
          });
          if (hasError) {
            const errorLogBlob = await downloadFile(errorLogObjectKey);
            const errorLog = await streamToString(errorLogBlob.readableStreamBody);
            throw new AbortError(errorLog || 'Unzipping failed.');
          }
          if (!hasZip) {
            consoleLog.info('[custom-ui-assets] unzip polling completed', {
              retryTimes,
              maxRetryCount,
              tenantId,
              customUiAssetId,
              container,
              blobEndpointHost,
              objectKey,
            });
            return;
          }
          if (retryTimes > maxRetryCount) {
            consoleLog.warn('[custom-ui-assets] unzip polling timeout', {
              retryTimes,
              maxRetryCount,
              tenantId,
              customUiAssetId,
              container,
              blobEndpointHost,
              objectKey,
              errorLogObjectKey,
            });
            throw new AbortError('Unzip timeout. Max retry count reached.');
          }
          throw new Error('Unzip in progress...');
        };

        await pRetry(hasUnzipCompleted, {
          retries: maxRetryCount,
        });
      } catch (error: unknown) {
        consoleLog.error(error);
        throw new RequestError(
          {
            code: 'storage.upload_error',
            status: 500,
          },
          {
            details: error instanceof Error ? error.message : String(error),
          }
        );
      }

      ctx.body = { customUiAssetId };
      return next();
    }
  );
}
