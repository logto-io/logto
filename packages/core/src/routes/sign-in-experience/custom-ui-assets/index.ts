import { createReadStream } from 'node:fs';

import { uploadFileGuard, maxUploadFileSize } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import etl from 'etl';
import mime from 'mime-types';
import unzipper, { type Entry } from 'unzipper';
import { object, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildUploadFile } from '#src/utils/storage/index.js';
import { getTenantId } from '#src/utils/tenant.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../../types.js';

import { checkEntryForDirectoryOrSystemFile, removeZipRootDirectory } from './utils.js';

export default function customUiAssetsRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  // TODO: Remove
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.post(
    '/sign-in-exp/custom-ui-assets',
    koaGuard({
      files: object({
        file: uploadFileGuard.array().min(1),
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

      // Check if the zip package contains an `index.html` file in root directory
      const zipDirectory = await unzipper.Open.file(file.filepath);
      assertThat(
        zipDirectory.files.some((entry) => removeZipRootDirectory(entry.path) === 'index.html'),
        'sign_in_experiences.index_page_not_found'
      );

      const { storageProviderConfig } = SystemContext.shared;
      assertThat(storageProviderConfig, 'storage.not_configured');

      const [tenantId] = await getTenantId(ctx.URL);
      assertThat(tenantId, 'guard.can_not_get_tenant_id');

      const customUiAssetId = generateStandardId(8);
      const upload = buildUploadFile(storageProviderConfig);

      try {
        // Unzip the package in memory and upload the file stream to the storage provider
        await createReadStream(file.filepath)
          // eslint-disable-next-line new-cap
          .pipe(unzipper.Parse({ forceStream: true }))
          .pipe(
            etl.map(async (entry: Entry) => {
              // Filter out directories and system files
              if (checkEntryForDirectoryOrSystemFile(entry)) {
                entry.autodrain();
                return;
              }

              const filePath = removeZipRootDirectory(entry.path);
              const uploadObjectKey = `${tenantId}/${customUiAssetId}/${filePath}`;
              await upload(await entry.buffer(), uploadObjectKey, {
                contentType: mime.lookup(entry.path) || 'application/octet-stream',
                publicUrl: storageProviderConfig.publicUrl,
              });
            })
          )
          .promise();
      } catch (error: unknown) {
        getConsoleLogFromContext(ctx).error(error);
        throw new RequestError({ code: 'storage.upload_error', status: 500 });
      }

      const { updateDefaultSignInExperience } = queries.signInExperiences;
      await updateDefaultSignInExperience({ customUiAssetId });

      ctx.body = { customUiAssetId };
      return next();
    }
  );
}
