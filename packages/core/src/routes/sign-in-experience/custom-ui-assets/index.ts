import { readFile } from 'node:fs/promises';

import { uploadFileGuard, maxUploadFileSize, adminTenantId } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import pRetry, { AbortError } from 'p-retry';
import { object, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaQuotaGuard, { newKoaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { streamToString } from '#src/utils/file.js';
import { buildAzureStorage } from '#src/utils/storage/azure-storage.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../../types.js';

const maxRetryCount = 5;

export default function customUiAssetsRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  // TODO: Remove
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.post(
    '/sign-in-exp/default/custom-ui-assets',
    // Manually add this to avoid the case that the dev feature guard is removed but the quota guard is not being updated accordingly.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    EnvSet.values.isDevFeaturesEnabled
      ? newKoaQuotaGuard({ key: 'bringYourUiEnabled', quota })
      : koaQuotaGuard({ key: 'bringYourUiEnabled', quota }),
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

      const { uploadFile, downloadFile, isFileExisted } = buildAzureStorage(
        connectionString,
        container
      );

      const customUiAssetId = generateStandardId(8);
      const objectKey = `${tenantId}/${customUiAssetId}/assets.zip`;
      const errorLogObjectKey = `${tenantId}/${customUiAssetId}/error.log`;

      try {
        // Upload the zip file to `experience-zips` container, in which a blob trigger is configured,
        // and an azure function will be executed automatically to unzip the file on blob received.
        // If the unzipping process succeeds, the zip file will be removed and assets will be stored in
        // `experience-blobs` container. If it fails, the error message will be written to `error.log` file.
        await uploadFile(await readFile(file.filepath), objectKey, {
          contentType: file.mimetype,
        });

        const hasUnzipCompleted = async (retryTimes: number) => {
          if (retryTimes > maxRetryCount) {
            throw new AbortError('Unzip timeout. Max retry count reached.');
          }
          const [hasZip, hasError] = await Promise.all([
            isFileExisted(objectKey),
            isFileExisted(errorLogObjectKey),
          ]);
          if (hasZip) {
            throw new Error('Unzip in progress...');
          }
          if (hasError) {
            const errorLogBlob = await downloadFile(errorLogObjectKey);
            const errorLog = await streamToString(errorLogBlob.readableStreamBody);
            throw new AbortError(errorLog || 'Unzipping failed.');
          }
        };

        await pRetry(hasUnzipCompleted, {
          retries: maxRetryCount,
        });
      } catch (error: unknown) {
        getConsoleLogFromContext(ctx).error(error);
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
