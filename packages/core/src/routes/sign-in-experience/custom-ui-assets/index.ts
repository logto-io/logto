import { readFile } from 'node:fs/promises';

import {
  uploadFileGuard,
  maxUploadFileSize,
  adminTenantId,
  type StorageProviderData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { MiddlewareType } from 'koa';
import pRetry, { AbortError } from 'p-retry';
import { object, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import LicenseReader from '#src/license/LicenseReader.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { streamToString } from '#src/utils/file.js';
import { buildAzureStorage } from '#src/utils/storage/azure-storage.js';
import { buildStorage } from '#src/utils/storage/index.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../../types.js';

import { unzipCustomUiAssets } from './unzip.js';

const maxRetryCount = 5;

/**
 * Outside Cloud the quota guard is a no-op, so Bring your UI is gated by the `bringYourUi`
 * entitlement of the installed license instead.
 */
const koaSelfHostedBringYourUiGuard: MiddlewareType = async (_, next) => {
  const license = await LicenseReader.shared.read(await EnvSet.sharedPool);

  assertThat(
    license?.quota.bringYourUi,
    new RequestError({
      code: 'subscription.limit_exceeded',
      status: 403,
      data: { key: 'bringYourUiEnabled' },
    })
  );

  return next();
};

/**
 * Logto Cloud: upload the zip to the `experience-zips` container, in which a blob trigger is
 * configured, and an Azure function unzips it on blob received. If the unzipping succeeds, the zip
 * is removed and the assets are stored in the `experience-blobs` container. If it fails, the error
 * message is written to an `error.log` file next to the zip.
 */
const uploadThroughAzureFunction = async (
  experienceZipsProviderConfig: StorageProviderData,
  data: Uint8Array,
  keyPrefix: string
) => {
  assertThat(experienceZipsProviderConfig.provider === 'AzureStorage', 'storage.not_configured');
  const { connectionString, container } = experienceZipsProviderConfig;
  const { uploadFile, downloadFile, isFileExisted } = buildAzureStorage(
    connectionString,
    container
  );

  const objectKey = `${keyPrefix}/assets.zip`;
  const errorLogObjectKey = `${keyPrefix}/error.log`;

  await uploadFile(data, objectKey, { contentType: 'application/zip' });

  const hasUnzipCompleted = async (retryTimes: number) => {
    const [hasZip, hasError] = await Promise.all([
      isFileExisted(objectKey),
      isFileExisted(errorLogObjectKey),
    ]);
    if (hasError) {
      const errorLogBlob = await downloadFile(errorLogObjectKey);
      const errorLog = await streamToString(errorLogBlob.readableStreamBody);
      throw new AbortError(errorLog || 'Unzipping failed.');
    }
    if (!hasZip) {
      return;
    }
    if (retryTimes > maxRetryCount) {
      throw new AbortError('Unzip timeout. Max retry count reached.');
    }
    throw new Error('Unzip in progress...');
  };

  await pRetry(hasUnzipCompleted, {
    retries: maxRetryCount,
  });
};

export default function customUiAssetsRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  const { isCloud, isDevFeaturesEnabled } = EnvSet.values;
  /**
   * Self-hosted plans: Bring your UI on the deployment's own storage, unlocked by the license.
   * Removed together with the other self-hosted plans guards at launch.
   */
  const isSelfHosted = !isCloud && isDevFeaturesEnabled;

  router.post(
    '/sign-in-exp/default/custom-ui-assets',
    isSelfHosted
      ? koaSelfHostedBringYourUiGuard
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

      const { experienceZipsProviderConfig, experienceBlobsProviderConfig } = SystemContext.shared;

      /**
       * Logto Cloud unzips through an Azure function reading the zips container. A self-hosted
       * deployment has no such function, so Core unzips the assets itself straight into the blobs
       * storage they are served from, whichever provider that is.
       */
      const providerConfig = isSelfHosted
        ? experienceBlobsProviderConfig
        : experienceZipsProviderConfig;
      assertThat(providerConfig, 'storage.not_configured');

      const customUiAssetId = generateStandardId(8);
      const keyPrefix = `${tenantId}/${customUiAssetId}`;

      try {
        const data = await readFile(file.filepath);

        await (isSelfHosted
          ? unzipCustomUiAssets(data, keyPrefix, buildStorage(providerConfig).uploadFile)
          : uploadThroughAzureFunction(providerConfig, data, keyPrefix));
      } catch (error: unknown) {
        if (error instanceof RequestError) {
          throw error;
        }

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
